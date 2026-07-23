import { useState } from 'react'
import { useAppello, todayIso } from '../../hooks/useAppello'
import ChildAttendanceRow from './ChildAttendanceRow'
import { DEFAULT_SCHOOL_COLOR, SESSION_LABELS } from '../../types'
import type { Session } from '../../types'

type AppelloListProps = {
  schoolId: string
  classId: string
  operatoreUid: string
  session: Session
  /** Colore della scuola. Default: dusty-blue */
  color?: string
}

// Sposta una data ISO di N giorni (aritmetica locale, senza scarti di fuso)
function shiftIso(iso: string, delta: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d + delta)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`
}

// Etichetta estesa in italiano, es. "giovedì 23 luglio 2026"
function dateLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Appello del giorno: data navigabile (frecce prec./succ.), progresso, elenco bambini. */
export default function AppelloList({ schoolId, classId, operatoreUid, session, color = DEFAULT_SCHOOL_COLOR }: AppelloListProps) {
  const [date, setDate] = useState(todayIso())
  const { children, present, setPresent, presentCount } = useAppello(schoolId, classId, session, date)
  const isToday = date === todayIso()

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-0.5">
          {/* Settimana precedente (−7 giorni) */}
          <button
            onClick={() => setDate((d) => shiftIso(d, -7))}
            aria-label="Settimana precedente"
            className="w-8 h-8 grid place-items-center rounded-lg text-warmgray hover:bg-cream hover:text-ink transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="11 17 6 12 11 7" /><polyline points="18 17 13 12 18 7" /></svg>
          </button>
          {/* Giorno precedente */}
          <button
            onClick={() => setDate((d) => shiftIso(d, -1))}
            aria-label="Giorno precedente"
            className="w-8 h-8 grid place-items-center rounded-lg text-warmgray hover:bg-cream hover:text-ink transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>

          <div className="text-center min-w-[11rem]">
            <p className="text-xs text-warmgray">
              Appello di <span className="lowercase">{SESSION_LABELS[session]}</span>
            </p>
            <p className="font-serif text-lg font-semibold capitalize leading-tight">{dateLabel(date)}</p>
            {!isToday && (
              <button onClick={() => setDate(todayIso())} className="text-xs hover:underline" style={{ color }}>
                Torna a oggi
              </button>
            )}
          </div>

          {/* Giorno successivo */}
          <button
            onClick={() => setDate((d) => shiftIso(d, 1))}
            aria-label="Giorno successivo"
            className="w-8 h-8 grid place-items-center rounded-lg text-warmgray hover:bg-cream hover:text-ink transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
          {/* Settimana successiva (+7 giorni) */}
          <button
            onClick={() => setDate((d) => shiftIso(d, 7))}
            aria-label="Settimana successiva"
            className="w-8 h-8 grid place-items-center rounded-lg text-warmgray hover:bg-cream hover:text-ink transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" /></svg>
          </button>
        </div>

        {/* Progresso centrato: quanti segnati presenti */}
        <p className="text-sm font-medium text-center" style={{ color }}>
          {presentCount} / {children.length} presenti
        </p>
      </div>

      {children.length === 0 ? (
        <p className="text-sm text-warmgray">Nessun bambino in questa classe.</p>
      ) : (
        <div className="space-y-2">
          {children.map((child) => (
            <ChildAttendanceRow
              key={child.id}
              child={child}
              present={present[child.id] ?? false}
              onToggle={(value) => setPresent(child.id, value, operatoreUid)}
              color={color}
            />
          ))}
        </div>
      )}
    </div>
  )
}
