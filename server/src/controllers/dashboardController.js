import mongoose from "mongoose";
import { asyncHandler } from "../middleware/asyncHandler.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";

const percentage = (completed, total) =>
  total === 0 ? 0 : Math.round((completed / total) * 100);

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.auth.userId);
  const projects = await Project.find({ owner: userId })
    .select("_id name")
    .sort({ name: 1 })
    .lean();
  const projectIds = projects.map(({ _id }) => _id);
  const taskFilter = {
    createdBy: userId,
    project: { $in: projectIds },
  };

  const [aggregates, recentTaskDocuments] = await Promise.all([
    Task.aggregate([
      { $match: taskFilter },
      {
        $facet: {
          statuses: [
            { $group: { _id: "$status", count: { $sum: 1 } } },
          ],
          projects: [
            {
              $group: {
                _id: "$project",
                totalTasks: { $sum: 1 },
                completedTasks: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "Done"] }, 1, 0],
                  },
                },
              },
            },
          ],
        },
      },
    ]),
    Task.find(taskFilter)
      .select("_id title project status priority dueDate updatedAt")
      .sort({ updatedAt: -1, _id: -1 })
      .limit(5)
      .lean(),
  ]);

  const statusCounts = new Map(
    (aggregates[0]?.statuses ?? []).map(({ _id, count }) => [_id, count]),
  );
  const taskCountByProject = new Map(
    (aggregates[0]?.projects ?? []).map((project) => [
      project._id.toString(),
      project,
    ]),
  );
  const totalTasks = [...statusCounts.values()].reduce(
    (total, count) => total + count,
    0,
  );
  const completedTasks = statusCounts.get("Done") ?? 0;
  const projectNames = new Map(
    projects.map((project) => [project._id.toString(), project.name]),
  );

  const summary = {
    statistics: {
      totalProjects: projects.length,
      totalTasks,
      completedTasks,
      pendingTasks: statusCounts.get("Todo") ?? 0,
      inProgressTasks: statusCounts.get("In Progress") ?? 0,
      remainingTasks: totalTasks - completedTasks,
      completionPercentage: percentage(completedTasks, totalTasks),
    },
    projects: projects.map((project) => {
      const progress = taskCountByProject.get(project._id.toString());
      const projectTasks = progress?.totalTasks ?? 0;
      const projectCompleted = progress?.completedTasks ?? 0;

      return {
        _id: project._id.toString(),
        name: project.name,
        totalTasks: projectTasks,
        completedTasks: projectCompleted,
        completionPercentage: percentage(projectCompleted, projectTasks),
      };
    }),
    recentTasks: recentTaskDocuments.map((task) => ({
      _id: task._id.toString(),
      title: task.title,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ?? null,
      updatedAt: task.updatedAt,
      project: {
        _id: task.project.toString(),
        name: projectNames.get(task.project.toString()) ?? "Project",
      },
    })),
  };

  res.status(200).json({
    status: "success",
    data: { summary },
  });
});
