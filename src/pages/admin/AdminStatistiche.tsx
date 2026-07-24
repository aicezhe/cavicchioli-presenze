import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useMySchools } from '../../hooks/useSchools'
import { useAttendanceStats } from '../../hooks/useAttendanceStats'
import AppHeader from '../../components/AppHeader'
import { PlatformCrest } from '../../components/PlatformCrest'
import Crest from '../../components/Crest'
import BackToDashboard from '../../components/admin/BackToDashboard'
import BarChart from '../../components/admin/BarChart'
import type { Bar } from '../../components/admin/BarChart'
import { schoolColor, schoolInitials } from '../../types'

type Grouping = 'giorni' | 'settimane' | 'mesi'

const MONTHS_IT = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic']

// Lunedì della settimana di una data ISO (chiave stabile per il raggruppamento settimanale)
function mondayOf(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  const offset = (d.getDay() + 6) % 7 // 0 = lunedì
  d.setDate(d.getDate() - offset)
  return d.toISOString().slice(0, 10)
}

const dm = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}` // DD/MM

/** Raggruppa le presenze per giorno/settimana/mese e prende gli ultimi N periodi con dati. */
function buildBars(byDate: Record<string, number>, grouping: Grouping): Bar[] {
  const grouped: Record<string, number> = {}
  for (const [iso, count] of Object.entries(byDate)) {
    const key =
      grouping === 'giorni' ? iso : grouping === 'settimane' ? mondayOf(iso) : iso.slice(0, 7)
    grouped[key] = (grouped[key] ?? 0) + count
  }

  const limit = grouping === 'giorni' ? 14 : 12
  const keys = Object.keys(grouped).sort().slice(-limit)

  return keys.map((key) => {
    let label: string
    if (grouping === 'mesi') {
      const [y, m] = key.split('-')
      label = `${MONTHS_IT[Number(m) - 1]} ${y.slice(2)}`
    } else {
      label = dm(key)
    }
    return { label, value: grouped[key] }
  })
}

/**
 * Statistiche di posizione presenze (rotta /admin/statistiche, dal menu hamburger admin).
 * Grafico a barre delle presenze per giorno, settimana o mese, sulla scuola attiva.
 */
export default function AdminStatistiche() {
  const { user } = useAuth()
  const { schools, loading: schoolsLoading } = useMySchools(user?.uid)
  const [params, setParams] = useSearchParams()

  const paramId = params.get('school')
  const school = schools.find((s) => s.id === paramId) ?? schools[0] ?? null
  const color = school ? schoolColor(school) : '#6E859C'

  const [grouping, setGrouping] = useState<Grouping>('giorni')
  const { byDate, childrenCount, loading } = useAttendanceStats(school?.id)

  // Aggregazioni memoizzate: si ricalcolano SOLO quando cambiano i dati (byDate) o il
  // raggruppamento. Cambiare Giorni/Settimane/Mesi NON rilegge dal database, riaggrega e basta.
  const bars = useMemo(() => buildBars(byDate, grouping), [byDate, grouping])
  const totalPresences = useMemo(() => Object.values(byDate).reduce((a, b) => a + b, 0), [byDate])
  const activeDays = useMemo(() => Object.keys(byDate).length, [byDate])

  if (schoolsLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppHeader emblem={<PlatformCrest variant="icon" size={30} />} title="NOTA" right={<BackToDashboard />} />
        <p className="flex-1 grid place-items-center text-sm text-warmgray animate-pulse">Caricamento…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader emblem={<PlatformCrest variant="icon" size={30} />} title="NOTA" right={<BackToDashboard />} />

      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-8 space-y-8">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Statistiche presenze</h1>
          <p className="mt-1 text-sm text-warmgray">Andamento delle presenze per giorno, settimana o mese.</p>
        </div>

        {schools.length > 1 && (
          <label className="block">
            <span className="text-sm font-medium">Scuola</span>
            <select
              value={school?.id ?? ''}
              onChange={(e) => setParams({ school: e.target.value })}
              className="mt-1 w-full rounded-lg border border-warmgray/40 bg-white px-3 py-2.5
                         focus:outline-none focus:ring-2 focus:ring-dustyblue/60 focus:border-dustyblue"
            >
              {schools.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
        )}

        {school && (
          <div className="flex items-center gap-3">
            <Crest size={36} variant="compact" color={color} initials={schoolInitials(school)} />
            <span className="font-serif text-lg font-semibold">{school.name}</span>
          </div>
        )}

        {/* Riepilogo */}
        <div className="grid grid-cols-3 gap-3">
          <Tile label="Presenze totali" value={totalPresences} />
          <Tile label="Giorni con presenze" value={activeDays} />
          <Tile label="Bambini" value={childrenCount} />
        </div>

        {/* Toggle raggruppamento */}
        <div className="inline-flex rounded-lg border border-warmgray/40 p-0.5 text-sm">
          {(['giorni', 'settimane', 'mesi'] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGrouping(g)}
              className={
                'rounded-md px-3 py-1.5 font-medium capitalize transition-colors ' +
                (grouping === g ? 'text-cream' : 'text-warmgray hover:text-ink')
              }
              style={grouping === g ? { backgroundColor: color } : undefined}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Grafico */}
        <div className="bg-white rounded-xl border border-dustyblue/40 p-5">
          {loading ? (
            <p className="text-sm text-warmgray animate-pulse">Caricamento…</p>
          ) : bars.length === 0 ? (
            <p className="text-sm text-warmgray">
              Nessuna presenza registrata. Appena gli operatori faranno l'appello, i dati compariranno qui.
            </p>
          ) : (
            <BarChart data={bars} color={color} unit="presenze" />
          )}
        </div>
      </main>
    </div>
  )
}

function Tile({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-dustyblue/40 px-4 py-3 text-center">
      <p className="font-serif text-2xl font-semibold">{value}</p>
      <p className="text-xs text-warmgray mt-0.5">{label}</p>
    </div>
  )
}
