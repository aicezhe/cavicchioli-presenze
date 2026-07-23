import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import OperatoreDashboard from './pages/operatore/OperatoreDashboard'
import GenitoreDashboard from './pages/genitore/GenitoreDashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login/:role" element={<LoginPage />} />

      {/* Qualsiasi utente autenticato: dispatcher che smista in base al ruolo */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>

      {/* Solo ruolo admin */}
      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* Solo ruolo operatore */}
      <Route element={<ProtectedRoute roles={['operatore']} />}>
        <Route path="/operatore" element={<OperatoreDashboard />} />
      </Route>

      {/* Solo ruolo genitore */}
      <Route element={<ProtectedRoute roles={['genitore']} />}>
        <Route path="/genitore" element={<GenitoreDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
