import type { Session } from '../types'
import { SESSION_LABELS } from '../types'

type SessionSwitchProps = {
  value: Session
  onChange: (session: Session) => void
}

const SESSIONS: Session[] = ['morning', 'evening']

/** Interruttore fra le due sessioni di pre/post-scuola: Mattina / Pomeriggio. */
export default function SessionSwitch({ value, onChange }: SessionSwitchProps) {
  return (
    <div
      role="group"
      aria-label="Sessione"
      className="inline-flex rounded-full border border-dustyblue/50 bg-white p-0.5"
    >
      {SESSIONS.map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          aria-pressed={value === s}
          className={
            'rounded-full px-4 py-1.5 text-sm font-medium transition-colors ' +
            (value === s ? 'bg-dustyblue text-cream' : 'text-warmgray hover:text-ink')
          }
        >
          {SESSION_LABELS[s]}
        </button>
      ))}
    </div>
  )
}
