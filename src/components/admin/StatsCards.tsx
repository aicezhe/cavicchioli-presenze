import type { AdminStats } from '../../hooks/useAdminStats'

type StatItem = { label: string; value: string }

function buildItems(stats: AdminStats): StatItem[] {
  return [
    { label: 'Classi', value: String(stats.classCount) },
    { label: 'Bambini', value: String(stats.childrenCount) },
    {
      label: 'Presenze oggi',
      value: stats.presentPct === null ? '—' : `${stats.presentPct}%`,
    },
    { label: 'Operatori attivi', value: String(stats.operatorCount) },
  ]
}

/** Riga di statistiche: in fila su desktop, in colonna su mobile. */
export default function StatsCards({ stats }: { stats: AdminStats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {buildItems(stats).map((item) => (
        <div
          key={item.label}
          className="bg-white rounded-xl border border-gold/40 px-5 py-4"
        >
          <p className="font-serif text-3xl font-semibold text-ink">{item.value}</p>
          <p className="mt-1 text-sm text-warmgray">{item.label}</p>
        </div>
      ))}
    </div>
  )
}
