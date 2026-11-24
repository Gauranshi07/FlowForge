import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  Clock3,
  FolderKanban,
  ListTodo,
  RotateCw,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useDashboardSummary } from "../hooks/useDashboardSummary.js";

const statisticCards = [
  {
    key: "totalProjects",
    label: "Total projects",
    icon: FolderKanban,
    tone: "bg-indigo-50 text-indigo-600",
    detail: "Across your workspace",
  },
  {
    key: "totalTasks",
    label: "Total tasks",
    icon: ListTodo,
    tone: "bg-violet-50 text-violet-600",
    detail: "All project tasks",
  },
  {
    key: "completedTasks",
    label: "Completed",
    icon: CheckCircle2,
    tone: "bg-emerald-50 text-emerald-600",
    detail: "Tasks marked done",
  },
  {
    key: "pendingTasks",
    label: "Pending",
    icon: Clock3,
    tone: "bg-amber-50 text-amber-600",
    detail: "Tasks to get started",
  },
  {
    key: "inProgressTasks",
    label: "In progress",
    icon: CircleDot,
    tone: "bg-sky-50 text-sky-600",
    detail: "Work underway",
  },
];

const statusStyles = {
  Todo: "bg-slate-100 text-slate-700",
  "In Progress": "bg-indigo-50 text-indigo-700",
  Done: "bg-emerald-50 text-emerald-700",
};

const priorityStyles = {
  Low: "bg-sky-50 text-sky-700",
  Medium: "bg-orange-50 text-orange-700",
  High: "bg-rose-50 text-rose-700",
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

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-7">
      <div className="h-28 rounded-2xl bg-slate-200/70" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {statisticCards.map(({ key }) => (
          <div
            key={key}
            className="h-32 rounded-2xl border border-slate-200 bg-white"
          />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="h-72 rounded-2xl border border-slate-200 bg-white" />
        <div className="h-72 rounded-2xl border border-slate-200 bg-white" />
      </div>
      <div className="h-80 rounded-2xl border border-slate-200 bg-white" />
    </div>
  );
}

function StatisticCard({ card, value }) {
  const Icon = card.icon;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <span className={`grid size-10 place-items-center rounded-xl ${card.tone}`}>
          <Icon size={19} />
        </span>
        <span className="text-2xl font-semibold tracking-tight text-slate-950">
          {value}
        </span>
      </div>
      <h2 className="mt-4 text-sm font-semibold text-slate-800">{card.label}</h2>
      <p className="mt-1 text-xs text-slate-500">{card.detail}</p>
    </article>
  );
}

function ProgressBar({ value }) {
  return (
    <div
      className="h-2 overflow-hidden rounded-full bg-slate-100"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 transition-[width] duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function CompletionOverview({ statistics }) {
  const percentage = statistics.completionPercentage;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
          <TrendingUp size={19} />
        </span>
        <div>
          <h2 className="font-semibold text-slate-900">Task completion</h2>
          <p className="mt-1 text-sm text-slate-500">
            Your overall progress across all projects.
          </p>
        </div>
      </div>

      <div className="mt-7 flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-9">
        <div
          role="img"
          aria-label={`${percentage}% of tasks completed`}
          className="relative grid size-36 shrink-0 place-items-center rounded-full"
          style={{
            background: `conic-gradient(#4f46e5 ${percentage}%, #e0e7ff ${percentage}% 100%)`,
          }}
        >
          <div className="grid size-28 place-items-center rounded-full bg-white text-center shadow-inner">
            <div>
              <p className="text-3xl font-semibold tracking-tight text-slate-950">
                {percentage}%
              </p>
              <p className="mt-0.5 text-xs font-medium text-slate-500">
                complete
              </p>
            </div>
          </div>
        </div>
        <div className="grid w-full max-w-xs grid-cols-2 gap-3">
          <div className="rounded-xl bg-emerald-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Completed
            </p>
            <p className="mt-2 text-2xl font-semibold text-emerald-900">
              {statistics.completedTasks}
            </p>
          </div>
          <div className="rounded-xl bg-indigo-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
              Remaining
            </p>
            <p className="mt-2 text-2xl font-semibold text-indigo-900">
              {statistics.remainingTasks}
            </p>
          </div>
          <p className="col-span-2 text-center text-xs text-slate-500 sm:text-left">
            {statistics.completedTasks} of {statistics.totalTasks} tasks
            completed
          </p>
        </div>
      </div>
    </section>
  );
}

function ProjectProgress({ projects }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-slate-900">Project progress</h2>
          <p className="mt-1 text-sm text-slate-500">
            Completion by project.
          </p>
        </div>
        <Link
          to="/projects"
          aria-label="View all projects"
          className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-700"
        >
          <ArrowRight size={18} />
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center">
          <p className="text-sm font-medium text-slate-700">No projects yet</p>
          <Link
            to="/projects"
            className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Create your first project <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          {projects.map((project) => (
            <article key={project._id}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <h3 className="min-w-0 truncate text-sm font-semibold text-slate-800">
                  {project.name}
                </h3>
                <span className="shrink-0 text-xs font-semibold text-indigo-700">
                  {project.completionPercentage}%
                </span>
              </div>
              <ProgressBar value={project.completionPercentage} />
              <p className="mt-2 text-xs text-slate-500">
                {project.completedTasks} of {project.totalTasks}{" "}
                {project.totalTasks === 1 ? "task" : "tasks"} completed
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function RecentTasks({ tasks }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-semibold text-slate-900">Recently updated tasks</h2>
          <p className="mt-1 text-sm text-slate-500">
            The latest changes across your projects.
          </p>
        </div>
        <Link
          to="/tasks"
          className="inline-flex h-9 w-fit items-center gap-2 rounded-lg px-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-700"
        >
          View all tasks <ArrowRight size={15} />
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 px-4 py-9 text-center">
          <p className="text-sm font-medium text-slate-700">No tasks yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Tasks you update will show up here.
          </p>
          <Link
            to="/tasks"
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Go to tasks <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="mt-5 divide-y divide-slate-100">
          {tasks.map((task) => (
            <article
              key={task._id}
              className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-slate-900">
                  {task.title}
                </h3>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {task.project.name}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    statusStyles[task.status] || statusStyles.Todo
                  }`}
                >
                  {task.status}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    priorityStyles[task.priority] || priorityStyles.Medium
                  }`}
                >
                  {task.priority}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <CalendarDays size={14} className="text-slate-400" />
                  {formatDate(task.dueDate)}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { summary, isLoading, error, refreshDashboard } =
    useDashboardSummary();

  return (
    <section>
      <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-indigo-600">Overview</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Welcome back, {user?.name}.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            A clear view of your projects, task progress, and what changed
            recently.
          </p>
        </div>
        <button
          type="button"
          onClick={refreshDashboard}
          disabled={isLoading}
          className="inline-flex h-10 w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700 disabled:cursor-wait disabled:opacity-60"
        >
          <RotateCw size={15} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </header>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-rose-600" />
            <div>
              <h2 className="font-semibold text-rose-900">
                Dashboard couldn’t be loaded
              </h2>
              <p className="mt-1 text-sm leading-6 text-rose-800">{error}</p>
              <button
                type="button"
                onClick={refreshDashboard}
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 text-sm font-semibold text-rose-800 transition hover:bg-rose-100"
              >
                <RotateCw size={15} />
                Try again
              </button>
            </div>
          </div>
        </div>
      ) : isLoading || !summary ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
            {statisticCards.map((card) => (
              <StatisticCard
                key={card.key}
                card={card}
                value={summary.statistics[card.key]}
              />
            ))}
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            <CompletionOverview statistics={summary.statistics} />
            <ProjectProgress projects={summary.projects} />
          </div>

          <div className="mt-5">
            <RecentTasks tasks={summary.recentTasks} />
          </div>
        </>
      )}
    </section>
  );
}
