import { AlertTriangle, LoaderCircle, X } from "lucide-react";

export default function ConfirmDeleteDialog({
  project,
  error,
  isDeleting,
  onCancel,
  onConfirm,
}) {
  return (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) onCancel();
      }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-project-title"
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between">
          <span className="grid size-11 place-items-center rounded-xl bg-rose-50 text-rose-600">
            <AlertTriangle size={21} />
          </span>
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            aria-label="Close delete confirmation"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>
        <h2
          id="delete-project-title"
          className="mt-5 text-lg font-semibold text-slate-950"
        >
          Delete “{project.name}”?
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          This will permanently remove the project. This action cannot be
          undone.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700"
          >
            {error}
          </p>
        )}

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting && <LoaderCircle size={16} className="animate-spin" />}
            {isDeleting ? "Deleting…" : "Delete project"}
          </button>
        </div>
      </section>
    </div>
  );
}
