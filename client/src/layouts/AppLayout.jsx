import { useState } from "react";
import {
  CheckSquare,
  LayoutDashboard,
  LogOut,
  Menu,
  Workflow,
  X,
  FolderKanban,
} from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const navigation = [
  { label: "Overview", to: "/dashboard", icon: LayoutDashboard, end: true },
  { label: "Projects", to: "/projects", icon: FolderKanban },
  { label: "My Tasks", to: "/tasks", icon: CheckSquare },
];

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

function SidebarContent({ user, onNavigate, onLogout }) {
  return (
    <>
      <Link
        to="/dashboard"
        onClick={onNavigate}
        className="inline-flex w-fit items-center gap-2.5 px-2 font-bold tracking-tight text-white"
      >
        <span className="grid size-10 place-items-center rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-950/30">
          <Workflow size={21} strokeWidth={2.2} />
        </span>
        <span className="text-xl">FlowForge</span>
      </Link>

      <div className="mt-10">
        <p className="px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
          Workspace
        </p>
        <nav aria-label="Main navigation" className="mt-3 space-y-1">
          {navigation.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `group flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-indigo-500/15 text-white ring-1 ring-inset ring-indigo-400/20"
                    : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              <span>{label}</span>
              {label === "My Tasks" && (
                <span className="ml-auto rounded-md bg-white/[0.07] px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
                  Soon
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto border-t border-white/10 pt-5">
        <div className="flex items-center gap-3 px-2">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-indigo-400/20 text-sm font-bold text-indigo-100">
            {getInitials(user?.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {user?.name}
            </p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="mt-4 flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-2 focus-visible:outline-indigo-400"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const closeMobileMenu = () => setIsMobileOpen(false);

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[17rem] flex-col border-r border-white/5 bg-[#101735] px-4 py-6 text-white transition-transform duration-300 lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex min-h-0 flex-1 flex-col px-2">
          <SidebarContent
            user={user}
            onNavigate={closeMobileMenu}
            onLogout={handleLogout}
          />
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={closeMobileMenu}
            className="absolute right-4 top-7 rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={19} />
          </button>
        </div>
      </aside>

      <div className="lg:pl-[17rem]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-7 lg:hidden">
          <button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={isMobileOpen}
            onClick={() => setIsMobileOpen(true)}
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
          >
            <Menu size={21} />
          </button>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 font-bold tracking-tight text-slate-950"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-white">
              <Workflow size={18} />
            </span>
            FlowForge
          </Link>
          <div className="grid size-9 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
            {getInitials(user?.name)}
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-7 sm:py-9 lg:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
