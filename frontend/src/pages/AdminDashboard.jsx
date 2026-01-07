import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

export default function AdminDashboard({ user }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get('/admin/stats')
        setStats(data)
      } catch (err) {
        console.error('Failed to fetch admin stats:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) return <div className="p-10 text-center text-slate-400">Loading dashboard...</div>
  if (error) return <div className="p-10 text-center text-red-400">{error}</div>

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
            <Link
              to="/admin/users"
              className="inline-flex items-center rounded-full bg-sky-500 px-4 py-1.5 text-xs font-semibold text-slate-950 shadow-sm transition hover:bg-sky-400"
            >
              Open user management
            </Link>
            <Link
              to="/messages"
              className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-4 py-1.5 text-xs font-medium text-slate-100 shadow-sm transition hover:border-sky-500 hover:bg-slate-800"
            >
              Open messages
            </Link>
            <Link
              to="/workouts"
              className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-4 py-1.5 text-xs font-medium text-slate-100 shadow-sm transition hover:border-sky-500 hover:bg-slate-800"
            >
              Edit content library
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Monthly revenue
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-50">
              ${stats?.revenue?.toLocaleString() ?? 0}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">From active subscriptions</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Active subs
            </p>
            <p className="mt-2 text-2xl font-semibold text-sky-400">
              {stats?.activeSubs ?? 0}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">Users across all plans</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Total Users
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-50">{stats?.totalUsers ?? 0}</p>
          <p className="mt-1 text-[11px] text-slate-400">
            Registered accounts on the platform.
          </p>
          <Link
            to="/admin/users"
            className="mt-3 inline-flex rounded-full bg-slate-800 px-3 py-1.5 text-[11px] font-medium text-slate-100 transition hover:bg-slate-700"
          >
            Manage roles
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Plan Breakdown
          </p>
          <div className="mt-2 space-y-1">
             <div className="flex justify-between text-xs text-slate-300">
               <span>Silver</span>
               <span>{stats?.plans?.silver ?? 0}</span>
             </div>
             <div className="flex justify-between text-xs text-slate-300">
               <span>Gold</span>
               <span>{stats?.plans?.gold ?? 0}</span>
             </div>
             <div className="flex justify-between text-xs text-slate-300">
               <span>Platinum</span>
               <span>{stats?.plans?.platinum ?? 0}</span>
             </div>
          </div>
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
            className="mt-3 inline-flex rounded-full bg-sky-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950 transition hover:bg-sky-400 cursor-not-allowed opacity-70"
            disabled
          >
            View logs (Coming Soon)
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
            className="inline-flex rounded-full bg-slate-800 px-4 py-1.5 text-[11px] font-semibold text-slate-100 shadow-sm transition hover:bg-slate-700 cursor-not-allowed opacity-70"
            disabled
          >
            Edit global settings (Coming Soon)
          </button>
        </div>
      </section>
    </div>
  )
}
