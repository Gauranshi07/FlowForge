export default function FormField({
  id,
  label,
  icon: Icon,
  error,
  trailing,
  className = "",
  ...inputProps
}) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>
      <div
        className={`flex h-12 items-center gap-3 rounded-xl border bg-white px-3.5 transition focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100 ${
          error ? "border-rose-300" : "border-slate-200"
        }`}
      >
        <Icon aria-hidden="true" size={18} className="shrink-0 text-slate-400" />
        <input
          {...inputProps}
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
        {trailing}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
