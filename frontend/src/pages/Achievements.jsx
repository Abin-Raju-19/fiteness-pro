import { useEffect, useState } from 'react'
import { api } from '../api/client.js'

export default function Achievements() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/user/achievements')
      .then((data) => setItems(data.achievements ?? []))
      .catch((err) => setError(err.message || 'Failed to load achievements'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">
            Achievements
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Badges & milestones
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Your earned badges, streaks, and weekly goals.
          </p>
        </header>

        {error && (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {error}
          </p>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-center text-slate-400">
            Loading achievements...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-center text-slate-400">
            No achievements yet. Keep training to unlock badges.
          </div>
        ) : (
          <section className="grid gap-4 md:grid-cols-2">
            {items.map((a) => (
              <div key={a.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-50">{a.title}</h3>
                  <span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] text-slate-200">
                    +{a.points} pts
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{a.description}</p>
                <p className="mt-2 text-[11px] text-slate-500">
                  {new Date(a.earnedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  )
}

