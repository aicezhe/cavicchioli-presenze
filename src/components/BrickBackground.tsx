import { useMemo } from 'react'

const W = 1440
const H = 900
const BRICK_W = 120
const BRICK_H = 46

type Seg = { x1: number; y1: number; x2: number; y2: number }

/** Muro di mattoni parziale in un angolo: linee di malta perfettamente diritte, orizzontali + verticali sfalsate */
function cornerBricks(ox: number, oy: number, dx: number, dy: number, rows: number, cols: number): Seg[] {
  const segs: Seg[] = []
  for (let r = 0; r <= rows; r++) {
    const y = oy + dy * r * BRICK_H
    segs.push({ x1: ox, y1: y, x2: ox + dx * cols * BRICK_W, y2: y })
  }
  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (BRICK_W / 2)
    for (let c = 0; c <= cols; c++) {
      const x = ox + dx * (c * BRICK_W + offset)
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

/**
 * Sfondo animato: brevi muri di mattoni disegnati agli angoli (non su tutto lo schermo).
 * Le linee si "disegnano" al caricamento con un'animazione CSS su stroke-dashoffset, scaglionata.
 */
export default function BrickBackground() {
  const segs = useMemo<Seg[]>(
    () => [
      ...cornerBricks(0, 0, 1, 1, 3, 4), // alto-sinistra
      ...cornerBricks(W, 0, -1, 1, 3, 4), // alto-destra
      ...cornerBricks(0, H, 1, -1, 3, 4), // basso-sinistra
      ...cornerBricks(W, H, -1, -1, 3, 4), // basso-destra
    ],
    [],
  )

  return (
    <svg
      aria-hidden="true"
      className="hidden md:block absolute inset-0 w-full h-full pointer-events-none"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
    >
      {segs.map((s, i) => {
        const len = Math.hypot(s.x2 - s.x1, s.y2 - s.y1)
        return (
          <line
            key={i}
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
              // Più morbida: tracciato più lento e con easing dolce
              animation: `brick-draw 1.1s cubic-bezier(0.22, 1, 0.36, 1) ${0.2 + i * 0.03}s forwards`,
            }}
          />
        )
      })}
    </svg>
  )
}
