import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Crest from '../components/Crest'
import type { Role } from '../types'
import { ROLE_LABELS } from '../types'

const ROLES: Role[] = ['admin', 'operatore', 'genitore']

// Link che framer-motion sa animare come un proprio componente
const MotionLink = motion.create(Link)

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Intestazione: bordeaux, con linea dorata in basso */}
      <header className="bg-crimson text-cream border-b-2 border-gold">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-3">
          <Crest size={40} variant="compact" />
          <span className="font-serif text-xl font-semibold">Cavicchioli</span>

          {/* Parte destra: su mobile resta solo il menu hamburger */}
          <div className="ml-auto flex items-center gap-4">
            <button
              aria-label="Cerca"
              className="hidden sm:block opacity-80 hover:opacity-100 transition-opacity"
            >
              {/* Icona di ricerca (segnaposto) */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.5" y2="16.5" />
              </svg>
            </button>
            <span className="hidden sm:block text-xs text-cream/70">
              controllo online di presenze
            </span>
            <button
              aria-label="Menu"
              className="opacity-80 hover:opacity-100 transition-opacity"
            >
              {/* Menu hamburger (per ora senza funzionalità) */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Scelta del ruolo */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-ink text-center">
          Scegli il tuo ruolo
        </h1>
        <div className="mt-4 h-px w-24 bg-crimson" aria-hidden="true" />

        <div className="mt-10 sm:mt-14 flex flex-col sm:flex-row gap-5 sm:gap-6 w-full max-w-3xl items-stretch justify-center">
          {ROLES.map((role) => (
            <MotionLink
              key={role}
              to={`/login/${role}`}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              className="group flex flex-1 items-center justify-between gap-4
                         rounded-[32px] border-2 border-gold bg-white
                         px-7 py-5 text-left
                         hover:border-crimson hover:bg-crimson hover:shadow-lg
                         transition-[border-color,background-color,box-shadow] duration-200"
            >
              <span className="font-medium text-lg text-ink transition-colors group-hover:text-cream">
                {ROLE_LABELS[role]}
              </span>
              {/* Круглая стрелка справа; при наведении инвертируется в кремовую */}
              <span
                className="grid shrink-0 place-items-center w-9 h-9 rounded-full
                           border-2 border-gold text-crimson transition-colors
                           group-hover:border-cream group-hover:text-cream"
                aria-hidden="true"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="12" x2="19" y2="12" />
                  <polyline points="13 6 19 12 13 18" />
                </svg>
              </span>
            </MotionLink>
          ))}
        </div>
      </main>
    </div>
  )
}
