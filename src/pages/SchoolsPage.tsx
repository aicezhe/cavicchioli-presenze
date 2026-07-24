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
          <div className="mt-10 flex flex-col gap-2.5 max-w-md mx-auto">
            {schools.map((school, i) => {
              const color = schoolColor(school)
              const isHover = hovered === school.id
              return (
                <motion.button
                  key={school.id}
                  // Affiora dopo che il titolo è salito, in cascata
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.05, duration: 0.4, ease: 'easeOut' }}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.99 }}
                  onMouseEnter={() => setHovered(school.id)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(school.id)}
                  onBlur={() => setHovered(null)}
                  onClick={() => navigate(`/schools/${school.id}/role`)}
                  style={{
                    // Riga pulita: bordo sottile neutro, che prende il colore della scuola all'hover;
                    // velo di colore appena percettibile solo al passaggio.
                    borderColor: isHover ? color : 'rgba(0,0,0,0.10)',
                    backgroundColor: isHover ? `${color}12` : '#fff',
                  }}
                  className="group flex items-center gap-3.5 rounded-xl border px-4 py-3 text-left
                             transition-colors duration-200"
                >
                  <Crest size={40} variant="compact" color={color} initials={schoolInitials(school)} />
                  <span className="font-serif text-lg font-semibold text-ink leading-snug">{school.name}</span>
                  {/* Chevron: grigio a riposo, colore scuola all'hover, con lieve scorrimento */}
                  <svg
                    width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke={isHover ? color : '#8A8580'} strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                    className="ml-auto shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
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
