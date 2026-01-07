import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

export default function TrainerDashboard({ user }) {
  const [athletes, setAthletes] = useState([])
  const [showAssignModal, setShowAssignModal] = useState(false)
  
  // Assign Plan State
  const [selectedAthleteId, setSelectedAthleteId] = useState('')
  const [planSummary, setPlanSummary] = useState('Weekly Strength & Cardio')
  const [assigning, setAssigning] = useState(false)
  const [assignResult, setAssignResult] = useState('')

  // Diet Plan State
  const [showDietModal, setShowDietModal] = useState(false)
  const [dietForm, setDietForm] = useState({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fats: 70
  })
  const [assigningDiet, setAssigningDiet] = useState(false)
  const [dietAssignResult, setDietAssignResult] = useState('')

  // Live Session State
  const [startingSession, setStartingSession] = useState(false)

  useEffect(() => {
    // Fetch athletes on mount
    api.get('/trainer/athletes')
      .then(res => setAthletes(res.athletes || []))
      .catch(err => console.error('Failed to load athletes', err))
  }, [])

  const handleAssignPlan = async (e) => {
    e.preventDefault()
    if (!selectedAthleteId) return
    setAssigning(true)
    setAssignResult('')
    
    // Simple template plan
    const plan = {
      summary: planSummary,
      schedule: [
        { day: 'Monday', title: 'Full Body Strength', focus: 'Strength', workoutId: 'w_fb_01' },
        { day: 'Wednesday', title: 'HIIT Cardio', focus: 'Cardio', workoutId: 'w_hiit_01' },
        { day: 'Friday', title: 'Mobility & Core', focus: 'Recovery', workoutId: 'w_mob_01' }
      ],
      recommendations: ['Drink 3L water', 'Sleep 8h', 'Stretch daily']
    }

    try {
      await api.post('/trainer/assign-plan', { userId: selectedAthleteId, plan })
      setAssignResult('Plan assigned successfully!')
      setTimeout(() => {
        setShowAssignModal(false)
        setAssignResult('')
        setSelectedAthleteId('')
      }, 2000)
    } catch (err) {
      setAssignResult('Failed to assign plan: ' + (err.response?.data?.error || err.message))
    } finally {
      setAssigning(false)
    }
  }

  const handleAssignDietPlan = async (e) => {
    e.preventDefault()
    if (!selectedAthleteId) return
    setAssigningDiet(true)
    setDietAssignResult('')
    
    // Construct diet plan object matching User model
    const dietPlan = {
      calories: Number(dietForm.calories),
      protein: Number(dietForm.protein),
      carbs: Number(dietForm.carbs),
      fats: Number(dietForm.fats),
      meals: [
        {
          name: 'Breakfast',
          items: [{ name: 'Oatmeal & Berries' }, { name: 'Egg Whites' }],
          calories: Math.round(Number(dietForm.calories) * 0.3)
        },
        {
          name: 'Lunch',
          items: [{ name: 'Grilled Chicken' }, { name: 'Brown Rice' }, { name: 'Broccoli' }],
          calories: Math.round(Number(dietForm.calories) * 0.35)
        },
        {
          name: 'Dinner',
          items: [{ name: 'Salmon' }, { name: 'Quinoa' }, { name: 'Asparagus' }],
          calories: Math.round(Number(dietForm.calories) * 0.35)
        }
      ]
    }

    try {
      await api.post('/trainer/assign-diet-plan', { userId: selectedAthleteId, dietPlan })
      setDietAssignResult('Diet plan assigned successfully!')
      setTimeout(() => {
        setShowDietModal(false)
        setDietAssignResult('')
        setSelectedAthleteId('')
      }, 2000)
    } catch (err) {
      setDietAssignResult('Failed to assign diet: ' + (err.response?.data?.error || err.message))
    } finally {
      setAssigningDiet(false)
    }
  }

  const loadDietTemplate = (type) => {
    if (type === 'loss') {
      setDietForm({ calories: 1800, protein: 150, carbs: 150, fats: 60 })
    } else if (type === 'gain') {
      setDietForm({ calories: 2800, protein: 200, carbs: 350, fats: 80 })
    } else {
      setDietForm({ calories: 2300, protein: 170, carbs: 250, fats: 70 })
    }
  }

  const handleStartSession = async () => {
    setStartingSession(true)
    try {
      const res = await api.post('/trainer/live-session')
      if (res.sessionUrl) {
        window.open(res.sessionUrl, '_blank')
      }
    } catch (err) {
      console.error('Failed to start session', err)
      alert('Failed to start live session')
    } finally {
      setStartingSession(false)
    }
  }

  return (
    <div className="space-y-6">
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-50">Assign Workout Plan</h3>
            <form onSubmit={handleAssignPlan} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400">Select Athlete</label>
                <select 
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
                  value={selectedAthleteId}
                  onChange={e => setSelectedAthleteId(e.target.value)}
                  required
                >
                  <option value="">Select an athlete...</option>
                  {athletes.map(a => (
                    <option key={a._id} value={a._id}>{a.name} ({a.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400">Plan Name</label>
                <input 
                  type="text" 
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
                  value={planSummary}
                  onChange={e => setPlanSummary(e.target.value)}
                  required
                />
              </div>
              <div className="rounded-lg bg-slate-950 p-3 text-xs text-slate-400">
                <p className="font-medium text-slate-300 mb-1">Preview Schedule:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Mon: Full Body Strength</li>
                  <li>Wed: HIIT Cardio</li>
                  <li>Fri: Mobility & Core</li>
                </ul>
              </div>
              {assignResult && (
                <p className={`text-xs ${assignResult.includes('Failed') ? 'text-red-400' : 'text-emerald-400'}`}>
                  {assignResult}
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAssignModal(false)} 
                  className="flex-1 rounded-full border border-slate-700 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={assigning} 
                  className="flex-1 rounded-full bg-sky-500 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-50"
                >
                  {assigning ? 'Assigning...' : 'Assign Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDietModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-50">Assign Diet Plan</h3>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => loadDietTemplate('loss')} className="rounded-full bg-slate-800 px-3 py-1 text-[10px] text-slate-300 hover:bg-slate-700">Weight Loss</button>
              <button type="button" onClick={() => loadDietTemplate('maintain')} className="rounded-full bg-slate-800 px-3 py-1 text-[10px] text-slate-300 hover:bg-slate-700">Maintenance</button>
              <button type="button" onClick={() => loadDietTemplate('gain')} className="rounded-full bg-slate-800 px-3 py-1 text-[10px] text-slate-300 hover:bg-slate-700">Muscle Gain</button>
            </div>
            <form onSubmit={handleAssignDietPlan} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400">Select Athlete</label>
                <select 
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
                  value={selectedAthleteId}
                  onChange={e => setSelectedAthleteId(e.target.value)}
                  required
                >
                  <option value="">Select an athlete...</option>
                  {athletes.map(a => (
                    <option key={a._id} value={a._id}>{a.name} ({a.email})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400">Calories (kcal)</label>
                  <input 
                    type="number" 
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
                    value={dietForm.calories}
                    onChange={e => setDietForm({...dietForm, calories: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400">Protein (g)</label>
                  <input 
                    type="number" 
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
                    value={dietForm.protein}
                    onChange={e => setDietForm({...dietForm, protein: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400">Carbs (g)</label>
                  <input 
                    type="number" 
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
                    value={dietForm.carbs}
                    onChange={e => setDietForm({...dietForm, carbs: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400">Fats (g)</label>
                  <input 
                    type="number" 
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
                    value={dietForm.fats}
                    onChange={e => setDietForm({...dietForm, fats: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              {dietAssignResult && (
                <p className={`text-xs ${dietAssignResult.includes('Failed') ? 'text-red-400' : 'text-emerald-400'}`}>
                  {dietAssignResult}
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowDietModal(false)} 
                  className="flex-1 rounded-full border border-slate-700 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={assigningDiet} 
                  className="flex-1 rounded-full bg-sky-500 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-50"
                >
                  {assigningDiet ? 'Assigning...' : 'Assign Diet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              onClick={() => setShowAssignModal(true)}
              className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-4 py-1.5 text-xs font-medium text-slate-100 shadow-sm transition hover:border-sky-500 hover:bg-slate-800"
            >
              Assign workout plan
            </button>
            <button
              type="button"
              onClick={handleStartSession}
              disabled={startingSession}
              className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-4 py-1.5 text-xs font-medium text-slate-100 shadow-sm transition hover:border-sky-500 hover:bg-slate-800 disabled:opacity-50"
            >
              {startingSession ? 'Starting...' : 'Open live session'}
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Active athletes
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-50">{athletes.length || 12}</p>
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
            {athletes.slice(0, 3).map(a => (
              <li key={a._id}>• {a.name} · {a.subscriptionPlan || 'Free'}</li>
            ))}
            {athletes.length === 0 && (
              <>
                <li>• John · Gold · Form feedback today</li>
                <li>• Maya · Platinum · Diet review tomorrow</li>
              </>
            )}
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
            onClick={() => setShowDietModal(true)}
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
            Manage 1:1 chats and live video sessions from here.
          </p>
          <button
            type="button"
            onClick={handleStartSession}
            className="mt-3 inline-flex rounded-full bg-sky-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            Start session
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
