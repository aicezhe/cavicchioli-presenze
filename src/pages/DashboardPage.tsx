import { Navigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import Crest from '../components/Crest'
import { ROLE_LABELS } from '../types'

// Dashboard generico + dispatcher: smista ogni ruolo verso la propria pagina.
// (operatore/genitore restano qui finché le loro pagine non esistono)
export default function DashboardPage() {
  const { user, profile } = useAuth()

  // Ruoli con pagina dedicata
  if (profile?.role === 'admin') return <Navigate to="/admin" replace />
  if (profile?.role === 'operatore') return <Navigate to="/operatore" replace />

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-ink text-cream">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-3">
          <Crest size={40} variant="compact" />
          <div className="min-w-0">
            <p className="font-serif font-semibold leading-tight truncate">Cavicchioli Presenze</p>
            <p className="text-xs text-cream/60 truncate">
              Scuola Secondaria &laquo;Giacomo Cavicchioli&raquo;
            </p>
          </div>
          <button
            onClick={() => signOut(auth)}
            className="ml-auto shrink-0 rounded-lg border border-gold/60 px-3 py-1.5 text-sm
                       hover:bg-gold/10 transition-colors"
          >
            Esci
          </button>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-8">
        {profile ? (
          <>
            <h1 className="font-serif text-2xl font-semibold">
              Benvenuto, {profile.name}
            </h1>
            <p className="mt-2 text-warmgray">
              <span
                className="inline-block rounded-full bg-crimson/10 text-crimson
                           px-3 py-0.5 text-sm font-medium mr-2"
              >
                {ROLE_LABELS[profile.role]}
              </span>
              {user?.email}
            </p>
          </>
        ) : (
          <div className="rounded-xl border border-gold/50 bg-gold/10 px-4 py-3 max-w-xl">
            <p className="font-medium">Profilo non configurato</p>
            <p className="mt-1 text-sm text-warmgray">
              Il tuo account non ha ancora un ruolo assegnato. Contatta
              l&apos;amministrazione della scuola.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
