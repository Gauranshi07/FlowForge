import { useMemo, useState } from "react";
import {
  AlertCircle,
  FolderKanban,
  Plus,
  RotateCw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog.jsx";
import ProjectCard from "../components/ProjectCard.jsx";
import ProjectFormModal from "../components/ProjectFormModal.jsx";
import { deleteProject } from "../services/projectService.js";
import { getApiErrorMessage } from "../services/api.js";
import { useProjects } from "../hooks/useProjects.js";

const statuses = ["Planning", "Active", "On Hold", "Completed"];
const priorities = ["Low", "Medium", "High"];

function ProjectCardSkeleton() {
  return (
    <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white p-6">
      <div className="h-4 w-2/3 rounded bg-slate-100" />
      <div className="mt-4 h-3 w-full rounded bg-slate-100" />
      <div className="mt-2 h-3 w-4/5 rounded bg-slate-100" />
      <div className="mt-6 flex gap-2">
        <div className="h-6 w-20 rounded-full bg-slate-100" />
        <div className="h-6 w-24 rounded-full bg-slate-100" />
      </div>
      <div className="mt-12 h-px bg-slate-100" />
      <div className="mt-4 flex gap-8">
        <div className="h-3 w-24 rounded bg-slate-100" />
        <div className="h-3 w-24 rounded bg-slate-100" />
      </div>
    </div>
  );
}

const selectClass =
  "h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100";

export default function ProjectsPage() {
  const { projects, isLoading, error, refreshProjects } = useProjects();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesName = !query || project.name.toLowerCase().includes(query);
      const matchesStatus = !statusFilter || project.status === statusFilter;
      const matchesPriority =
        !priorityFilter || project.priority === priorityFilter;
      return matchesName && matchesStatus && matchesPriority;
    });
  }, [projects, search, statusFilter, priorityFilter]);

  const openCreateForm = () => {
    setEditingProjectId(null);
    setIsFormOpen(true);
  };

  const openEditForm = (project) => {
    setEditingProjectId(project._id);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;
    setDeleteError("");
    setIsDeleting(true);
    try {
      await deleteProject(projectToDelete._id);
      setProjectToDelete(null);
      await refreshProjects();
    } catch (requestError) {
      setDeleteError(
        getApiErrorMessage(
          requestError,
          "Project could not be deleted. Please try again.",
        ),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setPriorityFilter("");
  };

  const hasFilters = Boolean(search || statusFilter || priorityFilter);

  return (
    <section>
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-indigo-600">Workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Projects
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Plan, track, and organize the work your team is moving forward.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <Plus size={18} />
          Create project
        </button>
      </header>

      <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:p-4">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search projects by name</span>
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search projects by name"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
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

      <div className="mb-4 mt-6 flex min-h-6 items-center justify-between text-sm text-slate-500">
        <span>
          {isLoading
            ? "Loading projects…"
            : `${filteredProjects.length} ${
                filteredProjects.length === 1 ? "project" : "projects"
              }`}
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
                Projects couldn’t be loaded
              </h2>
              <p className="mt-1 text-sm leading-6 text-rose-800">{error}</p>
              <button
                type="button"
                onClick={refreshProjects}
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
            <ProjectCardSkeleton key={index} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
            <FolderKanban size={23} />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            No projects yet
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Create your first project to start organizing work and timelines.
          </p>
          <button
            type="button"
            onClick={openCreateForm}
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Plus size={17} />
            Create project
          </button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            No matching projects
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
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onEdit={openEditForm}
              onDelete={(selectedProject) => {
                setDeleteError("");
                setProjectToDelete(selectedProject);
              }}
            />
          ))}
        </div>
      )}

      {isFormOpen && (
        <ProjectFormModal
          projectId={editingProjectId}
          onClose={() => setIsFormOpen(false)}
          onSaved={() => {
            setIsFormOpen(false);
            return refreshProjects();
          }}
        />
      )}

      {projectToDelete && (
        <ConfirmDeleteDialog
          project={projectToDelete}
          error={deleteError}
          isDeleting={isDeleting}
          onCancel={() => {
            if (!isDeleting) setProjectToDelete(null);
          }}
          onConfirm={handleDelete}
        />
      )}
    </section>
  );
}
