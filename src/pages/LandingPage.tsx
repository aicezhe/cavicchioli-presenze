import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AppHeader from '../components/AppHeader'
import type { Role } from '../types'
import { ROLE_LABELS } from '../types'

// Genitore al centro: sono gli utenti principali della piattaforma
const ROLES: Role[] = ['admin', 'genitore', 'operatore']

// Link che framer-motion sa animare come un proprio componente
const MotionLink = motion.create(Link)

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative isolate">
      {/* Sfondo: libreria attenuata da un velo crema translucido, così il testo resta leggibile.
          L'immagine va salvata in public/library-bg.jpg (vedi nota). */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: 'url(/library-bg.jpg)' }}
      />
      <div aria-hidden="true" className="fixed inset-0 -z-10 bg-cream/85" />

      {/* Intestazione landing: scudo + nome centrati, senza strumenti */}
      <AppHeader centered />

      {/* Scelta del ruolo */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-ink text-center">
          Scegli il tuo ruolo
        </h1>
        <div className="mt-4 h-px w-24 bg-dustyblue" aria-hidden="true" />

        <div className="mt-10 sm:mt-14 flex flex-col sm:flex-row gap-5 sm:gap-6 w-full max-w-3xl items-stretch justify-center">
          {ROLES.map((role) => (
            <MotionLink
              key={role}
              to={`/login/${role}`}
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 320, damping: 20 }}
              className="group flex flex-1 items-center justify-between gap-4
                         rounded-[32px] border-2 border-dustyblue bg-white
                         px-7 py-5 text-left
                         hover:border-dustyblue hover:bg-dustyblue hover:shadow-lg
                         transition-[border-color,background-color,box-shadow] duration-200"
            >
              <span className="font-medium text-lg text-ink transition-colors group-hover:text-cream">
                {ROLE_LABELS[role]}
              </span>
              {/* Cerchio con freccia: freccia nera, riempimento oro translucido; all'hover crema */}
              <span
                className="grid shrink-0 place-items-center w-9 h-9 rounded-full
                           border-2 border-dustyblue bg-dustyblue/20 text-ink transition-colors
                           group-hover:border-cream group-hover:bg-cream/20 group-hover:text-cream"
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
