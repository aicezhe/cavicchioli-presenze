type CrestProps = {
  /** Altezza dell'emblema in pixel */
  size?: number
  /** full — scudo + stella + nastro con il motto; compact — solo scudo (per l'intestazione) */
  variant?: 'full' | 'compact'
  /** Colore dello scudo (ogni scuola ha il suo). Default: dusty-blue della piattaforma */
  color?: string
  /** Iniziali mostrate sullo scudo. Default: GC (Giacomo Cavicchioli) */
  initials?: string
  /** Testo del nastro nella variante full (anno/motto). Default: MDCCCLXXXII */
  motto?: string
  className?: string
}

import { DEFAULT_SCHOOL_COLOR } from '../types'

// Dettagli chiari, leggibili su qualunque colore di scudo
const CREAM = '#F8F6F2'

/**
 * Emblema di scuola, geometria unica riusabile da tutte le scuole:
 * scudo colorato con bordo crema, libro aperto, iniziali, stella e nastro col motto.
 * Colore e iniziali sono parametrizzati (color, initials); il resto resta invariato.
 */
export default function Crest({
  size = 96,
  variant = 'full',
  color = DEFAULT_SCHOOL_COLOR,
  initials = 'GC',
  motto = 'MDCCCLXXXII',
  className,
}: CrestProps) {
  const isFull = variant === 'full'
  // in compact ritagliamo il solo scudo — senza stella né nastro
  const viewBox = isFull ? '0 0 140 176' : '20 26 100 112'
  const ratio = isFull ? 140 / 176 : 100 / 112

  return (
    <svg
      width={size * ratio}
      height={size}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Emblema scuola ${initials}`}
      className={className}
    >
      {isFull && (
        /* Stella a cinque punte sopra lo scudo */
        <path
          d="M70 2 L74.7 12.6 L86 13.9 L77.6 21.4 L80 32.5 L70 26.8 L60 32.5 L62.4 21.4 L54 13.9 L65.3 12.6 Z"
          fill={CREAM}
        />
      )}

      {/* Scudo: campo colorato con doppio bordo crema */}
      <path
        d="M25 31 H115 V85 C115 112 96 126 70 135 C44 126 25 112 25 85 Z"
        fill={color}
        stroke={CREAM}
        strokeWidth="3.5"
      />
      <path
        d="M31 37 H109 V84 C109 107 93 119 70 127.5 C47 119 31 107 31 84 Z"
        fill="none"
        stroke={CREAM}
        strokeWidth="1.2"
        opacity="0.8"
      />

      {/* Libro aperto: pagine crema aperte sullo scudo, dorso e righe nel colore */}
      <g>
        {/* Copertina (stesso colore dello scudo: fa da base) */}
        <path
          d="M42 62 C51 57 62 57 70 61 C78 57 89 57 98 62 L98 88 C89 83 78 83 70 87 C62 83 51 83 42 88 Z"
          fill={color}
        />
        {/* Pagine */}
        <path
          d="M45.5 64.5 C53 61 63 61 70 64.5 L70 83 C63 79.5 53 79.5 45.5 83 Z"
          fill={CREAM}
        />
        <path
          d="M94.5 64.5 C87 61 77 61 70 64.5 L70 83 C77 79.5 87 79.5 94.5 83 Z"
          fill={CREAM}
        />
        {/* Dorso */}
        <line x1="70" y1="63" x2="70" y2="85" stroke={color} strokeWidth="1.6" />
        {/* Righe di testo */}
        <g stroke={color} strokeWidth="1.1" opacity="0.55">
          <line x1="50" y1="68" x2="65" y2="66.5" />
          <line x1="50" y1="72" x2="65" y2="70.5" />
          <line x1="50" y1="76" x2="65" y2="74.5" />
          <line x1="75" y1="66.5" x2="90" y2="68" />
          <line x1="75" y1="70.5" x2="90" y2="72" />
          <line x1="75" y1="74.5" x2="90" y2="76" />
        </g>
      </g>

      {/* Iniziali della scuola */}
      <text
        x="70"
        y="112"
        textAnchor="middle"
        fill={CREAM}
        fontFamily="Lora, Georgia, serif"
        fontWeight="700"
        fontSize="22"
        letterSpacing="1"
      >
        {initials}
      </text>

      {isFull && motto && (
        <g>
          {/* Nastro col motto/anno */}
          <path d="M18 148 L34 141 L34 159 L18 152 Z" fill={color} stroke={CREAM} strokeWidth="1.5" />
          <path d="M122 148 L106 141 L106 159 L122 152 Z" fill={color} stroke={CREAM} strokeWidth="1.5" />
          <rect x="30" y="140" width="80" height="20" rx="2" fill={color} stroke={CREAM} strokeWidth="1.5" />
          <text
            x="70"
            y="154"
            textAnchor="middle"
            fill={CREAM}
            fontFamily="Lora, Georgia, serif"
            fontWeight="600"
            fontSize="9.5"
            letterSpacing="1.2"
          >
            {motto}
          </text>
        </g>
      )}
    </svg>
  )
}
