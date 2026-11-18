import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CalendarDays, LoaderCircle, X } from "lucide-react";
import {
  createProject,
  getProject,
  updateProject,
} from "../services/projectService.js";
import { getApiErrorMessage } from "../services/api.js";

const initialForm = {
  name: "",
  description: "",
  status: "Planning",
  priority: "Medium",
  startDate: "",
  dueDate: "",
};

const statusOptions = ["Planning", "Active", "On Hold", "Completed"];
const priorityOptions = ["Low", "Medium", "High"];

const inputClass =
  "mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100";

const dateInputValue = (value) => (value ? String(value).slice(0, 10) : "");

export default function ProjectFormModal({ projectId, onClose, onSaved }) {
  const isEditing = Boolean(projectId);
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isLoadError, setIsLoadError] = useState(false);

  const loadProject = useCallback(async () => {
    setIsLoading(true);
    setError("");
    setIsLoadError(false);
    try {
      const project = await getProject(projectId);
      setForm({
        name: project.name || "",
        description: project.description || "",
        status: project.status || "Planning",
        priority: project.priority || "Medium",
        startDate: dateInputValue(project.startDate),
        dueDate: dateInputValue(project.dueDate),
      });
    } catch (requestError) {
      setIsLoadError(true);
      setError(
        getApiErrorMessage(
          requestError,
          "Project details could not be loaded. Please try again.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (isEditing) loadProject();
  }, [isEditing, loadProject]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isSaving) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSaving, onClose]);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const name = form.name.trim();
    if (!name) {
      setError("Enter a project name.");
      return;
    }
    if (name.length > 120) {
      setError("Project name must be 120 characters or fewer.");
      return;
    }
    if (form.description.length > 10000) {
      setError("Description must be 10,000 characters or fewer.");
      return;
    }
    if (
      form.startDate &&
      form.dueDate &&
      form.dueDate < form.startDate
    ) {
      setError("Due date cannot be earlier than the start date.");
      return;
    }

    const payload = {
      name,
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      startDate: form.startDate || null,
      dueDate: form.dueDate || null,
    };

    setIsSaving(true);
    try {
      if (isEditing) {
        await updateProject(projectId, payload);
      } else {
        await createProject(payload);
      }
      await onSaved();
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          `Project could not be ${isEditing ? "updated" : "created"}. Please try again.`,
        ),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose();
      }}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-5"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        className="max-h-[94vh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7"
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-indigo-600">
              {isEditing ? "Project details" : "New workspace item"}
            </p>
            <h2
              id="project-modal-title"
              className="mt-2 text-xl font-semibold tracking-tight text-slate-950"
            >
              {isEditing ? "Edit project" : "Create a project"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isEditing
                ? "Update the details and timeline for this project."
                : "Give your work a clear name and a plan."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close project form"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </header>

        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-sm font-medium text-slate-500">
            <LoaderCircle size={19} className="animate-spin text-indigo-600" />
            Loading project…
          </div>
        ) : isEditing && isLoadError ? (
          <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4">
            <p role="alert" className="text-sm leading-6 text-rose-700">
              {error}
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="h-10 rounded-lg border border-rose-200 bg-white px-3 text-sm font-semibold text-rose-700 hover:bg-rose-100"
              >
                Close
              </button>
              <button
                type="button"
                onClick={loadProject}
                className="h-10 rounded-lg bg-rose-700 px-3 text-sm font-semibold text-white hover:bg-rose-800"
              >
                Try again
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="project-name"
                className="text-sm font-semibold text-slate-700"
              >
                Project name <span className="text-rose-500">*</span>
              </label>
              <input
                id="project-name"
                name="name"
                type="text"
                value={form.name}
                onChange={updateField("name")}
                maxLength={120}
                placeholder="e.g. Website redesign"
                autoFocus
                required
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="project-description"
                className="text-sm font-semibold text-slate-700"
              >
                Description
              </label>
              <textarea
                id="project-description"
                name="description"
                value={form.description}
                onChange={updateField("description")}
                maxLength={10000}
                rows={3}
                placeholder="What is this project about?"
                className={`${inputClass} resize-y`}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="project-status"
                  className="text-sm font-semibold text-slate-700"
                >
                  Status
                </label>
                <select
                  id="project-status"
                  name="status"
                  value={form.status}
                  onChange={updateField("status")}
                  className={inputClass}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="project-priority"
                  className="text-sm font-semibold text-slate-700"
                >
                  Priority
                </label>
                <select
                  id="project-priority"
                  name="priority"
                  value={form.priority}
                  onChange={updateField("priority")}
                  className={inputClass}
                >
                  {priorityOptions.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="project-start-date"
                  className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                >
                  <CalendarDays size={15} className="text-slate-400" />
                  Start date
                </label>
                <input
                  id="project-start-date"
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={updateField("startDate")}
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="project-due-date"
                  className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                >
                  <CalendarDays size={15} className="text-slate-400" />
                  Due date
                </label>
                <input
                  id="project-due-date"
                  name="dueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={updateField("dueDate")}
                  className={inputClass}
                />
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm leading-5 text-rose-700"
              >
                <AlertCircle size={17} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <footer className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving && <LoaderCircle size={16} className="animate-spin" />}
                {isSaving
                  ? isEditing
                    ? "Saving…"
                    : "Creating…"
                  : isEditing
                    ? "Save changes"
                    : "Create project"}
              </button>
            </footer>
          </form>
        )}
      </section>
    </div>
  );
}
