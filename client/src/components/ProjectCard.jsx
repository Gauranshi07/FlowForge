import {
  CalendarDays,
  CircleAlert,
  Clock3,
  Pencil,
  Trash2,
} from "lucide-react";

const statusStyles = {
  Planning: "bg-slate-100 text-slate-700 ring-slate-200",
  Active: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  "On Hold": "bg-amber-50 text-amber-700 ring-amber-200",
  Completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const priorityStyles = {
  Low: "bg-sky-50 text-sky-700 ring-sky-200",
  Medium: "bg-orange-50 text-orange-700 ring-orange-200",
  High: "bg-rose-50 text-rose-700 ring-rose-200",
};

const formatDate = (value) => {
  if (!value) return "Not set";
  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export default function ProjectCard({ project, onEdit, onDelete }) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-slate-200/50 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="break-words text-base font-semibold leading-6 text-slate-900">
            {project.name}
          </h2>
          <p className="mt-2 line-clamp-3 min-h-10 whitespace-pre-line break-words text-sm leading-5 text-slate-500">
            {project.description || "No description provided."}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(project)}
            aria-label={`Edit ${project.name}`}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-600"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(project)}
            aria-label={`Delete ${project.name}`}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-rose-500"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
            statusStyles[project.status] || statusStyles.Planning
          }`}
        >
          {project.status}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
            priorityStyles[project.priority] || priorityStyles.Medium
          }`}
        >
          <CircleAlert size={13} />
          {project.priority} priority
        </span>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
        <div className="flex min-w-0 items-start gap-2">
          <CalendarDays size={15} className="mt-0.5 shrink-0 text-slate-400" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Start date
            </p>
            <p className="mt-1 truncate text-xs font-medium text-slate-700">
              {formatDate(project.startDate)}
            </p>
          </div>
        </div>
        <div className="flex min-w-0 items-start gap-2">
          <Clock3 size={15} className="mt-0.5 shrink-0 text-slate-400" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Due date
            </p>
            <p className="mt-1 truncate text-xs font-medium text-slate-700">
              {formatDate(project.dueDate)}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
