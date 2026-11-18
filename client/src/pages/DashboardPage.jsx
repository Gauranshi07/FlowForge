import { ArrowRight, FolderKanban, Workflow } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <section>
      <div className="mb-9">
        <p className="text-sm font-semibold text-indigo-600">Overview</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Welcome back, {user?.name}.
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
          Keep your project work moving forward from one focused workspace.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <div className="mx-auto max-w-xl py-6 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
            <FolderKanban size={26} />
          </span>
          <h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-900">
            Your work starts with a project
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Create a project to give your work a clear name, status, priority,
            and timeline.
          </p>
          <Link
            to="/projects"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Go to projects
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
