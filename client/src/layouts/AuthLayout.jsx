import { Workflow } from "lucide-react";
import { Link } from "react-router-dom";

function BrandMark({ light = false }) {
  return (
    <Link
      to="/"
      className={`inline-flex w-fit items-center gap-2.5 font-bold tracking-tight ${
        light ? "text-white" : "text-slate-950"
      }`}
    >
      <span className="grid size-10 place-items-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-950/20">
        <Workflow size={21} strokeWidth={2.2} />
      </span>
      <span className="text-xl">FlowForge</span>
    </Link>
  );
}

export default function AuthLayout({ eyebrow, title, description, children }) {
  return (
    <main className="min-h-screen bg-[#f7f8fc] lg:grid lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
      <aside className="relative hidden min-h-screen overflow-hidden bg-[#101735] px-12 py-10 text-white lg:flex lg:flex-col xl:px-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-36 -top-32 size-[34rem] rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-12 size-[25rem] rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-48 -left-32 size-[34rem] rounded-full bg-indigo-500/20 blur-3xl"
        />
        <div className="relative z-10">
          <BrandMark light />
        </div>
        <div className="relative z-10 my-auto max-w-xl pb-16">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-2 text-xs font-medium tracking-wide text-indigo-100">
            <span className="size-1.5 rounded-full bg-cyan-300" />
            A clearer way to move work forward
          </div>
          <h1 className="max-w-lg text-5xl font-semibold leading-[1.12] tracking-tight xl:text-6xl">
            Make room for your team’s best work.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-slate-300">
            Bring focus to the work ahead. Sign in to continue to your FlowForge
            workspace.
          </p>
          <div className="mt-12 flex items-center gap-3 text-sm text-slate-300">
            <span className="grid size-9 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-xs font-semibold text-white">
              FF
            </span>
            <span>Designed for teams that build together</span>
          </div>
        </div>
        <p className="relative z-10 text-xs text-slate-500">
          © {new Date().getFullYear()} FlowForge
        </p>
      </aside>

      <section className="flex min-h-screen flex-col px-5 py-7 sm:px-8 lg:px-12 xl:px-20">
        <div className="lg:hidden">
          <BrandMark />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <div className="mb-8 lg:hidden">
            <p className="text-sm font-semibold text-indigo-600">{eyebrow}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {title}
            </h1>
          </div>
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.24)] sm:p-9">
            <div className="mb-8 hidden lg:block">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                {eyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {description}
              </p>
            </div>
            {children}
          </div>
          <p className="mt-7 text-center text-xs leading-5 text-slate-500">
            By continuing, you agree to use FlowForge responsibly and keep your
            account credentials private.
          </p>
        </div>
        <div className="hidden justify-between text-xs text-slate-400 sm:flex">
          <span>FlowForge</span>
          <span>Build with clarity.</span>
        </div>
      </section>
    </main>
  );
}
