import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SchoolsPage from './pages/SchoolsPage'
import SchoolRolePage from './pages/SchoolRolePage'
import DashboardPage from './pages/DashboardPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import OperatoreDashboard from './pages/operatore/OperatoreDashboard'
import GenitoreDashboard from './pages/genitore/GenitoreDashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      {/* Livello piattaforma NOTA */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin/login" element={<LoginPage platformAdmin />} />

      {/* Livello scuola: directory → scelta ruolo → login */}
      <Route path="/schools" element={<SchoolsPage />} />
      <Route path="/schools/:schoolId/role" element={<SchoolRolePage />} />
      <Route path="/schools/:schoolId/login/:role" element={<LoginPage />} />

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
