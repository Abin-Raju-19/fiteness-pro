import { Link } from 'react-router-dom'

export default function AdminDashboard({ user }) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-[2fr,1.2fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">
            Admin overview
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
            Full control of your fitness platform, {user?.name}
          </h2>
          <p className="mt-2 text-xs text-slate-400 max-w-lg">
            Monitor users, trainers, subscriptions, and global settings from a single control
            center inspired by TrainPlus.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex items-center rounded-full bg-sky-500 px-4 py-1.5 text-xs font-semibold text-slate-950 shadow-sm transition hover:bg-sky-400"
            >
              Open user management
            </button>
            <button
              type="button"
              className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-4 py-1.5 text-xs font-medium text-slate-100 shadow-sm transition hover:border-sky-500 hover:bg-slate-800"
            >
              Edit content library
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Monthly revenue
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-50">$12.4k</p>
            <p className="mt-1 text-[11px] text-slate-400">From active subscriptions</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Active subs
            </p>
            <p className="mt-2 text-2xl font-semibold text-sky-400">432</p>
            <p className="mt-1 text-[11px] text-slate-400">Users across all plans</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Users & trainers
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-50">Roles & permissions</p>
          <p className="mt-1 text-[11px] text-slate-400">
            Manage user accounts, trainer access, and admin permissions.
          </p>
          <button
            type="button"
            className="mt-3 inline-flex rounded-full bg-slate-800 px-3 py-1.5 text-[11px] font-medium text-slate-100 transition hover:bg-slate-700"
          >
            Manage roles
          </button>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Subscriptions
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-50">Plan adoption</p>
          <p className="mt-1 text-[11px] text-slate-400">
            Track how many users are on Silver, Gold, and Platinum and monitor churn.
          </p>
          <Link
            to="/subscriptions"
            className="mt-3 inline-flex rounded-full bg-slate-800 px-3 py-1.5 text-[11px] font-medium text-slate-100 transition hover:bg-slate-700"
          >
            View plans & pricing
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            System health
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-50">API & services</p>
          <p className="mt-1 text-[11px] text-slate-400">
            Future charts will surface uptime, error rates, and AI service performance here.
          </p>
          <button
            type="button"
            className="mt-3 inline-flex rounded-full bg-sky-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            View logs
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Content & challenges
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-50">
              Curate the workout and challenge experience
            </p>
            <p className="mt-1 text-[11px] text-slate-400 max-w-xl">
              Configure workout libraries, diet templates, and weekly challenges that align with
              each subscription tier, similar to the TrainPlus pricing and feature grid.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex rounded-full bg-slate-800 px-4 py-1.5 text-[11px] font-semibold text-slate-100 shadow-sm transition hover:bg-slate-700"
          >
            Edit global settings
          </button>
        </div>
      </section>
    </div>
  )
}


