import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
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
  const location = useLocation()

  return (
    // Transizione morbida tra le schermate (es. landing scura → schermate chiare):
    // la pagina uscente sfuma via, quella entrante sfuma in dentro.
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <Routes location={location}>
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
      </motion.div>
    </AnimatePresence>
  )
}

export default App
