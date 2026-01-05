import { Link } from 'react-router-dom'

export default function TrainerDashboard({ user }) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-[2fr,1.2fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">
            Trainer console
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
            Coach your athletes with data, {user?.name}
          </h2>
          <p className="mt-2 text-xs text-slate-400 max-w-lg">
            Monitor user progress, assign AI-powered workout and diet plans, and connect via chat or
            live sessions.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/messages"
              className="inline-flex items-center rounded-full bg-sky-500 px-4 py-1.5 text-xs font-semibold text-slate-950 shadow-sm transition hover:bg-sky-400"
            >
              Open messages
            </Link>
            <button
              type="button"
              className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-4 py-1.5 text-xs font-medium text-slate-100 shadow-sm transition hover:border-sky-500 hover:bg-slate-800"
            >
              Assign workout plan
            </button>
            <button
              type="button"
              className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-4 py-1.5 text-xs font-medium text-slate-100 shadow-sm transition hover:border-sky-500 hover:bg-slate-800"
            >
              Open live session
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Active athletes
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-50">12</p>
            <p className="mt-1 text-[11px] text-slate-400">Users assigned to you</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Engagement rate
            </p>
            <p className="mt-2 text-2xl font-semibold text-sky-400">86%</p>
            <p className="mt-1 text-[11px] text-slate-400">Workouts completed last week</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Athlete queue
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-50">Upcoming check-ins</p>
          <ul className="mt-2 space-y-1.5 text-[11px] text-slate-400">
            <li>• John · Gold · Form feedback today</li>
            <li>• Maya · Platinum · Diet review tomorrow</li>
            <li>• Ali · Silver · Plan update in 3 days</li>
          </ul>
          <button
            type="button"
            className="mt-3 inline-flex rounded-full bg-slate-800 px-3 py-1.5 text-[11px] font-medium text-slate-100 transition hover:bg-slate-700"
          >
            View all athletes
          </button>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Diet plans
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-50">Templates & assignments</p>
          <p className="mt-1 text-[11px] text-slate-400">
            Quickly assign calorie targets and macro profiles based on athlete goals.
          </p>
          <button
            type="button"
            className="mt-3 inline-flex rounded-full bg-slate-800 px-3 py-1.5 text-[11px] font-medium text-slate-100 transition hover:bg-slate-700"
          >
            Open diet library
          </button>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Live support
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-50">Chat & video</p>
          <p className="mt-1 text-[11px] text-slate-400">
            When fully implemented, manage 1:1 chats and live video sessions from here.
          </p>
          <button
            type="button"
            className="mt-3 inline-flex rounded-full bg-sky-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            Open communications
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Analytics
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-50">
              Upcoming: deeper performance analytics
            </p>
            <p className="mt-1 text-[11px] text-slate-400 max-w-xl">
              This section will evolve into charts and funnels for adherence, engagement, and plan
              effectiveness across your assigned users.
            </p>
          </div>
          <Link
            to="/subscriptions"
            className="inline-flex rounded-full bg-slate-800 px-4 py-1.5 text-[11px] font-semibold text-slate-100 shadow-sm transition hover:bg-slate-700"
          >
            View trainer entitlements
          </Link>
        </div>
      </section>
    </div>
  )
}


