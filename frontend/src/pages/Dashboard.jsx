import { useAuth } from '../auth/AuthContext.jsx'
import UserDashboard from './UserDashboard.jsx'
import TrainerDashboard from './TrainerDashboard.jsx'
import AdminDashboard from './AdminDashboard.jsx'

export default function Dashboard() {
  const { user, logout } = useAuth()

  const role = user?.role ?? 'user'

  let roleDashboard = <UserDashboard user={user} />
  if (role === 'trainer') {
    roleDashboard = <TrainerDashboard user={user} />
  } else if (role === 'admin') {
    roleDashboard = <AdminDashboard user={user} />
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">
              Dashboard
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Hi, {user?.name}
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Role: <span className="font-medium text-slate-100">{user?.role}</span> · Plan:{' '}
              <span className="font-medium text-slate-100">
                {user?.subscriptionPlan || 'None yet'}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-100 shadow-sm transition hover:border-sky-500 hover:bg-slate-800"
          >
            Sign out
          </button>
        </header>

        {roleDashboard}
      </div>
    </div>
  )
}


