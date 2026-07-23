import { useState } from 'react'
import type { AttendanceRecord, Session } from '../../types'

type AttendanceCalendarProps = {
  /** presenze per data (YYYY-MM-DD) */
  records: Record<string, AttendanceRecord>
  session: Session
}

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']

const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

/**
 * Calendario mensile delle presenze di UNA sessione.
 * Giorno bordeaux = bambino presente; bianco = assente (o nessuna registrazione).
 */
export default function AttendanceCalendar({ records, session }: AttendanceCalendarProps) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth()) // 0-11

  const monthLabel = new Date(year, month, 1).toLocaleDateString('it-IT', {
    month: 'long',
    year: 'numeric',
  })

  // Offset del 1° del mese rispetto a lunedì (getDay: 0=domenica)
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const prevMonth = () => {
    if (month === 0) {
      setYear((y) => y - 1)
      setMonth(11)
    } else setMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) {
      setYear((y) => y + 1)
      setMonth(0)
    } else setMonth((m) => m + 1)
  }

  const todayIso = iso(now.getFullYear(), now.getMonth(), now.getDate())

  return (
    <div className="bg-white rounded-xl border border-gold/40 p-4 sm:p-5">
      {/* Intestazione mese + navigazione */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          aria-label="Mese precedente"
          className="w-8 h-8 grid place-items-center rounded-lg hover:bg-cream transition-colors"
        >
          &lsaquo;
        </button>
        <p className="font-serif text-lg font-semibold capitalize">{monthLabel}</p>
        <button
          onClick={nextMonth}
          aria-label="Mese successivo"
          className="w-8 h-8 grid place-items-center rounded-lg hover:bg-cream transition-colors"
        >
          &rsaquo;
        </button>
      </div>

      {/* Giorni della settimana */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-xs text-warmgray py-1">
            {w}
          </div>
        ))}
      </div>

      {/* Griglia giorni */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} />
          const dateIso = iso(year, month, day)
          const present = records[dateIso]?.[session] === true
          const isToday = dateIso === todayIso
          return (
            <div
              key={dateIso}
              className={
                'aspect-square grid place-items-center rounded-lg text-sm border transition-colors ' +
                (present
                  ? 'bg-crimson text-cream border-crimson'
                  : 'bg-white text-ink border-gold/30') +
                (isToday ? ' ring-2 ring-gold' : '')
              }
              title={present ? 'Presente' : 'Assente'}
            >
              {day}
            </div>
          )
        })}
      </div>

      {/* Legenda */}
      <div className="mt-4 flex items-center gap-4 text-xs text-warmgray">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-crimson inline-block" /> Presente
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-white border border-gold/40 inline-block" /> Assente
        </span>
      </div>
    </div>
  )
}
