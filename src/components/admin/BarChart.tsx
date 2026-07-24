import { motion } from 'framer-motion'

export type Bar = { label: string; value: number }

type BarChartProps = {
  data: Bar[]
  color: string
  /** Etichetta unità mostrata sotto il grafico (es. "presenze") */
  unit?: string
}

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Grafico a barre leggero (solo CSS + framer-motion, nessuna libreria di charting):
 * facile da spiegare e bundle autonomo. Sfondo con griglia, barre con gradiente e
 * angoli arrotondati che "crescono" dal basso all'apertura.
 *
 * Nota: le barre usano un'altezza in % rispetto al contenitore (che ha altezza definita,
 * `h-56`), con un 15% di margine sopra il massimo per lasciare spazio all'etichetta del valore.
 */
export default function BarChart({ data, color, unit }: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value))
  const scaleMax = max * 1.15

  return (
    <div>
      <div className="rounded-xl bg-cream/50 p-3">
        <div className="relative flex items-end gap-2 h-56">
          {/* Griglia orizzontale di sfondo */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border-t border-black/[0.06]" />
            ))}
          </div>

          {data.map((d, i) => {
            const pct = (d.value / scaleMax) * 100
            return (
              <div key={i} className="relative z-10 flex-1 min-w-0 flex flex-col items-center justify-end h-full">
                <span className="text-xs font-semibold mb-1" style={{ color }}>
                  {d.value > 0 ? d.value : ''}
                </span>
                <div className="w-full flex justify-center" style={{ height: `${pct}%` }}>
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.55, delay: i * 0.05, ease: EASE }}
                    title={`${d.label}: ${d.value}`}
                    className="w-full max-w-[2.75rem] rounded-t-lg shadow-sm hover:brightness-110 transition-[filter]"
                    style={{
                      transformOrigin: 'bottom',
                      height: '100%',
                      minHeight: d.value > 0 ? 4 : 0,
                      background: `linear-gradient(180deg, ${color}, ${color}bb)`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Etichette dei periodi sotto le barre */}
        <div className="flex gap-2 mt-2 pt-1 border-t border-black/10">
          {data.map((d, i) => (
            <span key={i} className="flex-1 min-w-0 text-center text-[11px] text-warmgray truncate" title={d.label}>
              {d.label}
            </span>
          ))}
        </div>
      </div>

      {unit && <p className="mt-2 text-xs text-warmgray">Valori: {unit} (bambini presenti).</p>}
    </div>
  )
}
