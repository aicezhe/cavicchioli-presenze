import { useState } from 'react'
import { DEFAULT_SCHOOL_COLOR } from '../../types'
import type { AttendanceRecord, Session } from '../../types'

type AttendanceCalendarProps = {
  /** presenze per data (YYYY-MM-DD) */
  records: Record<string, AttendanceRecord>
  session: Session
  /** Colore della scuola (giorni presenti, oggi, legenda). Default: dusty-blue */
  color?: string
}

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
const MONTHS = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']

const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

/**
 * Calendario mensile delle presenze di UNA sessione.
 * Giorno bordeaux = bambino presente; bianco = assente (o nessuna registrazione).
 * Toccando il titolo (mese/anno) si apre la scelta rapida di mese e anno.
 */
export default function AttendanceCalendar({ records, session, color = DEFAULT_SCHOOL_COLOR }: AttendanceCalendarProps) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth()) // 0-11
  const [pickerOpen, setPickerOpen] = useState(false)

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
    <div className="bg-white rounded-xl border border-black/10 p-4 sm:p-5">
      {/* Intestazione: frecce mese + titolo che apre la scelta mese/anno */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          aria-label="Mese precedente"
          disabled={pickerOpen}
          className="w-8 h-8 grid place-items-center rounded-lg hover:bg-cream transition-colors disabled:opacity-0"
        >
          &lsaquo;
        </button>

        <button
          onClick={() => setPickerOpen((v) => !v)}
          aria-expanded={pickerOpen}
          className="inline-flex items-center gap-1 font-serif text-lg font-semibold capitalize hover:text-ink transition-colors"
        >
          {monthLabel}
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            className={'transition-transform ' + (pickerOpen ? 'rotate-180' : '')}
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <button
          onClick={nextMonth}
          aria-label="Mese successivo"
          disabled={pickerOpen}
          className="w-8 h-8 grid place-items-center rounded-lg hover:bg-cream transition-colors disabled:opacity-0"
        >
          &rsaquo;
        </button>
      </div>

      {pickerOpen ? (
        /* Scelta mese/anno */
        <div>
          {/* Anno con frecce */}
          <div className="flex items-center justify-center gap-6 mb-4">
            <button
              onClick={() => setYear((y) => y - 1)}
              aria-label="Anno precedente"
              className="w-8 h-8 grid place-items-center rounded-lg hover:bg-cream transition-colors text-lg"
            >
              &lsaquo;
            </button>
            <span className="font-serif text-xl font-semibold">{year}</span>
            <button
              onClick={() => setYear((y) => y + 1)}
              aria-label="Anno successivo"
              className="w-8 h-8 grid place-items-center rounded-lg hover:bg-cream transition-colors text-lg"
            >
              &rsaquo;
            </button>
          </div>

          {/* Mesi */}
          <div className="grid grid-cols-3 gap-2">
            {MONTHS.map((m, i) => {
              const selected = i === month
              const isCurrent = i === now.getMonth() && year === now.getFullYear()
              return (
                <button
                  key={m}
                  onClick={() => {
                    setMonth(i)
                    setPickerOpen(false)
                  }}
                  style={
                    selected
                      ? { backgroundColor: color, borderColor: color }
                      : isCurrent
                        ? { boxShadow: `inset 0 0 0 1px ${color}` }
                        : undefined
                  }
                  className={
                    'py-2.5 rounded-lg text-sm font-medium border transition-colors ' +
                    (selected ? 'text-cream' : 'bg-white text-ink border-black/10 hover:bg-cream')
                  }
                >
                  {m}
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <>
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
                  style={{
                    ...(present ? { backgroundColor: color, borderColor: color } : {}),
                    ...(isToday ? { boxShadow: `0 0 0 2px ${color}` } : {}),
                  }}
                  className={
                    'aspect-square grid place-items-center rounded-lg text-lg sm:text-xl font-medium border transition-colors ' +
                    (present ? 'text-cream' : 'bg-white text-ink border-black/10')
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
              <span className="w-3 h-3 rounded inline-block" style={{ backgroundColor: color }} /> Presente
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-white border border-black/20 inline-block" /> Assente
            </span>
          </div>
        </>
      )}
    </div>
  )
}
