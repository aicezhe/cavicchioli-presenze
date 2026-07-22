import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../types'

type ProtectedRouteProps = {
  /** Se indicato, l'accesso è consentito solo a questi ruoli; altrimenti a qualsiasi utente autenticato */
  roles?: Role[]
}

/** Wrapper per le rotte private: senza sessione si torna alla home;
    con un ruolo non consentito si torna al proprio dashboard generico */
export default function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-warmgray text-sm animate-pulse">Caricamento…</span>
      </div>
    )
  }

  // Nessuna sessione → home con la scelta del ruolo
  if (!user) return <Navigate to="/" replace />

  // Rotta vincolata a un ruolo: se il profilo non corrisponde, rimando al dashboard generico
  if (roles && (!profile || !roles.includes(profile.role))) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
