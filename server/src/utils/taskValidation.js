import { httpError } from "./httpError.js";

const statuses = ["Todo", "In Progress", "Done"];
const priorities = ["Low", "Medium", "High"];
const allowedFields = new Set([
  "title",
  "description",
  "project",
  "status",
  "priority",
  "dueDate",
]);
const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
const dateTimePattern =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

const hasOwn = (object, key) =>
  Object.prototype.hasOwnProperty.call(object, key);

const parseDate = (value) => {
  if (value === null || value === "") return undefined;
  if (typeof value !== "string") {
    throw httpError(400, "Task due date must be an ISO-8601 date.");
  }

  const isDateOnly = dateOnlyPattern.test(value);
  if (!isDateOnly && !dateTimePattern.test(value)) {
    throw httpError(400, "Task due date must be an ISO-8601 date.");
  }

  const date = new Date(value);
  const datePart = value.slice(0, 10);
  const calendarDate = new Date(`${datePart}T00:00:00.000Z`);
  if (
    Number.isNaN(date.getTime()) ||
    Number.isNaN(calendarDate.getTime()) ||
    calendarDate.toISOString().slice(0, 10) !== datePart
  ) {
    throw httpError(400, "Task due date must be a valid date.");
  }

  return date;
};

export const validateTaskId = (id) => {
  if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) {
    throw httpError(400, "Invalid task ID.");
  }
};

export const validateTaskProjectId = (id) => {
  if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) {
    throw httpError(400, "Invalid project ID.");
  }
};

export const validateTaskInput = (body, { partial = false } = {}) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw httpError(400, "Request body must be a JSON object.");
  }
  if (hasOwn(body, "createdBy")) {
    throw httpError(400, "Task creator is assigned from authentication.");
  }
  if (Object.keys(body).some((field) => !allowedFields.has(field))) {
    throw httpError(400, "Request contains unsupported task fields.");
  }

  const task = {};

  if (!partial || hasOwn(body, "title")) {
    if (typeof body.title !== "string") {
      throw httpError(400, "Task title is required.");
    }
    const title = body.title.trim();
    if (!title || title.length > 200) {
      throw httpError(400, "Task title must be between 1 and 200 characters.");
    }
    task.title = title;
  }

  if (hasOwn(body, "description")) {
    if (body.description !== null && typeof body.description !== "string") {
      throw httpError(400, "Task description must be text.");
    }
    const description = body.description?.trim() ?? "";
    if (description.length > 10000) {
      throw httpError(
        400,
        "Task description must be 10,000 characters or fewer.",
      );
    }
    task.description = description;
  }

  if (!partial || hasOwn(body, "project")) {
    validateTaskProjectId(body.project);
    task.project = body.project;
  }

  if (hasOwn(body, "status")) {
    if (typeof body.status !== "string" || !statuses.includes(body.status.trim())) {
      throw httpError(400, "Task status is invalid.");
    }
    task.status = body.status.trim();
  }

  if (hasOwn(body, "priority")) {
    if (
      typeof body.priority !== "string" ||
      !priorities.includes(body.priority.trim())
    ) {
      throw httpError(400, "Task priority is invalid.");
    }
    task.priority = body.priority.trim();
  }

  if (hasOwn(body, "dueDate")) {
    task.dueDate = parseDate(body.dueDate);
  }

  if (Object.keys(task).length === 0) {
    throw httpError(
      400,
      partial
        ? "Provide at least one task field to update."
        : "Task title and project are required.",
    );
  }

  return task;
};

export const validateTaskFilters = (query) => {
  const allowedFilters = new Set(["project", "status", "priority"]);
  if (Object.keys(query).some((field) => !allowedFilters.has(field))) {
    throw httpError(400, "Request contains unsupported task filters.");
  }

  const filters = {};
  if (hasOwn(query, "project")) {
    validateTaskProjectId(query.project);
    filters.project = query.project;
  }
  if (hasOwn(query, "status")) {
    if (typeof query.status !== "string" || !statuses.includes(query.status.trim())) {
      throw httpError(400, "Task status filter is invalid.");
    }
    filters.status = query.status.trim();
  }
  if (hasOwn(query, "priority")) {
    if (
      typeof query.priority !== "string" ||
      !priorities.includes(query.priority.trim())
    ) {
      throw httpError(400, "Task priority filter is invalid.");
    }
    filters.priority = query.priority.trim();
  }

  return filters;
};
