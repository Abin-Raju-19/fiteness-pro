import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

const ROLES = [
  { value: 'user', label: 'User' },
  { value: 'trainer', label: 'Trainer (code required)' },
  { value: 'admin', label: 'Admin (code required)' }
]

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const [secretCode, setSecretCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const requiresCode = role === 'trainer' || role === 'admin'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({
        name,
        email,
        password,
        role,
        secretCode: requiresCode ? secretCode : undefined
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-50">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">
            Fitness OS
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-1 text-xs text-slate-400">
            Choose your role and start your training journey in seconds.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1 text-left">
            <label className="text-xs font-medium text-slate-200" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              type="text"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-0 transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1 text-left">
            <label className="text-xs font-medium text-slate-200" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-0 transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1 text-left">
            <label className="text-xs font-medium text-slate-200" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-0 transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1 text-left">
            <label className="text-xs font-medium text-slate-200" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-0 transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {requiresCode && (
            <div className="space-y-1 text-left">
              <label className="text-xs font-medium text-slate-200" htmlFor="secretCode">
                Secret code
              </label>
              <input
                id="secretCode"
                type="password"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-0 transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                required={requiresCode}
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Trainers and admins must provide a valid invitation code.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-sky-400 hover:text-sky-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}


