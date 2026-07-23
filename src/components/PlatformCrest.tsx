// Emblema della piattaforma NOTA: scudo con dentro uno scudetto araldico
// inquartato (diviso in 4 da una croce) e la scritta "NOTA".
// Il colore delle linee/testo è parametrizzato: bianco (crema) su fondo scuro,
// scuro (ink) su fondo chiaro. Lo scudetto interno resta dusty-blue (accento).

type CrestVariant = 'full' | 'compact' | 'icon'

type PlatformCrestProps = {
  variant?: CrestVariant
  size?: number
  /** Colore di linee e testo. Default: ink (per fondi chiari) */
  color?: string
}

const DUSTYBLUE = '#6E859C'
const INK = '#1A1817'

export function PlatformCrest({ variant = 'full', size = 60, color = INK }: PlatformCrestProps) {
  const isFull = variant === 'full'
  // full include la scritta NOTA; le altre varianti mostrano solo lo scudo
  const viewBox = isFull ? '0 0 120 152' : '9 4 102 138'
  const ratio = isFull ? 120 / 152 : 102 / 138

  return (
    <svg
      width={size * ratio}
      height={size}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Emblema della piattaforma NOTA"
    >
      {/* Scudo esterno: doppio bordo */}
      <path
        d="M14 8 H106 V72 C106 106 84 126 60 138 C36 126 14 106 14 72 Z"
        fill="none"
        stroke={color}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M20 14 H100 V71 C100 100 81 118 60 129 C39 118 20 100 20 71 Z"
        fill="none"
        stroke={color}
        strokeWidth="1"
        opacity="0.6"
        strokeLinejoin="round"
      />

      {/* Scudetto araldico interno, inquartato */}
      <path
        d="M43 30 H77 V56 C77 72 69 80 60 86 C51 80 43 72 43 56 Z"
        fill={DUSTYBLUE}
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <line x1="60" y1="30" x2="60" y2="86" stroke={color} strokeWidth="2" />
      <line x1="43" y1="57" x2="77" y2="57" stroke={color} strokeWidth="2" />

      {isFull && (
        <text
          x="60"
          y="110"
          textAnchor="middle"
          fill={color}
          fontFamily="Lora, Georgia, serif"
          fontWeight="600"
          fontSize="14"
          letterSpacing="1.5"
        >
          NOTA
        </text>
      )}
    </svg>
  )
}
