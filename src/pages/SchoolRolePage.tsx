import { Link, Navigate, useParams } from 'react-router-dom'
import { useSchoolById } from '../hooks/useSchools'
import NavCard from '../components/NavCard'
import Crest from '../components/Crest'
import { schoolColor, schoolInitials } from '../types'

/**
 * Scelta del ruolo dentro una scuola (Operatore / Genitore).
 * Tema e emblema nel colore della scuola; l'amministratore NON entra da qui
 * (accede dal livello piattaforma, /admin/login).
 */
export default function SchoolRolePage() {
  const { schoolId } = useParams<{ schoolId: string }>()
  const { school, loading } = useSchoolById(schoolId)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-warmgray text-sm animate-pulse">Caricamento…</span>
      </div>
    )
  }
  // Scuola inesistente → torna alla directory
  if (!school) return <Navigate to="/schools" replace />

  const color = schoolColor(school)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Intestazione nel colore della scuola, col suo emblema */}
      <header className="text-cream border-b border-black/10" style={{ backgroundColor: color }}>
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-center gap-3">
          <Crest size={40} variant="compact" color={color} initials={schoolInitials(school)} />
          <span className="font-serif text-xl font-semibold">{school.name}</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-ink text-center">
          Scegli il tuo ruolo
        </h1>
        <div className="mt-4 h-px w-24 mx-auto" style={{ backgroundColor: color }} aria-hidden="true" />

        <div className="mt-10 sm:mt-14 flex flex-col sm:flex-row gap-5 sm:gap-6 w-full max-w-2xl items-stretch justify-center">
          <NavCard to={`/schools/${school.id}/login/operatore`} label="Operatore" color={color} />
          <NavCard to={`/schools/${school.id}/login/genitore`} label="Genitore" color={color} />
        </div>

        <div className="mt-10 text-center">
          <Link to="/schools" className="text-sm text-warmgray hover:text-dustyblue transition-colors">
            &larr; Cambia scuola
          </Link>
        </div>
      </main>
    </div>
  )
}
