export type Bar = { label: string; value: number }

type BarChartProps = {
  data: Bar[]
  color: string
  /** Etichetta unità mostrata sopra il valore massimo (es. "presenze") */
  unit?: string
}

/**
 * Grafico a barre leggero (solo CSS, nessuna libreria esterna): più facile da spiegare
 * e mantiene il bundle autonomo. Le barre sono in scala rispetto al valore massimo.
 */
export default function BarChart({ data, color, unit }: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value))

  return (
    <div>
      <div className="flex items-end gap-2 h-56 border-b border-black/10">
        {data.map((d, i) => (
          <div key={i} className="flex-1 min-w-0 flex flex-col items-center justify-end gap-1">
            <span className="text-xs font-medium text-ink">{d.value > 0 ? d.value : ''}</span>
            <div
              className="w-full rounded-t transition-[height] duration-300"
              style={{
                height: `${(d.value / max) * 100}%`,
                minHeight: d.value > 0 ? 3 : 0,
                backgroundColor: color,
              }}
              title={`${d.label}: ${d.value}`}
            />
          </div>
        ))}
      </div>
      {/* Etichette sotto le barre */}
      <div className="flex gap-2 mt-1">
        {data.map((d, i) => (
          <span key={i} className="flex-1 min-w-0 text-center text-[11px] text-warmgray truncate" title={d.label}>
            {d.label}
          </span>
        ))}
      </div>
      {unit && <p className="mt-2 text-xs text-warmgray">Valori: {unit} (bambini presenti).</p>}
    </div>
  )
}
