import { useState } from 'react'
import { useAppello, todayIso } from '../../hooks/useAppello'
import ChildAttendanceRow from './ChildAttendanceRow'
import DatePicker from './DatePicker'
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

/** Appello del giorno: data scelta da calendario, progresso, elenco bambini. */
export default function AppelloList({ schoolId, classId, operatoreUid, session, color = DEFAULT_SCHOOL_COLOR }: AppelloListProps) {
  const [date, setDate] = useState(todayIso())
  const { children, present, setPresent, presentCount } = useAppello(schoolId, classId, session, date)
  const isToday = date === todayIso()

  return (
    <div className="space-y-4">
      {/* Data scelta da calendario (stesso metodo della sezione genitore), centrata */}
      <div className="space-y-1 text-center">
        <p className="text-xs text-warmgray">
          Appello di <span className="lowercase">{SESSION_LABELS[session]}</span>
        </p>
        <DatePicker value={date} onChange={setDate} color={color} />
        {!isToday && (
          <div>
            <button onClick={() => setDate(todayIso())} className="text-xs hover:underline" style={{ color }}>
              Torna a oggi
            </button>
          </div>
        )}
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
