import { useAppello } from '../../hooks/useAppello'
import ChildAttendanceRow from './ChildAttendanceRow'
import type { Session } from '../../types'
import { SESSION_LABELS } from '../../types'

type AppelloListProps = {
  schoolId: string
  classId: string
  operatoreUid: string
  session: Session
  /** Colore della scuola. Default: dusty-blue */
  color?: string
}

// Data di oggi in italiano esteso, es. "mercoledì 22 luglio 2026"
function todayLabel(): string {
  return new Date().toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Appello del giorno: intestazione con data, progresso, elenco bambini con interruttore. */
export default function AppelloList({ schoolId, classId, operatoreUid, session, color = '#6E859C' }: AppelloListProps) {
  const { children, present, setPresent, presentCount } = useAppello(schoolId, classId, session)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-sm text-warmgray">
            Appello di <span className="lowercase">{SESSION_LABELS[session]}</span> —
          </p>
          <p className="font-serif text-lg font-semibold capitalize">{todayLabel()}</p>
        </div>
        {/* Progresso: quanti segnati presenti (aiuta a non dimenticare nessuno) */}
        <p className="text-sm font-medium" style={{ color }}>
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
