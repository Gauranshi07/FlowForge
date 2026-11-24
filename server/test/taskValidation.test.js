import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  validateTaskFilters,
  validateTaskInput,
} from "../src/utils/taskValidation.js";

const projectId = "507f1f77bcf86cd799439011";

describe("task validation", () => {
  it("normalizes valid task input and accepts supported status, priority, and date values", () => {
    const task = validateTaskInput({
      title: "  Ship release  ",
      description: "  Release notes  ",
      project: projectId,
      status: "In Progress",
      priority: "High",
      dueDate: "2027-01-15",
    });

    assert.equal(task.title, "Ship release");
    assert.equal(task.description, "Release notes");
    assert.equal(task.project, projectId);
    assert.equal(task.status, "In Progress");
    assert.equal(task.priority, "High");
    assert.equal(task.dueDate.toISOString(), "2027-01-15T00:00:00.000Z");
  });

  it("rejects invalid titles, IDs, enum values, dates, and creator overrides", () => {
    const invalidInputs = [
      { title: " ", project: projectId },
      { title: "Missing project" },
      { title: "Invalid project", project: "not-an-id" },
      { title: "Invalid status", project: projectId, status: "Later" },
      { title: "Invalid priority", project: projectId, priority: "Urgent" },
      { title: "Invalid date", project: projectId, dueDate: "2026-02-30" },
      { title: "Spoofed creator", project: projectId, createdBy: projectId },
    ];

    for (const input of invalidInputs) {
      assert.throws(() => validateTaskInput(input), { statusCode: 400 });
    }
  });

  it("supports partial updates and validates optional filters", () => {
    const update = validateTaskInput(
      { dueDate: null, status: "Done" },
      { partial: true },
    );
    assert.equal(update.dueDate, undefined);
    assert.equal(update.status, "Done");

    assert.deepEqual(validateTaskFilters({ project: projectId, priority: "Low" }), {
      project: projectId,
      priority: "Low",
    });
    assert.throws(() => validateTaskInput({}, { partial: true }), {
      statusCode: 400,
    });
    assert.throws(() => validateTaskFilters({ status: "Later" }), {
      statusCode: 400,
    });
    assert.throws(() => validateTaskFilters({ owner: projectId }), {
      statusCode: 400,
    });
  });
});
