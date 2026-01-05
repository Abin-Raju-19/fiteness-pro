import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function UserDashboard({ user }) {
  const [heightCm, setHeightCm] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [bmi, setBmi] = useState(null)
  const [status, setStatus] = useState('')

  const calculate = () => {
    const h = parseFloat(heightCm)
    const w = parseFloat(weightKg)
    if (!isFinite(h) || !isFinite(w) || h <= 0 || w <= 0) {
      setBmi(null)
      setStatus('Enter valid height and weight')
      return
    }
    const m = h / 100
    const value = w / (m * m)
    const rounded = Math.round(value * 10) / 10
    setBmi(rounded)
    let s = 'Normal'
    if (rounded < 18.5) s = 'Underweight'
    else if (rounded >= 18.5 && rounded < 25) s = 'Normal'
    else if (rounded >= 25 && rounded < 30) s = 'Overweight'
    else s = 'Obese'
    setStatus(s)
  }
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-[2fr,1.2fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">
            Welcome back
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
            Transform your fitness journey, {user?.name}
          </h2>
          <p className="mt-2 text-xs text-slate-400 max-w-lg">
            AI-powered workout plans, personalized diet tracking, and real-time feedback. Stay on
            track one session at a time.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/workouts"
              className="inline-flex items-center rounded-full bg-sky-500 px-4 py-1.5 text-xs font-semibold text-slate-950 shadow-sm transition hover:bg-sky-400"
            >
              Start today&apos;s workout
            </Link>
            <Link
              to="/messages"
              className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-4 py-1.5 text-xs font-medium text-slate-100 shadow-sm transition hover:border-sky-500 hover:bg-slate-800"
            >
              Message Trainer
            </Link>
            <Link
              to="/progress"
              className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-4 py-1.5 text-xs font-medium text-slate-100 shadow-sm transition hover:border-sky-500 hover:bg-slate-800"
            >
              View progress
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            to="/workouts"
            className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              This week
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-50">4 / 5</p>
            <p className="mt-1 text-[11px] text-slate-400">Workouts completed</p>
          </Link>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Current streak
            </p>
            <p className="mt-2 text-2xl font-semibold text-sky-400">7 days</p>
            <p className="mt-1 text-[11px] text-slate-400">Keep it going!</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Workout library
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-50">Home, Gym, Yoga, Bodyweight</p>
          <p className="mt-1 text-[11px] text-slate-400">
            Access on-demand sessions tailored to your goal and subscription.
          </p>
          <Link
            to="/workouts"
            className="mt-3 inline-flex rounded-full bg-slate-800 px-3 py-1.5 text-[11px] font-medium text-slate-100 transition hover:bg-slate-700"
          >
            Browse workouts
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Diet & calories
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-50">Today&apos;s intake</p>
          <p className="mt-1 text-[11px] text-slate-400">
            Once fully wired, see macros, suggested meals, and improvement analysis here.
          </p>
          <Link
            to="/diet"
            className="mt-3 inline-flex rounded-full bg-slate-800 px-3 py-1.5 text-[11px] font-medium text-slate-100 transition hover:bg-slate-700"
          >
            Open diet planner
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Achievements
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-50">Badges & challenges</p>
          <ul className="mt-2 space-y-1.5 text-[11px] text-slate-400">
            <li>• 7-day streak badge unlocked</li>
            <li>• First AI workout completed</li>
            <li>• 3,000 calories burned this week</li>
          </ul>
          <Link
            to="/achievements"
            className="mt-3 inline-flex rounded-full bg-sky-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            View all achievements
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">BMI calculator</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-400">Height (cm)</label>
              <input
                type="number"
                inputMode="decimal"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="e.g. 170"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400">Weight (kg)</label>
              <input
                type="number"
                inputMode="decimal"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="e.g. 65"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={calculate}
            className="mt-4 inline-flex rounded-full bg-sky-500 px-4 py-1.5 text-[11px] font-semibold text-slate-950 shadow-sm transition hover:bg-sky-400"
          >
            Calculate BMI
          </button>
          <div className="mt-3 text-sm">
            {bmi !== null ? (
              <p className="font-semibold text-slate-50">{bmi} kg/m²</p>
            ) : (
              <p className="text-slate-400">No result yet</p>
            )}
            {status && <p className="text-[12px] text-slate-400">{status}</p>}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Subscription
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-50">
              Current plan:{' '}
              <span className="text-sky-400">{user?.subscriptionPlan || 'None'}</span>
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              {user?.subscriptionStatus === 'canceled'
                ? 'Your subscription is canceled. You will have access until the end of the current billing period.'
                : 'Upgrade to unlock AI workouts, live trainer support, and deeper analytics.'}
            </p>
          </div>
          <Link
            to="/subscriptions"
            className="inline-flex rounded-full bg-sky-500 px-4 py-1.5 text-[11px] font-semibold text-slate-950 shadow-sm transition hover:bg-sky-400"
          >
            View plans
          </Link>
        </div>
      </section>
    </div>
  )
}


