import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/client.js'
import { useAuth } from '../auth/AuthContext.jsx'

export default function WorkoutLibrary() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('All')
  const [cart, setCart] = useState([])
  const [cartSyncing, setCartSyncing] = useState(false)
  const [plan, setPlan] = useState(null)
  const [planError, setPlanError] = useState('')
  const [planLoading, setPlanLoading] = useState(false)
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    api
      .get('/user/workouts')
      .then((data) => setWorkouts(data.workouts ?? []))
      .catch((err) => setError(err.message || 'Failed to load workouts'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    api
      .get('/user/cart')
      .then((data) => setCart(data.items ?? []))
      .catch((err) => setError(err.message || 'Failed to load saved plan'))
  }, [])

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(workouts.map((w) => w.category)))],
    [workouts]
  )

  const visible = workouts.filter((w) => filter === 'All' || w.category === filter)

  const syncCart = async (nextCart) => {
    setCart(nextCart)
    setCartSyncing(true)
    try {
      await api.put('/user/cart', { items: nextCart })
    } catch (err) {
      setError(err.message || 'Failed to sync cart')
    } finally {
      setCartSyncing(false)
    }
  }

  const handleAddToCart = (workout) => {
    if (cart.some((item) => item.id === workout.id)) return
    void syncCart([...cart, workout])
  }

  const handleRemoveFromCart = (id) => {
    void syncCart(cart.filter((item) => item.id !== id))
  }

  const handleGeneratePlan = async () => {
    setPlanError('')
    setPlanLoading(true)
    try {
      const res = await api.post('/user/ai-plan', { items: cart })
      setPlan(res.plan)
    } catch (err) {
      setPlanError(err.message || 'Failed to generate AI plan')
    } finally {
      setPlanLoading(false)
    }
  }

  const handleAssignPlan = async () => {
    if (!plan) return
    setAssigning(true)
    setPlanError('')
    try {
      await api.post('/user/workout-plan', { plan })
      // Optional: Redirect or show success notification
      alert('Workout plan assigned successfully!')
    } catch (err) {
      setPlanError(err.message || 'Failed to assign plan')
    } finally {
      setAssigning(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">
              Workouts
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Workout library
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Browse AI-curated sessions by category. Later, this will be filtered by your
              subscription tier and goals.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Category</span>
            <select
              className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] text-slate-50 outline-none ring-0 transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </header>

        {error && (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-slate-400">Loading workouts…</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
            <div className="grid gap-4 sm:grid-cols-2">
              {visible.map((w) => {
                const inCart = cart.some((item) => item.id === w.id)
                return (
                  <div
                    key={w.id}
                    className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-400">
                      {w.category}
                    </p>
                    <h2 className="mt-1 text-sm font-semibold text-slate-50">{w.title}</h2>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {w.difficulty} · {w.durationMinutes} min
                    </p>
                    {inCart ? (
                      <button
                        type="button"
                        className="mt-3 inline-flex rounded-full bg-slate-800 px-3 py-1.5 text-[11px] font-semibold text-slate-100 shadow-sm transition hover:bg-slate-700"
                        onClick={() => handleRemoveFromCart(w.id)}
                      >
                        Remove from plan
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="mt-3 inline-flex rounded-full bg-sky-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950 shadow-sm transition hover:bg-sky-400"
                        onClick={() => handleAddToCart(w)}
                      >
                        Add to plan
                      </button>
                    )}
                  </div>
                )
              })}
              {visible.length === 0 && (
                <p className="text-xs text-slate-400">No workouts match this filter yet.</p>
              )}
            </div>

            <aside className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                My workout plan
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-50">
                {cart.length} workout{cart.length === 1 ? '' : 's'} selected
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Add workouts to this cart to craft a daily routine. Later this will sync with AI plans
                and trainers.
              </p>

              <div className="mt-3 space-y-2 text-[11px] text-slate-400">
                {cart.length === 0 ? (
                  <p>No workouts added yet.</p>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-3 py-2"
                    >
                      <div>
                        <p className="text-slate-100">{item.title}</p>
                        <p className="text-slate-500">
                          {item.category} · {item.durationMinutes} min
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="text-[11px] text-slate-400 transition hover:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>

              <button
                type="button"
                disabled={cart.length === 0 || cartSyncing}
                onClick={handleGeneratePlan}
                className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-sky-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950 shadow-sm transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {planLoading ? 'Generating plan…' : 'Generate AI plan'}
              </button>
              {cartSyncing && (
                <p className="mt-2 text-[11px] text-slate-500">Syncing cart…</p>
              )}
            </aside>
          </div>
        )}

        {(plan || planError) && (
          <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              AI plan preview
            </p>
            {planError && (
              <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                {planError}
              </p>
            )}
            {plan && (
              <>
                <p className="text-sm font-semibold text-slate-50">{plan.summary}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Schedule
                    </p>
                    <ul className="mt-2 space-y-1.5 text-[11px] text-slate-400">
                      {plan.schedule.map((item) => (
                        <li key={item.day}>
                          <span className="text-slate-100">{item.day}:</span> {item.title} (
                          {item.focus})
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Recommendations
                    </p>
                    <ul className="mt-2 space-y-1.5 text-[11px] text-slate-400">
                      {plan.recommendations.map((rec) => (
                        <li key={rec}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleAssignPlan}
                    disabled={assigning}
                    className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
                  >
                    {assigning ? 'Saving...' : 'Assign this Plan'}
                  </button>
                </div>
              </>
            )}
          </section>
        )}
      </div>
    </div>
  )
}


