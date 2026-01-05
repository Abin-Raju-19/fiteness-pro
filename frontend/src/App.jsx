import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './auth/AuthContext.jsx'
import { ProtectedRoute } from './auth/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import SubscriptionPlans from './pages/SubscriptionPlans.jsx'
import Dashboard from './pages/Dashboard.jsx'
import UserProfile from './pages/UserProfile.jsx'
import UserProgress from './pages/UserProgress.jsx'
import WorkoutLibrary from './pages/WorkoutLibrary.jsx'
import DietPlanner from './pages/DietPlanner.jsx'
import Messages from './pages/Messages.jsx'
import Achievements from './pages/Achievements.jsx'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/subscriptions" element={<SubscriptionPlans />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/progress" element={<UserProgress />} />
            <Route path="/workouts" element={<WorkoutLibrary />} />
            <Route path="/diet" element={<DietPlanner />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/achievements" element={<Achievements />} />
          </Route>

          <Route path="*" element={<Login />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
