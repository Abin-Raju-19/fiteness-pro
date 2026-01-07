import { useEffect, useState } from 'react'
import { api } from '../api/client'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await api.get('/admin/users')
      setUsers(data)
    } catch (err) {
      console.error('Failed to fetch users:', err)
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole })
      // Update local state
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u))
    } catch (err) {
      console.error('Failed to update role:', err)
      alert('Failed to update user role')
    }
  }

  if (loading) return <div className="p-10 text-center text-slate-400">Loading users...</div>
  if (error) return <div className="p-10 text-center text-red-400">{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-50">User Management</h2>
          <p className="mt-1 text-xs text-slate-400">View and manage all registered users.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950/50 text-xs uppercase text-slate-300">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Plan</th>
                <th className="px-6 py-4 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-medium text-slate-200">{user.name}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs font-medium text-slate-200 focus:border-sky-500 focus:outline-none"
                    >
                      <option value="user">User</option>
                      <option value="trainer">Trainer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${
                      user.subscriptionPlan === 'PLATINUM' ? 'bg-indigo-500/10 text-indigo-400' :
                      user.subscriptionPlan === 'GOLD' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-slate-700/50 text-slate-400'
                    }`}>
                      {user.subscriptionPlan || 'FREE'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
