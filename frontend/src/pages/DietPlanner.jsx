import { useEffect, useState } from 'react'
import { api } from '../api/client'

export default function DietPlanner() {
  const [dietPlan, setDietPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [addingItem, setAddingItem] = useState(false)
  const [newItem, setNewItem] = useState({ mealName: 'Breakfast', item: '', calories: '' })

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await api.get('/user/diet-plan')
        if (res.dietPlan) setDietPlan(res.dietPlan)
      } catch (err) {
        console.error('Failed to fetch diet plan', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPlan()
  }, [])

  const handleGeneratePlan = async () => {
    setGenerating(true)
    setError('')
    try {
      const res = await api.post('/user/ai-diet-plan')
      setDietPlan(res.dietPlan)
    } catch (err) {
      setError(err.message || 'Failed to generate plan')
    } finally {
      setGenerating(false)
    }
  }

  const handleAddItem = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/user/diet-plan/add-item', newItem)
      setDietPlan(res.dietPlan)
      setAddingItem(false)
      setNewItem({ ...newItem, item: '', calories: '', imageUrl: '' })
    } catch (err) {
      setError(err.message || 'Failed to add item')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50">
      {addingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-50">Add Food Item</h3>
            <form onSubmit={handleAddItem} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400">Meal</label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
                  value={newItem.mealName}
                  onChange={(e) => setNewItem({ ...newItem, mealName: e.target.value })}
                >
                  {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400">Food Item</label>
                <input
                  type="text"
                  placeholder="e.g., Banana"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
                  value={newItem.item}
                  onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400">Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., https://example.com/banana.jpg"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
                  value={newItem.imageUrl}
                  onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400">Calories</label>
                <input
                  type="number"
                  placeholder="e.g., 100"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
                  value={newItem.calories}
                  onChange={(e) => setNewItem({ ...newItem, calories: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddingItem(false)}
                  className="flex-1 rounded-full border border-slate-700 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-full bg-sky-500 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">
            Nutrition
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Diet Planner
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Track your calories, plan your meals, and get AI suggestions.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-50">Today's Macros</h2>
                <span className="text-xs text-slate-400">Target: {dietPlan?.calories || 2200} kcal</span>
              </div>
              
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div className="rounded-xl bg-slate-950 p-3">
                  <p className="text-xs text-slate-400">Protein</p>
                  <p className="mt-1 text-lg font-semibold text-sky-400">{dietPlan?.protein || 0}g</p>
                  <p className="text-[10px] text-slate-500">/ 180g</p>
                </div>
                <div className="rounded-xl bg-slate-950 p-3">
                  <p className="text-xs text-slate-400">Carbs</p>
                  <p className="mt-1 text-lg font-semibold text-emerald-400">{dietPlan?.carbs || 0}g</p>
                  <p className="text-[10px] text-slate-500">/ 250g</p>
                </div>
                <div className="rounded-xl bg-slate-950 p-3">
                  <p className="text-xs text-slate-400">Fats</p>
                  <p className="mt-1 text-lg font-semibold text-amber-400">{dietPlan?.fats || 0}g</p>
                  <p className="text-[10px] text-slate-500">/ 70g</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-50">Meal Plan</h2>
                <button 
                  onClick={() => setAddingItem(true)}
                  className="text-xs font-medium text-sky-400 hover:text-sky-300"
                >
                  + Add Item
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((mealName) => {
                  const meal = dietPlan?.meals?.find(m => m.name === mealName)
                  return (
                    <div key={mealName} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-medium text-slate-300">{mealName}</p>
                        {meal && <span className="text-[10px] text-slate-500">{meal.calories} kcal</span>}
                      </div>
                      <div className="mt-2 text-xs text-slate-400 py-2 border-t border-slate-800/50 border-dashed">
                        {meal && meal.items.length > 0 ? (
                          <ul className="space-y-2">
                            {meal.items.map((item, i) => {
                              const itemName = typeof item === 'string' ? item : item.name
                              const itemImage = typeof item === 'string' ? null : item.imageUrl
                              
                              return (
                                <li key={i} className="flex items-center gap-2">
                                  {itemImage && (
                                    <img 
                                      src={itemImage} 
                                      alt={itemName} 
                                      className="h-8 w-8 rounded-md object-cover opacity-70 transition-opacity hover:opacity-100"
                                    />
                                  )}
                                  <span className="text-slate-300">{itemName}</span>
                                </li>
                              )
                            })}
                          </ul>
                        ) : (
                          <p className="text-center text-slate-500">No items added yet</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
             <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
               <h2 className="text-sm font-semibold text-slate-50">AI Suggestions</h2>
               <p className="mt-2 text-xs text-slate-400">
                 Based on your workout history, we recommend increasing your protein intake today.
               </p>
               {error && (
                 <p className="mt-2 text-xs text-red-400">{error}</p>
               )}
               <button 
                 onClick={handleGeneratePlan}
                 disabled={generating}
                 className="mt-4 w-full rounded-full bg-slate-800 py-2 text-xs font-medium text-slate-100 transition hover:bg-slate-700 disabled:opacity-50"
               >
                 {generating ? 'Generating...' : 'Generate Meal Plan'}
               </button>
             </div>
             
             <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
               <h2 className="text-sm font-semibold text-slate-50">Hydration</h2>
               <div className="mt-4 flex items-center justify-center gap-2">
                 {[1,2,3,4,5].map(i => (
                   <div key={i} className={`h-8 w-6 rounded-md ${i <= 3 ? 'bg-sky-500' : 'bg-slate-800'}`}></div>
                 ))}
               </div>
               <p className="mt-3 text-center text-xs text-slate-400">1.5L / 2.5L</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
