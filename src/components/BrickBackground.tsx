import { useMemo } from 'react'

const W = 1440
const H = 900
const BRICK_W = 120
const BRICK_H = 46

type Seg = { x1: number; y1: number; x2: number; y2: number }

/**
 * Muro di mattoni parziale in un angolo: linee di malta diritte, orizzontali + verticali sfalsate.
 * I verticali che, per lo sfalsamento a mezzo mattone, sporgerebbero oltre il muretto vengono
 * scartati (niente "stanghette" isolate agli angoli).
 */
function cornerBricks(ox: number, oy: number, dx: number, dy: number, rows: number, cols: number): Seg[] {
  const segs: Seg[] = []
  for (let r = 0; r <= rows; r++) {
    const y = oy + dy * r * BRICK_H
    segs.push({ x1: ox, y1: y, x2: ox + dx * cols * BRICK_W, y2: y })
  }
  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (BRICK_W / 2)
    for (let c = 0; c <= cols; c++) {
      const localX = c * BRICK_W + offset
      if (localX > cols * BRICK_W) continue // niente sporgenze oltre il bordo del muretto
      const x = ox + dx * localX
      segs.push({
        x1: x,
        y1: oy + dy * r * BRICK_H,
        x2: x,
        y2: oy + dy * (r + 1) * BRICK_H,
      })
    }
  }
  return segs
}

// I 4 angoli condividono lo stesso numero e ordine di segmenti (sono speculari):
// il k-esimo segmento di ogni angolo corrisponde, così possiamo animarli in sincrono.
const CORNERS: Seg[][] = [
  cornerBricks(0, 0, 1, 1, 3, 4), // alto-sinistra
  cornerBricks(W, 0, -1, 1, 3, 4), // alto-destra
  cornerBricks(0, H, 1, -1, 3, 4), // basso-sinistra
  cornerBricks(W, H, -1, -1, 3, 4), // basso-destra
]

/**
 * Sfondo animato: brevi muri di mattoni disegnati agli angoli (non su tutto lo schermo).
 * Le linee si "disegnano" al caricamento con un'animazione CSS su stroke-dashoffset.
 * I 4 angoli partono INSIEME: il ritardo dipende dalla posizione DENTRO l'angolo, non
 * dall'indice globale → l'animazione arriva simultaneamente dalle 4 direzioni.
 */
export default function BrickBackground() {
  const lines = useMemo(
    () => CORNERS.flatMap((corner, cornerIndex) => corner.map((s, local) => ({ s, cornerIndex, local }))),
    [],
  )

  return (
    <svg
      aria-hidden="true"
      className="hidden md:block absolute inset-0 w-full h-full pointer-events-none"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
    >
      {lines.map(({ s, cornerIndex, local }) => {
        const len = Math.hypot(s.x2 - s.x1, s.y2 - s.y1)
        return (
          <line
            key={`${cornerIndex}-${local}`}
            x1={s.x1}
            y1={s.y1}
            x2={s.x2}
            y2={s.y2}
            stroke="#F8F6F2"
            strokeWidth={1.2}
            strokeLinecap="round"
            style={{
              strokeDasharray: len,
              strokeDashoffset: len,
              opacity: 0,
              // Ritardo per posizione interna all'angolo (uguale nei 4 angoli) → sincrono
              animation: `brick-draw 1.1s cubic-bezier(0.22, 1, 0.36, 1) ${0.2 + local * 0.04}s forwards`,
            }}
          />
        )
      })}
    </svg>
  )
}
