import { httpError } from "./httpError.js";

const statuses = ["Planning", "Active", "On Hold", "Completed"];
const priorities = ["Low", "Medium", "High"];
const allowedFields = new Set([
  "name",
  "description",
  "status",
  "priority",
  "startDate",
  "dueDate",
]);
const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
const dateTimePattern =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

const hasOwn = (object, key) =>
  Object.prototype.hasOwnProperty.call(object, key);

const parseDate = (value, fieldName) => {
  if (value === null || value === "") return undefined;
  if (typeof value !== "string") {
    throw httpError(400, `${fieldName} must be an ISO-8601 date.`);
  }

  const isDateOnly = dateOnlyPattern.test(value);
  if (!isDateOnly && !dateTimePattern.test(value)) {
    throw httpError(400, `${fieldName} must be an ISO-8601 date.`);
  }

  const date = new Date(value);
  if (
    Number.isNaN(date.getTime()) ||
    (isDateOnly && date.toISOString().slice(0, 10) !== value)
  ) {
    throw httpError(400, `${fieldName} must be a valid date.`);
  }

  return date;
};

export const validateProjectId = (id) => {
  if (!/^[a-f\d]{24}$/i.test(id)) {
    throw httpError(400, "Invalid project ID.");
  }
};

export const validateProjectInput = (body, { partial = false } = {}) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw httpError(400, "Request body must be a JSON object.");
  }
  if (hasOwn(body, "owner")) {
    throw httpError(400, "Project owner is assigned from authentication.");
  }
  if (Object.keys(body).some((field) => !allowedFields.has(field))) {
    throw httpError(400, "Request contains unsupported project fields.");
  }

  const project = {};

  if (!partial || hasOwn(body, "name")) {
    if (typeof body.name !== "string") {
      throw httpError(400, "Project name is required.");
    }
    const name = body.name.trim();
    if (!name || name.length > 120) {
      throw httpError(400, "Project name must be between 1 and 120 characters.");
    }
    project.name = name;
  }

  if (hasOwn(body, "description")) {
    if (body.description !== null && typeof body.description !== "string") {
      throw httpError(400, "Project description must be text.");
    }
    const description = body.description?.trim() ?? "";
    if (description.length > 10000) {
      throw httpError(400, "Project description must be 10,000 characters or fewer.");
    }
    project.description = description;
  }

  if (hasOwn(body, "status")) {
    if (typeof body.status !== "string" || !statuses.includes(body.status.trim())) {
      throw httpError(400, "Project status is invalid.");
    }
    project.status = body.status.trim();
  }

  if (hasOwn(body, "priority")) {
    if (
      typeof body.priority !== "string" ||
      !priorities.includes(body.priority.trim())
    ) {
      throw httpError(400, "Project priority is invalid.");
    }
    project.priority = body.priority.trim();
  }

  for (const field of ["startDate", "dueDate"]) {
    if (hasOwn(body, field)) {
      project[field] = parseDate(body[field], field);
    }
  }

  if (!partial && Object.keys(project).length === 0) {
    throw httpError(400, "Project name is required.");
  }
  if (partial && Object.keys(project).length === 0) {
    throw httpError(400, "Provide at least one project field to update.");
  }

  return project;
};

export const validateProjectDateRange = (startDate, dueDate) => {
  if (startDate && dueDate && dueDate < startDate) {
    throw httpError(400, "Due date cannot be earlier than the start date.");
  }
};
