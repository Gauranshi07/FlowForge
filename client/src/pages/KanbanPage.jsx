import { useEffect, useMemo, useRef, useState } from "react";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  useDraggable,
} from "@dnd-kit/core";
import {
  AlertCircle,
  Check,
  Circle,
  CircleCheck,
  CircleDot,
  GripVertical,
  RotateCw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import TaskCard from "../components/TaskCard.jsx";
import TaskFormModal from "../components/TaskFormModal.jsx";
import { useProjects } from "../hooks/useProjects.js";
import { useTasks } from "../hooks/useTasks.js";
import { getApiErrorMessage } from "../services/api.js";
import { updateTask } from "../services/taskService.js";

const statuses = ["Todo", "In Progress", "Done"];
const priorities = ["Low", "Medium", "High"];

const statusDetails = {
  Todo: {
    icon: Circle,
    tone: "text-slate-500",
    count: "bg-slate-100 text-slate-700",
  },
  "In Progress": {
    icon: CircleDot,
    tone: "text-indigo-600",
    count: "bg-indigo-100 text-indigo-700",
  },
  Done: {
    icon: CircleCheck,
    tone: "text-emerald-600",
    count: "bg-emerald-100 text-emerald-700",
  },
};

const selectClass =
  "h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100";

function DraggableTaskCard({
  task,
  projectName,
  onEdit,
  isUpdating,
}) {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task._id,
    disabled: isUpdating,
    data: { task },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const dragHandle = (
    <button
      ref={setActivatorNodeRef}
      type="button"
      {...attributes}
      {...listeners}
      disabled={isUpdating}
      aria-label={`Move ${task.title}`}
      title="Drag to change status"
      className="touch-none cursor-grab rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-indigo-600 active:cursor-grabbing disabled:cursor-wait"
    >
      <GripVertical size={16} />
    </button>
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`transition-opacity ${
        isDragging ? "z-10 opacity-35" : "opacity-100"
      }`}
    >
      <TaskCard
        task={task}
        projectName={projectName}
        onEdit={onEdit}
        dragHandle={dragHandle}
        showDelete={false}
        actionsDisabled={isUpdating}
      />
    </div>
  );
}

function KanbanColumn({
  status,
  tasks,
  projectsById,
  pendingTaskIds,
  onEdit,
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `column:${status}` });
  const { icon: StatusIcon, tone, count } = statusDetails[status];

  return (
    <section
      ref={setNodeRef}
      aria-label={`${status} tasks`}
      className={`min-h-[340px] rounded-2xl border p-3 transition-colors duration-200 sm:p-4 ${
        isOver
          ? "border-indigo-300 bg-indigo-50/80 shadow-inner shadow-indigo-100"
          : "border-slate-200 bg-slate-50/80"
      }`}
    >
      <header className="flex items-center justify-between gap-3 px-1 pb-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <StatusIcon size={18} className={`shrink-0 ${tone}`} />
          <h2 className="truncate text-sm font-semibold text-slate-900">
            {status}
          </h2>
        </div>
        <span
          aria-label={`${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`}
          className={`grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${count}`}
        >
          {tasks.length}
        </span>
      </header>

      <div className="min-h-[270px] space-y-3 rounded-xl">
        {tasks.length === 0 ? (
          <div className="grid min-h-[170px] place-items-center rounded-xl border border-dashed border-slate-300/80 bg-white/70 px-4 text-center text-xs leading-5 text-slate-400">
            {isOver ? "Drop task here" : "No tasks in this column"}
          </div>
        ) : (
          tasks.map((task) => {
            const projectId =
              typeof task.project === "string" ? task.project : task.project?._id;
            return (
              <DraggableTaskCard
                key={task._id}
                task={task}
                projectName={projectsById.get(projectId) || "Project"}
                onEdit={onEdit}
                isUpdating={pendingTaskIds.has(task._id)}
              />
            );
          })
        )}
      </div>
    </section>
  );
}

function KanbanSkeleton() {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {statuses.map((status) => (
        <div
          key={status}
          className="min-h-[340px] animate-pulse rounded-2xl border border-slate-200 bg-slate-50 p-4"
        >
          <div className="h-5 w-32 rounded bg-slate-200" />
          <div className="mt-5 h-44 rounded-xl bg-white" />
          <div className="mt-4 h-40 rounded-xl bg-white" />
        </div>
      ))}
    </div>
  );
}

export default function KanbanPage() {
  const { tasks, isLoading, error, refreshTasks } = useTasks();
  const {
    projects,
    isLoading: projectsLoading,
    error: projectsError,
  } = useProjects();
  const [boardTasks, setBoardTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [activeTask, setActiveTask] = useState(null);
  const [pendingTaskIds, setPendingTaskIds] = useState(() => new Set());
  const [moveError, setMoveError] = useState("");
  const [moveNotice, setMoveNotice] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const pendingTaskIdsRef = useRef(new Set());

  useEffect(() => {
    setBoardTasks((currentTasks) => {
      const currentById = new Map(
        currentTasks.map((task) => [task._id, task]),
      );
      return tasks.map((task) =>
        pendingTaskIdsRef.current.has(task._id)
          ? { ...task, status: currentById.get(task._id)?.status || task.status }
          : task,
      );
    });
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const projectsById = useMemo(
    () => new Map(projects.map((project) => [project._id, project.name])),
    [projects],
  );

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return boardTasks.filter((task) => {
      const projectId =
        typeof task.project === "string" ? task.project : task.project?._id;
      return (
        (!query || task.title.toLowerCase().includes(query)) &&
        (!projectFilter || projectId === projectFilter) &&
        (!priorityFilter || task.priority === priorityFilter)
      );
    });
  }, [boardTasks, search, projectFilter, priorityFilter]);

  const openEditForm = (task) => setEditingTaskId(task._id);

  const handleDragEnd = async ({ active, over }) => {
    setActiveTask(null);
    if (!over) return;

    const taskId = String(active.id);
    const task = boardTasks.find((item) => item._id === taskId);
    const nextStatus = statuses.find(
      (status) => `column:${status}` === String(over.id),
    );
    if (
      !task ||
      !nextStatus ||
      task.status === nextStatus ||
      pendingTaskIdsRef.current.has(taskId)
    ) {
      return;
    }

    const previousStatus = task.status;
    pendingTaskIdsRef.current.add(taskId);
    setPendingTaskIds((current) => new Set(current).add(taskId));
    setMoveError("");
    setMoveNotice("");
    setBoardTasks((current) =>
      current.map((item) =>
        item._id === taskId ? { ...item, status: nextStatus } : item,
      ),
    );

    try {
      const updatedTask = await updateTask(taskId, { status: nextStatus });
      setBoardTasks((current) =>
        current.map((item) =>
          item._id === taskId ? { ...item, ...updatedTask } : item,
        ),
      );
      setMoveNotice(`“${task.title}” moved to ${nextStatus}.`);
    } catch (requestError) {
      setBoardTasks((current) =>
        current.map((item) =>
          item._id === taskId ? { ...item, status: previousStatus } : item,
        ),
      );
      setMoveError(
        getApiErrorMessage(
          requestError,
          "Task status could not be updated. It was restored to its previous column.",
        ),
      );
    } finally {
      pendingTaskIdsRef.current.delete(taskId);
      setPendingTaskIds((current) => {
        const next = new Set(current);
        next.delete(taskId);
        return next;
      });
    }
  };

  const clearFilters = () => {
    setSearch("");
    setProjectFilter("");
    setPriorityFilter("");
  };
  const hasFilters = Boolean(search || projectFilter || priorityFilter);

  const activeProjectId =
    typeof activeTask?.project === "string"
      ? activeTask.project
      : activeTask?.project?._id;

  return (
    <section>
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-indigo-600">Workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Kanban Board
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Move work forward one clear step at a time. Drag a task to update
            its status.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm sm:self-auto">
          <span className="grid size-9 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
            <Check size={18} />
          </span>
          <div>
            <p className="text-lg font-semibold leading-5 text-slate-900">
              {filteredTasks.length}
            </p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {filteredTasks.length === 1 ? "Task on board" : "Tasks on board"}
            </p>
          </div>
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
              className={`${selectClass} w-full sm:w-48`}
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
            <span className="sr-only">Filter by priority</span>
            <SlidersHorizontal
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              aria-label="Filter by priority"
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              className={`${selectClass} w-full pl-9 sm:w-40`}
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

      {projectsError && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {projectsError}
        </p>
      )}
      {moveError && (
        <div
          role="alert"
          className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          <span className="flex items-start gap-2">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            {moveError}
          </span>
          <button
            type="button"
            onClick={() => setMoveError("")}
            aria-label="Dismiss task update error"
            className="rounded-md p-1 text-rose-700 transition hover:bg-rose-100"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      )}
      {moveNotice && (
        <p
          role="status"
          className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
        >
          {moveNotice}
        </p>
      )}

      <div className="mb-4 mt-6 flex min-h-6 items-center justify-between text-sm text-slate-500">
        <span>
          {isLoading
            ? "Loading tasks…"
            : `${filteredTasks.length} ${
                filteredTasks.length === 1 ? "task" : "tasks"
              } shown`}
        </span>
        <div className="flex items-center gap-4">
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Clear filters
            </button>
          )}
          {error && (
            <button
              type="button"
              onClick={refreshTasks}
              className="inline-flex items-center gap-1.5 font-semibold text-rose-700 hover:text-rose-800"
            >
              <RotateCw size={14} />
              Retry
            </button>
          )}
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-rose-600" />
            <div>
              <h2 className="font-semibold text-rose-900">
                Board tasks couldn’t be loaded
              </h2>
              <p className="mt-1 text-sm leading-6 text-rose-800">{error}</p>
            </div>
          </div>
        </div>
      ) : isLoading ? (
        <KanbanSkeleton />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={({ active }) => {
            setMoveError("");
            setMoveNotice("");
            setActiveTask(
              boardTasks.find((task) => task._id === String(active.id)) || null,
            );
          }}
          onDragCancel={() => setActiveTask(null)}
          onDragEnd={handleDragEnd}
        >
          <div className="grid items-start gap-4 xl:grid-cols-3">
            {statuses.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                tasks={filteredTasks.filter((task) => task.status === status)}
                projectsById={projectsById}
                pendingTaskIds={pendingTaskIds}
                onEdit={openEditForm}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask ? (
              <div className="rotate-1 scale-[1.02] opacity-95">
                <TaskCard
                  task={activeTask}
                  projectName={projectsById.get(activeProjectId) || "Project"}
                  onEdit={() => {}}
                  showEdit={false}
                  showDelete={false}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {editingTaskId && (
        <TaskFormModal
          taskId={editingTaskId}
          projects={projects}
          projectsLoading={projectsLoading}
          projectsError={projectsError}
          onClose={() => setEditingTaskId(null)}
          onSaved={async () => {
            setEditingTaskId(null);
            await refreshTasks();
          }}
        />
      )}
    </section>
  );
}
