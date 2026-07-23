import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSchools } from '../hooks/useSchools'
import Crest from '../components/Crest'
import { schoolColor, schoolInitials } from '../types'

/**
 * Directory delle scuole (livello piattaforma): l'utente sceglie la propria scuola.
 * Ogni card usa l'emblema e il colore della scuola (Crest scuola, NON PlatformCrest).
 */
export default function SchoolsPage() {
  const { schools, loading } = useSchools()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Intestazione minimale di piattaforma: wordmark NOTA (senza emblema) */}
      <header className="border-b border-black/10">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center">
          <Link to="/" className="font-serif text-xl font-semibold tracking-wide text-ink">
            NOTA
          </Link>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-10">
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-ink text-center">
          Seleziona la tua scuola
        </h1>
        <div className="mt-3 h-px w-24 bg-dustyblue mx-auto" aria-hidden="true" />

        {loading ? (
          <p className="mt-10 text-center text-sm text-warmgray animate-pulse">Caricamento…</p>
        ) : schools.length === 0 ? (
          <p className="mt-10 text-center text-sm text-warmgray">Nessuna scuola disponibile.</p>
        ) : (
          <div className="mt-10 flex flex-col gap-4 max-w-2xl mx-auto">
            {schools.map((school) => {
              const color = schoolColor(school)
              return (
                <motion.button
                  key={school.id}
                  onClick={() => navigate(`/schools/${school.id}/role`)}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                  style={{ borderColor: color }}
                  className="flex items-center gap-4 rounded-2xl border-2 bg-white
                             px-5 py-4 text-left shadow-sm hover:shadow-lg transition-shadow"
                >
                  <Crest size={52} variant="compact" color={color} initials={schoolInitials(school)} />
                  <span className="font-serif text-lg font-semibold text-ink">{school.name}</span>
                </motion.button>
              )
            })}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link to="/" className="text-sm text-warmgray hover:text-dustyblue transition-colors">
            &larr; Torna alla home
          </Link>
        </div>
      </main>
    </div>
  )
}
