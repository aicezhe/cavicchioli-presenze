import { useState } from 'react'
import { DEFAULT_SCHOOL_COLOR } from '../../types'

type DatePickerProps = {
  /** Data selezionata (ISO YYYY-MM-DD) */
  value: string
  onChange: (iso: string) => void
  /** Colore della scuola (giorno selezionato / oggi). Default: dusty-blue */
  color?: string
}

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
const MONTHS = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']

const pad = (n: number) => String(n).padStart(2, '0')
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`

// Etichetta estesa: "giovedì 23 luglio 2026"
function dateLabel(isoStr: string): string {
  const [y, m, d] = isoStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Selettore di data a calendario, con lo stesso metodo della sezione genitore:
 * frecce di mese + titolo cliccabile per la scelta rapida di mese/anno, e clic sul
 * giorno per selezionarlo. Sostituisce le frecce giorno/settimana.
 */
export default function DatePicker({ value, onChange, color = DEFAULT_SCHOOL_COLOR }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  // Mese/anno mostrati nel calendario, inizializzati dalla data selezionata
  const [vy, vm] = value.split('-').map(Number)
  const [year, setYear] = useState(vy)
  const [month, setMonth] = useState(vm - 1) // 0-11
  const [pickerOpen, setPickerOpen] = useState(false)

  const now = new Date()
  const todayIso = iso(now.getFullYear(), now.getMonth(), now.getDate())

  const monthLabel = new Date(year, month, 1).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
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

  const open_ = () => {
    setYear(vy)
    setMonth(vm - 1)
    setPickerOpen(false)
    setOpen(true)
  }
  const selectDay = (day: number) => {
    onChange(iso(year, month, day))
    setOpen(false)
  }

  return (
    <div className="relative inline-block">
      {/* Data selezionata: cliccando si apre il calendario */}
      <button
        onClick={() => (open ? setOpen(false) : open_())}
        aria-expanded={open}
        className="inline-flex items-center gap-2 font-serif text-lg font-semibold capitalize hover:opacity-80 transition-opacity"
      >
        {dateLabel(value)}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          className={'transition-transform ' + (open ? 'rotate-180' : '')} aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <>
          {/* Overlay per chiudere cliccando fuori */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-1/2 -translate-x-1/2 mt-2 z-50 w-72 rounded-xl border border-black/10 bg-white shadow-lg p-4 text-ink">
            {/* Intestazione: frecce mese + titolo che apre la scelta mese/anno */}
            <div className="flex items-center justify-between mb-3">
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
                className="inline-flex items-center gap-1 font-serif font-semibold capitalize hover:opacity-80 transition-opacity"
              >
                {monthLabel}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  className={'transition-transform ' + (pickerOpen ? 'rotate-180' : '')} aria-hidden="true">
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
              /* Scelta rapida mese/anno */
              <div>
                <div className="flex items-center justify-center gap-6 mb-3">
                  <button onClick={() => setYear((y) => y - 1)} aria-label="Anno precedente" className="w-8 h-8 grid place-items-center rounded-lg hover:bg-cream text-lg">&lsaquo;</button>
                  <span className="font-serif text-lg font-semibold">{year}</span>
                  <button onClick={() => setYear((y) => y + 1)} aria-label="Anno successivo" className="w-8 h-8 grid place-items-center rounded-lg hover:bg-cream text-lg">&rsaquo;</button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {MONTHS.map((mm, i) => {
                    const selected = i === month
                    return (
                      <button
                        key={mm}
                        onClick={() => {
                          setMonth(i)
                          setPickerOpen(false)
                        }}
                        style={selected ? { backgroundColor: color, borderColor: color } : undefined}
                        className={
                          'py-2 rounded-lg text-sm font-medium border transition-colors ' +
                          (selected ? 'text-cream' : 'bg-white text-ink border-black/10 hover:bg-cream')
                        }
                      >
                        {mm}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {WEEKDAYS.map((w) => (
                    <div key={w} className="text-center text-xs text-warmgray py-1">{w}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {cells.map((day, i) => {
                    if (day === null) return <div key={`e${i}`} />
                    const cellIso = iso(year, month, day)
                    const selected = cellIso === value
                    const isToday = cellIso === todayIso
                    return (
                      <button
                        key={cellIso}
                        onClick={() => selectDay(day)}
                        style={{
                          ...(selected ? { backgroundColor: color, borderColor: color } : {}),
                          ...(isToday && !selected ? { boxShadow: `inset 0 0 0 1px ${color}` } : {}),
                        }}
                        className={
                          'aspect-square grid place-items-center rounded-lg text-sm font-medium border transition-colors ' +
                          (selected ? 'text-cream' : 'bg-white text-ink border-transparent hover:bg-cream')
                        }
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
