import type { Child, WithId } from '../../types'

type ChildAttendanceRowProps = {
  child: WithId<Child>
  present: boolean
  onToggle: (value: boolean) => void
  /** Colore della scuola per la spunta. Default: dusty-blue */
  color?: string
}

/** Riga appello: nome del bambino + casella "presente" grande e comoda al tocco.
    Tutta la riga è cliccabile per segnare più velocemente. */
export default function ChildAttendanceRow({ child, present, onToggle, color = '#6E859C' }: ChildAttendanceRowProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={present}
      aria-label={`Presente: ${child.firstName} ${child.lastName}`}
      onClick={() => onToggle(!present)}
      className="w-full flex items-center justify-between gap-4 bg-white rounded-xl border border-black/10 px-4 py-3 text-left hover:bg-cream/40 transition-colors"
    >
      <span className="min-w-0 font-medium truncate">
        {child.lastName} <span className="text-warmgray">{child.firstName}</span>
      </span>

      {/* Casella di spunta */}
      <span
        style={{ backgroundColor: present ? color : '#fff', borderColor: color }}
        className={
          'grid place-items-center w-7 h-7 shrink-0 rounded-md border-2 transition-colors ' +
          (present ? 'text-cream' : 'text-transparent')
        }
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    </button>
  )
}
