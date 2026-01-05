import { useEffect, useState } from 'react'
import { api } from '../api/client.js'

export default function UserProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/user/profile')
      .then((data) => setProfile(data))
      .catch((err) => setError(err.message || 'Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50">
        <p className="text-sm text-slate-400">Loading profile…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50">
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {error}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">
            Profile
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Your account & preferences
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Manage your identity, role, and subscription details.
          </p>
        </header>

        <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-300">{profile?.id}</p>
              <p className="mt-1 text-sm text-slate-400">
                Role:{' '}
                <span className="font-semibold text-slate-50 text-xs uppercase">
                  {profile?.role}
                </span>
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Subscription:{' '}
                <span className="font-semibold text-sky-400">
                  {profile?.subscriptionPlan || 'None'}
                </span>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}


