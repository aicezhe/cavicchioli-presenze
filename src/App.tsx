import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminSettings from './pages/admin/AdminSettings'
import OperatoreDashboard from './pages/operatore/OperatoreDashboard'
import GenitoreDashboard from './pages/genitore/GenitoreDashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const location = useLocation()
  const { user } = useAuth()

  return (
    // Chiave sull'uid: al cambio utente (login/logout/switch) TUTTO l'albero autenticato
    // viene smontato e ricreato da zero. Così nessuno stato del cabinet precedente
    // (statistiche, classi, bambini, sblocco PIN…) può "lampeggiare" per il nuovo utente.
    <div key={user?.uid ?? 'anon'}>
    {/* Transizione morbida tra le schermate (es. landing scura → schermate chiare):
        la pagina uscente sfuma via, quella entrante sfuma in dentro. */}
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <Routes location={location}>
          {/* Landing: scelta del ruolo. La scuola si ricava dall'account al login. */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login/:role" element={<LoginPage />} />
          {/* Vecchie rotte → nuova landing (compatibilità link salvati) */}
          <Route path="/admin/login" element={<Navigate to="/login/admin" replace />} />
          <Route path="/schools" element={<Navigate to="/" replace />} />

          {/* Qualsiasi utente autenticato: dispatcher che smista in base al ruolo */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          {/* Solo ruolo admin */}
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
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
    </div>
  )
}

export default App
