import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { api } from '../api/client.js'

export default function UserProgress() {
  const [points, setPoints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/user/progress')
      .then((data) => setPoints(data.points ?? []))
      .catch((err) => setError(err.message || 'Failed to load progress'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">
            Progress
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Weight & BMI trends
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Visualize how your body metrics evolve over time. These charts will later use real
            workout and measurement data.
          </p>
        </header>

        {error && (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {error}
          </p>
        )}

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Weight (kg)
            </p>
            <div className="mt-3 h-56">
              {loading ? (
                <p className="text-xs text-slate-400">Loading…</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={points}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              BMI
            </p>
            <div className="mt-3 h-56">
              {loading ? (
                <p className="text-xs text-slate-400">Loading…</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={points}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line
                      type="monotone"
                      dataKey="bmi"
                      stroke="#a855f7"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}


