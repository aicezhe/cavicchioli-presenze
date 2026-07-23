import type { Child, WithId } from '../../types'

type ChildAttendanceRowProps = {
  child: WithId<Child>
  present: boolean
  onToggle: (value: boolean) => void
}

/** Riga appello: nome del bambino + interruttore "presente" grande e comodo al tocco. */
export default function ChildAttendanceRow({ child, present, onToggle }: ChildAttendanceRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 bg-white rounded-xl border border-gold/40 px-4 py-3">
      <div className="min-w-0">
        <p className="font-medium truncate">
          {child.lastName} <span className="text-warmgray">{child.firstName}</span>
        </p>
      </div>

      {/* Interruttore presente/assente */}
      <button
        role="switch"
        aria-checked={present}
        aria-label={`Presente: ${child.firstName} ${child.lastName}`}
        onClick={() => onToggle(!present)}
        className={
          'relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors ' +
          (present ? 'bg-crimson' : 'bg-warmgray/40')
        }
      >
        <span
          className={
            'inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ' +
            (present ? 'translate-x-7' : 'translate-x-1')
          }
        />
      </button>
    </div>
  )
}
