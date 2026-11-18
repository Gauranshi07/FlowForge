import { CheckSquare } from "lucide-react";

export default function TasksPage() {
  return (
    <section>
      <p className="text-sm font-semibold text-indigo-600">Workspace</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
        My Tasks
      </h1>
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
          <CheckSquare size={22} />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-slate-900">
          Task management isn’t available yet
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          This section will be available when FlowForge’s task tools are
          implemented. No task data is being shown here.
        </p>
      </div>
    </section>
  );
}
