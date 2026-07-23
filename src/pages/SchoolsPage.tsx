import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSchools } from '../hooks/useSchools'
import Crest from '../components/Crest'
import { schoolColor, schoolInitials } from '../types'

/**
 * Directory delle scuole (livello piattaforma): l'utente sceglie la propria scuola.
 * All'apertura: prima appare il titolo con la linea, poi sale e l'elenco affiora.
 * Ogni card usa l'emblema e il colore della scuola (Crest scuola, NON PlatformCrest).
 */
export default function SchoolsPage() {
  const { schools, loading } = useSchools()
  const navigate = useNavigate()
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Intestazione: NOTA + emblema, centrati */}
      <header className="border-b border-black/10">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-serif text-xl font-semibold tracking-wide text-ink">NOTA</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-10">
        {/* Titolo che sale in posizione + linea che si apre */}
        <motion.h1
          initial={{ opacity: 0, y: 44 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="font-serif text-2xl sm:text-3xl font-semibold text-ink text-center"
        >
          Seleziona la tua scuola
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.35, duration: 0.45, ease: 'easeOut' }}
          className="mt-3 h-px w-24 bg-dustyblue mx-auto origin-center"
          aria-hidden="true"
        />

        {loading ? (
          <p className="mt-10 text-center text-sm text-warmgray animate-pulse">Caricamento…</p>
        ) : schools.length === 0 ? (
          <p className="mt-10 text-center text-sm text-warmgray">Nessuna scuola disponibile.</p>
        ) : (
          <div className="mt-10 flex flex-col gap-4 max-w-lg mx-auto">
            {schools.map((school, i) => {
              const color = schoolColor(school)
              const isHover = hovered === school.id
              return (
                <motion.button
                  key={school.id}
                  // Affiora dopo che il titolo è salito, in cascata
                  initial={{ opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + i * 0.07, duration: 0.45, ease: 'easeOut' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onMouseEnter={() => setHovered(school.id)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(school.id)}
                  onBlur={() => setHovered(null)}
                  onClick={() => navigate(`/schools/${school.id}/role`)}
                  style={{
                    borderColor: color,
                    // Riempimento semi-trasparente nel colore della scuola solo all'hover
                    backgroundColor: isHover ? `${color}2e` : '#fff',
                  }}
                  className="flex items-center justify-center gap-3 rounded-[28px] border-2 px-5 py-4 text-center
                             shadow-sm hover:shadow-xl transition-[background-color,box-shadow] duration-200"
                >
                  <Crest size={52} variant="compact" color={color} initials={schoolInitials(school)} />
                  <span className="font-serif text-xl sm:text-2xl font-semibold text-ink">{school.name}</span>
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
