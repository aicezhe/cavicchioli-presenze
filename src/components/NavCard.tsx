import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { DEFAULT_SCHOOL_COLOR } from '../types'

type NavCardProps = {
  to: string
  label: string
  /** Colore del bordo e del riempimento all'hover. Default: dusty-blue piattaforma */
  color?: string
}

const MotionLink = motion.create(Link)

const CREAM = '#F8F6F2'
const INK = '#1A1817'

/**
 * Capsula-link riusabile (landing, scelta scuola, scelta ruolo).
 * Il colore è parametrizzato: all'hover la card si riempie del colore della scuola.
 * Usa lo stato locale (non solo hover CSS) perché il colore è dinamico e inline.
 */
export default function NavCard({ to, label, color = DEFAULT_SCHOOL_COLOR }: NavCardProps) {
  const [hover, setHover] = useState(false)

  return (
    <MotionLink
      to={to}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      whileHover={{ scale: 1.07 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 320, damping: 20 }}
      style={{
        backgroundColor: hover ? color : '#fff',
        borderColor: color,
        color: hover ? CREAM : INK,
      }}
      className="group flex flex-1 items-center justify-between gap-4 rounded-[32px]
                 border-2 px-7 py-5 text-left shadow-sm hover:shadow-lg transition-shadow"
    >
      <span className="font-medium text-lg">{label}</span>
      {/* Cerchio con freccia; all'hover diventa crema */}
      <span
        aria-hidden="true"
        className="grid shrink-0 place-items-center w-9 h-9 rounded-full border-2"
        style={{
          borderColor: hover ? CREAM : color,
          color: hover ? CREAM : INK,
          backgroundColor: hover ? 'rgba(248,246,242,0.2)' : `${color}33`,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="12" x2="19" y2="12" />
          <polyline points="13 6 19 12 13 18" />
        </svg>
      </span>
    </MotionLink>
  )
}
