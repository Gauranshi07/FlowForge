import Project from "../models/Project.js";
import Task from "../models/Task.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { httpError } from "../utils/httpError.js";
import {
  validateTaskFilters,
  validateTaskId,
  validateTaskInput,
} from "../utils/taskValidation.js";

const findOwnedTask = async (id, userId) => {
  validateTaskId(id);

  const task = await Task.findOne({ _id: id, createdBy: userId });
  if (!task || !(await Project.exists({ _id: task.project, owner: userId }))) {
    throw httpError(404, "Task not found.");
  }

  return task;
};

const findOwnedProject = async (id, userId) => {
  const project = await Project.exists({ _id: id, owner: userId });
  if (!project) {
    throw httpError(404, "Project not found.");
  }
};

export const createTask = asyncHandler(async (req, res) => {
  const input = validateTaskInput(req.body);
  await findOwnedProject(input.project, req.auth.userId);

  const task = await Task.create({
    ...input,
    createdBy: req.auth.userId,
  });

  res.status(201).json({
    status: "success",
    data: { task },
  });
});

export const getTasks = asyncHandler(async (req, res) => {
  const filters = validateTaskFilters(req.query);
  if (filters.project) {
    await findOwnedProject(filters.project, req.auth.userId);
  }

  const projects = await Project.find({ owner: req.auth.userId }).select("_id");
  const query = {
    createdBy: req.auth.userId,
    project: filters.project || { $in: projects.map(({ _id }) => _id) },
  };
  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;

  const tasks = await Task.find(query).sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    data: { tasks },
  });
});

export const getTask = asyncHandler(async (req, res) => {
  const task = await findOwnedTask(req.params.id, req.auth.userId);

  res.status(200).json({
    status: "success",
    data: { task },
  });
});

export const updateTask = asyncHandler(async (req, res) => {
  validateTaskId(req.params.id);
  const updates = validateTaskInput(req.body, { partial: true });
  const task = await findOwnedTask(req.params.id, req.auth.userId);
  if (updates.project) {
    await findOwnedProject(updates.project, req.auth.userId);
  }

  Object.assign(task, updates);
  await task.save();

  res.status(200).json({
    status: "success",
    data: { task },
  });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await findOwnedTask(req.params.id, req.auth.userId);
  await task.deleteOne();

  res.status(200).json({
    status: "success",
    message: "Task deleted successfully.",
  });
});
