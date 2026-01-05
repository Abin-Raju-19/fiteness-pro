export default function DietPlanner() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50">
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
                <span className="text-xs text-slate-400">Target: 2200 kcal</span>
              </div>
              
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div className="rounded-xl bg-slate-950 p-3">
                  <p className="text-xs text-slate-400">Protein</p>
                  <p className="mt-1 text-lg font-semibold text-sky-400">120g</p>
                  <p className="text-[10px] text-slate-500">/ 180g</p>
                </div>
                <div className="rounded-xl bg-slate-950 p-3">
                  <p className="text-xs text-slate-400">Carbs</p>
                  <p className="mt-1 text-lg font-semibold text-emerald-400">180g</p>
                  <p className="text-[10px] text-slate-500">/ 250g</p>
                </div>
                <div className="rounded-xl bg-slate-950 p-3">
                  <p className="text-xs text-slate-400">Fats</p>
                  <p className="mt-1 text-lg font-semibold text-amber-400">45g</p>
                  <p className="text-[10px] text-slate-500">/ 70g</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-50">Meal Plan</h2>
                <button className="text-xs font-medium text-sky-400 hover:text-sky-300">
                  + Add Item
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((meal) => (
                  <div key={meal} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                    <p className="text-xs font-medium text-slate-300">{meal}</p>
                    <div className="mt-2 text-center text-xs text-slate-500 py-2 border-t border-slate-800/50 border-dashed">
                      No items added yet
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
             <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
               <h2 className="text-sm font-semibold text-slate-50">AI Suggestions</h2>
               <p className="mt-2 text-xs text-slate-400">
                 Based on your workout history, we recommend increasing your protein intake today.
               </p>
               <button className="mt-4 w-full rounded-full bg-slate-800 py-2 text-xs font-medium text-slate-100 transition hover:bg-slate-700">
                 Generate Meal Plan
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
