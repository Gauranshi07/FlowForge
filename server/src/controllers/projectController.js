import Project from "../models/Project.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { httpError } from "../utils/httpError.js";
import {
  validateProjectDateRange,
  validateProjectId,
  validateProjectInput,
} from "../utils/projectValidation.js";

const findOwnedProject = async (id, ownerId) => {
  validateProjectId(id);

  const project = await Project.findOne({ _id: id, owner: ownerId });
  if (!project) {
    throw httpError(404, "Project not found.");
  }

  return project;
};

export const createProject = asyncHandler(async (req, res) => {
  const input = validateProjectInput(req.body);
  validateProjectDateRange(input.startDate, input.dueDate);

  const project = await Project.create({
    ...input,
    owner: req.auth.userId,
  });

  res.status(201).json({
    status: "success",
    data: { project },
  });
});

export const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ owner: req.auth.userId }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    status: "success",
    data: { projects },
  });
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await findOwnedProject(req.params.id, req.auth.userId);

  res.status(200).json({
    status: "success",
    data: { project },
  });
});

export const updateProject = asyncHandler(async (req, res) => {
  validateProjectId(req.params.id);
  const updates = validateProjectInput(req.body, { partial: true });
  const project = await findOwnedProject(req.params.id, req.auth.userId);

  const startDate = Object.hasOwn(updates, "startDate")
    ? updates.startDate
    : project.startDate;
  const dueDate = Object.hasOwn(updates, "dueDate")
    ? updates.dueDate
    : project.dueDate;
  validateProjectDateRange(startDate, dueDate);

  Object.assign(project, updates);
  await project.save();

  res.status(200).json({
    status: "success",
    data: { project },
  });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await findOwnedProject(req.params.id, req.auth.userId);
  await project.deleteOne();

  res.status(200).json({
    status: "success",
    message: "Project deleted successfully.",
  });
});
