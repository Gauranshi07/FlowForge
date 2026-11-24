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

describe("Tasks API integration (MongoDB)", () => {
  let server;
  let baseUrl;
  let firstUser;
  let secondUser;
  let firstProject;
  let secondProject;
  let firstToken;
  let secondToken;

  before(async () => {
    await connectDB();

    const suffix = randomUUID();
    [firstUser, secondUser] = await User.create([
      {
        name: "Task API integration user one",
        email: `task-api-one-${suffix}@example.test`,
        password: "integration-password-one",
      },
      {
        name: "Task API integration user two",
        email: `task-api-two-${suffix}@example.test`,
        password: "integration-password-two",
      },
    ]);

    [firstProject, secondProject] = await Project.create([
      { name: "Task API integration project one", owner: firstUser._id },
      { name: "Task API integration project two", owner: secondUser._id },
    ]);

    firstToken = signAccessToken(firstUser._id);
    secondToken = signAccessToken(secondUser._id);
    server = app.listen(0);
    await new Promise((resolve, reject) => {
      server.once("listening", resolve);
      server.once("error", reject);
    });
    baseUrl = `http://127.0.0.1:${server.address().port}/api/tasks`;
  });

  after(async () => {
    try {
      if (firstProject || secondProject) {
        const projectIds = [firstProject?._id, secondProject?._id].filter(Boolean);
        await Task.deleteMany({ project: { $in: projectIds } });
        await Project.deleteMany({ _id: { $in: projectIds } });
      }

      const userIds = [firstUser?._id, secondUser?._id].filter(Boolean);
      if (userIds.length) {
        await Task.deleteMany({ createdBy: { $in: userIds } });
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

  const request = (path = "", { token, method = "GET", body } = {}) =>
    fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(body ? { "content-type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

  const json = async (response) => response.json();

  it("creates tasks with defaults and lists/filter tasks by project, status, and priority", async () => {
    const createTodo = await request("", {
      token: firstToken,
      method: "POST",
      body: {
        title: "  Prepare release  ",
        description: "  Draft notes  ",
        project: firstProject._id.toString(),
      },
    });
    assert.equal(createTodo.status, 201);
    const todoBody = await json(createTodo);
    const todo = todoBody.data.task;
    assert.equal(todo.title, "Prepare release");
    assert.equal(todo.description, "Draft notes");
    assert.equal(todo.status, "Todo");
    assert.equal(todo.priority, "Medium");
    assert.equal(todo.createdBy, firstUser._id.toString());

    const createDone = await request("", {
      token: firstToken,
      method: "POST",
      body: {
        title: "Review release",
        project: firstProject._id.toString(),
        status: "Done",
        priority: "High",
        dueDate: "2027-01-15",
      },
    });
    assert.equal(createDone.status, 201);
    const doneTask = (await json(createDone)).data.task;

    const allTasks = await request("", { token: firstToken });
    assert.deepEqual(
      (await json(allTasks)).data.tasks.map(({ _id }) => _id).sort(),
      [todo._id, doneTask._id].sort(),
    );

    for (const [filters, expectedIds] of [
      [`?project=${firstProject._id}`, [todo._id, doneTask._id]],
      ["?status=Done", [doneTask._id]],
      ["?priority=High", [doneTask._id]],
      [`?project=${firstProject._id}&status=Done&priority=High`, [doneTask._id]],
    ]) {
      const response = await request(filters, { token: firstToken });
      assert.equal(response.status, 200);
      assert.deepEqual(
        (await json(response)).data.tasks.map(({ _id }) => _id).sort(),
        expectedIds.sort(),
      );
    }
  });

  it("gets, updates, and deletes an owned task", async () => {
    const created = await request("", {
      token: firstToken,
      method: "POST",
      body: { title: "Update lifecycle", project: firstProject._id.toString() },
    });
    const task = (await json(created)).data.task;

    const fetched = await request(`/${task._id}`, { token: firstToken });
    assert.equal(fetched.status, 200);
    assert.equal((await json(fetched)).data.task._id, task._id);

    const updated = await request(`/${task._id}`, {
      token: firstToken,
      method: "PUT",
      body: {
        title: "Updated lifecycle",
        status: "In Progress",
        project: firstProject._id.toString(),
      },
    });
    assert.equal(updated.status, 200);
    const updatedTask = (await json(updated)).data.task;
    assert.equal(updatedTask.title, "Updated lifecycle");
    assert.equal(updatedTask.status, "In Progress");

    const deleted = await request(`/${task._id}`, {
      token: firstToken,
      method: "DELETE",
    });
    assert.equal(deleted.status, 200);
    assert.equal(
      (await request(`/${task._id}`, { token: firstToken })).status,
      404,
    );
  });

  it("requires authentication and rejects invalid IDs and task input", async () => {
    for (const [path, options] of [
      ["", { method: "GET" }],
      ["", { method: "POST", body: { title: "Missing auth" } }],
      ["/507f1f77bcf86cd799439011", { method: "GET" }],
    ]) {
      assert.equal((await request(path, options)).status, 401);
    }

    assert.equal(
      (await request("/not-an-id", { token: firstToken })).status,
      400,
    );
    for (const body of [
      { title: "Missing project" },
      { title: "   ", project: firstProject._id.toString() },
      { title: "Bad status", project: firstProject._id.toString(), status: "Later" },
      {
        title: "Bad priority",
        project: firstProject._id.toString(),
        priority: "Urgent",
      },
      {
        title: "Bad date",
        project: firstProject._id.toString(),
        dueDate: "2026-02-30",
      },
      {
        title: "Spoof creator",
        project: firstProject._id.toString(),
        createdBy: secondUser._id.toString(),
      },
      { title: "Bad project ID", project: "not-an-id" },
    ]) {
      const response = await request("", {
        token: firstToken,
        method: "POST",
        body,
      });
      assert.equal(response.status, 400, JSON.stringify(body));
    }
  });

  it("rejects foreign-project creation, filtering, task access, and reassignment", async () => {
    const foreignCreate = await request("", {
      token: firstToken,
      method: "POST",
      body: {
        title: "Foreign project",
        project: secondProject._id.toString(),
      },
    });
    assert.equal(foreignCreate.status, 404);

    const foreignFilter = await request(`?project=${secondProject._id}`, {
      token: firstToken,
    });
    assert.equal(foreignFilter.status, 404);

    const secondUserTask = await request("", {
      token: secondToken,
      method: "POST",
      body: {
        title: "Private task",
        project: secondProject._id.toString(),
      },
    });
    assert.equal(secondUserTask.status, 201);
    const taskId = (await json(secondUserTask)).data.task._id;

    for (const [method, body] of [
      ["GET", undefined],
      ["PUT", { title: "Changed by another user" }],
      ["DELETE", undefined],
    ]) {
      const response = await request(`/${taskId}`, {
        token: firstToken,
        method,
        body,
      });
      assert.equal(response.status, 404);
    }

    const reassignmentSource = await request("", {
      token: firstToken,
      method: "POST",
      body: { title: "Reassignment guard", project: firstProject._id.toString() },
    });
    const sourceTaskId = (await json(reassignmentSource)).data.task._id;
    const reassignment = await request(`/${sourceTaskId}`, {
      token: firstToken,
      method: "PUT",
      body: { project: secondProject._id.toString() },
    });
    assert.equal(reassignment.status, 404);
  });
});
