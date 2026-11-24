import "../src/config/env.js";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, describe, it } from "node:test";
import mongoose from "mongoose";
import app from "../src/app.js";
import { connectDB } from "../src/config/db.js";
import Project from "../src/models/Project.js";
import Task from "../src/models/Task.js";
import User from "../src/models/User.js";
import { signAccessToken } from "../src/utils/jwt.js";

describe("Dashboard summary API integration (MongoDB)", () => {
  let server;
  let baseUrl;
  let firstUser;
  let secondUser;
  let firstToken;
  let secondToken;
  let firstProject;
  let secondProject;
  let emptyProject;
  let secondUserProject;
  let seededTasks = [];
  let apiCreatedProjectId;

  before(async () => {
    await connectDB();

    const suffix = randomUUID();
    [firstUser, secondUser] = await User.create([
      {
        name: "Dashboard integration user one",
        email: `dashboard-one-${suffix}@example.test`,
        password: "integration-password-one",
      },
      {
        name: "Dashboard integration user two",
        email: `dashboard-two-${suffix}@example.test`,
        password: "integration-password-two",
      },
    ]);

    [firstProject, secondProject, emptyProject, secondUserProject] =
      await Project.create([
        { name: `Dashboard Alpha ${suffix}`, owner: firstUser._id },
        { name: `Dashboard Beta ${suffix}`, owner: firstUser._id },
        { name: `Dashboard Empty ${suffix}`, owner: firstUser._id },
        { name: `Dashboard Private ${suffix}`, owner: secondUser._id },
      ]);

    seededTasks = await Task.create([
      {
        title: `Dashboard todo ${suffix}`,
        project: firstProject._id,
        createdBy: firstUser._id,
        status: "Todo",
      },
      {
        title: `Dashboard in progress ${suffix}`,
        project: firstProject._id,
        createdBy: firstUser._id,
        status: "In Progress",
      },
      {
        title: `Dashboard completed one ${suffix}`,
        project: firstProject._id,
        createdBy: firstUser._id,
        status: "Done",
      },
      {
        title: `Dashboard completed two ${suffix}`,
        project: firstProject._id,
        createdBy: firstUser._id,
        status: "Done",
      },
      {
        title: `Dashboard pending beta ${suffix}`,
        project: secondProject._id,
        createdBy: firstUser._id,
        status: "Todo",
      },
      {
        title: `Dashboard private task ${suffix}`,
        project: secondUserProject._id,
        createdBy: secondUser._id,
        status: "Done",
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 10));
    seededTasks[0].description = "Recently updated integration task.";
    await seededTasks[0].save();

    firstToken = signAccessToken(firstUser._id);
    secondToken = signAccessToken(secondUser._id);
    server = app.listen(0);
    await new Promise((resolve, reject) => {
      server.once("listening", resolve);
      server.once("error", reject);
    });
    baseUrl = `http://127.0.0.1:${server.address().port}/api`;
  });

  after(async () => {
    try {
      const userIds = [firstUser?._id, secondUser?._id].filter(Boolean);
      const projectIds = [
        firstProject?._id,
        secondProject?._id,
        emptyProject?._id,
        secondUserProject?._id,
        apiCreatedProjectId,
      ].filter(Boolean);

      if (userIds.length || projectIds.length) {
        await Task.deleteMany({
          $or: [
            ...(userIds.length ? [{ createdBy: { $in: userIds } }] : []),
            ...(projectIds.length ? [{ project: { $in: projectIds } }] : []),
          ],
        });
      }
      if (projectIds.length) {
        await Project.deleteMany({ _id: { $in: projectIds } });
      }
      if (userIds.length) {
        await User.deleteMany({ _id: { $in: userIds } });
      }
    } finally {
      if (server) {
        await new Promise((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
        });
      }
      await mongoose.disconnect();
    }
  });

  const request = (path, { token, method = "GET", body } = {}) =>
    fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(body ? { "content-type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

  const getSummary = async (token) => {
    const response = await request("/dashboard/summary", { token });
    assert.equal(response.status, 200);
    return (await response.json()).data.summary;
  };

  it("calculates owner-scoped statistics, progress, recent tasks, and live changes", async () => {
    assert.equal((await request("/dashboard/summary")).status, 401);

    const initial = await getSummary(firstToken);
    assert.deepEqual(initial.statistics, {
      totalProjects: 3,
      totalTasks: 5,
      completedTasks: 2,
      pendingTasks: 2,
      inProgressTasks: 1,
      remainingTasks: 3,
      completionPercentage: 40,
    });
    assert.deepEqual(
      initial.projects.map(({ name, totalTasks, completedTasks, completionPercentage }) => ({
        name,
        totalTasks,
        completedTasks,
        completionPercentage,
      })),
      [
        {
          name: firstProject.name,
          totalTasks: 4,
          completedTasks: 2,
          completionPercentage: 50,
        },
        {
          name: secondProject.name,
          totalTasks: 1,
          completedTasks: 0,
          completionPercentage: 0,
        },
        {
          name: emptyProject.name,
          totalTasks: 0,
          completedTasks: 0,
          completionPercentage: 0,
        },
      ],
    );
    assert.equal(initial.recentTasks.length, 5);
    assert.equal(initial.recentTasks[0].title, seededTasks[0].title);
    assert.equal(initial.recentTasks[0].project.name, firstProject.name);

    const otherUserSummary = await getSummary(secondToken);
    assert.equal(otherUserSummary.statistics.totalProjects, 1);
    assert.equal(otherUserSummary.statistics.totalTasks, 1);
    assert.equal(otherUserSummary.statistics.completedTasks, 1);
    assert.equal(otherUserSummary.projects[0].name, secondUserProject.name);
    assert.equal(
      otherUserSummary.recentTasks.some(
        ({ title }) => title === seededTasks[0].title,
      ),
      false,
    );

    const createdTaskResponse = await request("/tasks", {
      token: firstToken,
      method: "POST",
      body: {
        title: "Dashboard API created task",
        project: secondProject._id.toString(),
      },
    });
    assert.equal(createdTaskResponse.status, 201);
    const createdTask = (await createdTaskResponse.json()).data.task;
    let updated = await getSummary(firstToken);
    assert.equal(updated.statistics.totalTasks, 6);
    assert.equal(updated.statistics.pendingTasks, 3);
    assert.equal(
      updated.projects.find(({ _id }) => _id === secondProject._id.toString())
        .totalTasks,
      2,
    );

    const updateResponse = await request(`/tasks/${createdTask._id}`, {
      token: firstToken,
      method: "PUT",
      body: { status: "Done" },
    });
    assert.equal(updateResponse.status, 200);
    updated = await getSummary(firstToken);
    assert.equal(updated.statistics.completedTasks, 3);
    assert.equal(updated.statistics.pendingTasks, 2);

    const deleteResponse = await request(`/tasks/${createdTask._id}`, {
      token: firstToken,
      method: "DELETE",
    });
    assert.equal(deleteResponse.status, 200);
    updated = await getSummary(firstToken);
    assert.equal(updated.statistics.totalTasks, 5);

    const createdProjectResponse = await request("/projects", {
      token: firstToken,
      method: "POST",
      body: { name: "Dashboard API created project" },
    });
    assert.equal(createdProjectResponse.status, 201);
    const createdProject = (await createdProjectResponse.json()).data.project;
    apiCreatedProjectId = createdProject._id;
    updated = await getSummary(firstToken);
    assert.equal(updated.statistics.totalProjects, 4);

    const deleteProjectResponse = await request(
      `/projects/${createdProject._id}`,
      { token: firstToken, method: "DELETE" },
    );
    assert.equal(deleteProjectResponse.status, 200);
    updated = await getSummary(firstToken);
    assert.equal(updated.statistics.totalProjects, 3);
  });
});
