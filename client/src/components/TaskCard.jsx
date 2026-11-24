import {
  CalendarDays,
  CircleAlert,
  Pencil,
  Trash2,
} from "lucide-react";

const statusStyles = {
  Todo: "bg-slate-100 text-slate-700 ring-slate-200",
  "In Progress": "bg-indigo-50 text-indigo-700 ring-indigo-200",
  Done: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const priorityStyles = {
  Low: "bg-sky-50 text-sky-700 ring-sky-200",
  Medium: "bg-orange-50 text-orange-700 ring-orange-200",
  High: "bg-rose-50 text-rose-700 ring-rose-200",
};

const formatDate = (value) => {
  if (!value) return "No due date";
  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export default function TaskCard({
  task,
  projectName,
  onEdit,
  onDelete,
  dragHandle,
  showEdit = true,
  showDelete = true,
  actionsDisabled = false,
}) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-slate-200/50 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-wide text-indigo-600">
            {projectName}
          </p>
          <h2 className="mt-1 break-words text-base font-semibold leading-6 text-slate-900">
            {task.title}
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {dragHandle}
          {showEdit && (
            <button
              type="button"
              onClick={() => onEdit(task)}
              disabled={actionsDisabled}
              aria-label={`Edit ${task.title}`}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Pencil size={16} />
            </button>
          )}
          {showDelete && (
            <button
              type="button"
              onClick={() => onDelete(task)}
              disabled={actionsDisabled}
              aria-label={`Delete ${task.title}`}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <p className="mt-3 min-h-10 whitespace-pre-line break-words text-sm leading-5 text-slate-500">
        {task.description || "No description provided."}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
            statusStyles[task.status] || statusStyles.Todo
          }`}
        >
          {task.status}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
            priorityStyles[task.priority] || priorityStyles.Medium
          }`}
        >
          <CircleAlert size={13} />
          {task.priority} priority
        </span>
      </div>

      <div className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-medium text-slate-600">
        <CalendarDays size={15} className="shrink-0 text-slate-400" />
        <span className="text-slate-400">Due</span>
        <span>{formatDate(task.dueDate)}</span>
      </div>
    </article>
  );
}
