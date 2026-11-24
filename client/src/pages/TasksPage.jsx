import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckSquare,
  FolderKanban,
  Plus,
  RotateCw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import TaskCard from "../components/TaskCard.jsx";
import TaskDeleteDialog from "../components/TaskDeleteDialog.jsx";
import TaskFormModal from "../components/TaskFormModal.jsx";
import { useProjects } from "../hooks/useProjects.js";
import { useTasks } from "../hooks/useTasks.js";
import { getApiErrorMessage } from "../services/api.js";
import { deleteTask } from "../services/taskService.js";

const statuses = ["Todo", "In Progress", "Done"];
const priorities = ["Low", "Medium", "High"];

const selectClass =
  "h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100";

function TaskCardSkeleton() {
  return (
    <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white p-6">
      <div className="h-3 w-1/3 rounded bg-slate-100" />
      <div className="mt-3 h-4 w-2/3 rounded bg-slate-100" />
      <div className="mt-5 h-3 w-full rounded bg-slate-100" />
      <div className="mt-2 h-3 w-4/5 rounded bg-slate-100" />
      <div className="mt-6 flex gap-2">
        <div className="h-6 w-20 rounded-full bg-slate-100" />
        <div className="h-6 w-24 rounded-full bg-slate-100" />
      </div>
      <div className="mt-12 h-px bg-slate-100" />
    </div>
  );
}

export default function TasksPage() {
  const { tasks, isLoading, error, refreshTasks } = useTasks();
  const {
    projects,
    isLoading: projectsLoading,
    error: projectsError,
  } = useProjects();
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const projectsById = useMemo(
    () => new Map(projects.map((project) => [project._id, project.name])),
    [projects],
  );

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const taskProjectId =
        typeof task.project === "string" ? task.project : task.project?._id;
      const matchesTitle = !query || task.title.toLowerCase().includes(query);
      const matchesProject = !projectFilter || taskProjectId === projectFilter;
      const matchesStatus = !statusFilter || task.status === statusFilter;
      const matchesPriority = !priorityFilter || task.priority === priorityFilter;
      return (
        matchesTitle && matchesProject && matchesStatus && matchesPriority
      );
    });
  }, [tasks, search, projectFilter, statusFilter, priorityFilter]);

  const openCreateForm = () => {
    setEditingTaskId(null);
    setSuccessMessage("");
    setIsFormOpen(true);
  };

  const openEditForm = (task) => {
    setEditingTaskId(task._id);
    setSuccessMessage("");
    setIsFormOpen(true);
  };

  const clearFilters = () => {
    setSearch("");
    setProjectFilter("");
    setStatusFilter("");
    setPriorityFilter("");
  };

  const handleSaved = async (wasEditing) => {
    setIsFormOpen(false);
    setEditingTaskId(null);
    setSuccessMessage(wasEditing ? "Task updated successfully." : "Task created successfully.");
    await refreshTasks();
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;
    setDeleteError("");
    setIsDeleting(true);
    try {
      await deleteTask(taskToDelete._id);
      setTaskToDelete(null);
      setSuccessMessage("Task deleted successfully.");
      await refreshTasks();
    } catch (requestError) {
      setDeleteError(
        getApiErrorMessage(
          requestError,
          "Task could not be deleted. Please try again.",
        ),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const hasFilters = Boolean(
    search || projectFilter || statusFilter || priorityFilter,
  );

  return (
    <section>
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-indigo-600">Workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            My Tasks
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Keep the next steps across your projects clear, focused, and moving.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-right shadow-sm sm:block">
            <p className="text-lg font-semibold leading-5 text-slate-900">
              {tasks.length}
            </p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {tasks.length === 1 ? "Task total" : "Tasks total"}
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <Plus size={18} />
            Create task
          </button>
        </div>
      </header>

      <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:p-4">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search tasks by title</span>
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tasks by title"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
        </label>
        <div className="grid gap-3 sm:flex">
          <label>
            <span className="sr-only">Filter by project</span>
            <select
              aria-label="Filter by project"
              value={projectFilter}
              onChange={(event) => setProjectFilter(event.target.value)}
              disabled={projectsLoading || Boolean(projectsError)}
              className={`${selectClass} w-full sm:w-44`}
            >
              <option value="">
                {projectsLoading ? "Loading projects…" : "All projects"}
              </option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <label className="relative">
            <span className="sr-only">Filter by status</span>
            <SlidersHorizontal
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className={`${selectClass} w-full pl-9 sm:w-40`}
            >
              <option value="">All statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by priority</span>
            <select
              aria-label="Filter by priority"
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              className={`${selectClass} w-full sm:w-40`}
            >
              <option value="">All priorities</option>
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority} priority
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {successMessage && (
        <div
          role="status"
          className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
        >
          <span>{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            aria-label="Dismiss success message"
            className="rounded-md p-1 text-emerald-700 transition hover:bg-emerald-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="mb-4 mt-6 flex min-h-6 items-center justify-between text-sm text-slate-500">
        <span>
          {isLoading
            ? "Loading tasks…"
            : `${filteredTasks.length} ${
                filteredTasks.length === 1 ? "task" : "tasks"
              } shown`}
        </span>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <X size={14} />
            Clear filters
          </button>
        )}
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-rose-600" />
            <div>
              <h2 className="font-semibold text-rose-900">
                Tasks couldn’t be loaded
              </h2>
              <p className="mt-1 text-sm leading-6 text-rose-800">{error}</p>
              <button
                type="button"
                onClick={refreshTasks}
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 text-sm font-semibold text-rose-800 transition hover:bg-rose-100"
              >
                <RotateCw size={15} />
                Try again
              </button>
            </div>
          </div>
        </div>
      ) : isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <TaskCardSkeleton key={index} />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
            <CheckSquare size={23} />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            No tasks yet
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Create a task to turn your project plans into clear next steps.
          </p>
          {projects.length > 0 ? (
            <button
              type="button"
              onClick={openCreateForm}
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <Plus size={17} />
              Create task
            </button>
          ) : !projectsLoading && !projectsError ? (
            <Link
              to="/projects"
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <FolderKanban size={17} />
              Create a project first
            </Link>
          ) : null}
          {projectsError && (
            <p role="alert" className="mt-4 text-sm text-rose-700">
              {projectsError}
            </p>
          )}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            No matching tasks
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Try changing your search or filters.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Clear search and filters
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredTasks.map((task) => {
            const projectId =
              typeof task.project === "string" ? task.project : task.project?._id;
            return (
              <TaskCard
                key={task._id}
                task={task}
                projectName={projectsById.get(projectId) || "Project"}
                onEdit={openEditForm}
                onDelete={(selectedTask) => {
                  setDeleteError("");
                  setTaskToDelete(selectedTask);
                }}
              />
            );
          })}
        </div>
      )}

      {isFormOpen && (
        <TaskFormModal
          taskId={editingTaskId}
          projects={projects}
          projectsLoading={projectsLoading}
          projectsError={projectsError}
          onClose={() => setIsFormOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {taskToDelete && (
        <TaskDeleteDialog
          task={taskToDelete}
          error={deleteError}
          isDeleting={isDeleting}
          onCancel={() => {
            if (!isDeleting) setTaskToDelete(null);
          }}
          onConfirm={handleDelete}
        />
      )}
    </section>
  );
}
