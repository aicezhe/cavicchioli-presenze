import type { Session } from '../types'
import { SESSION_LABELS } from '../types'

type SessionSwitchProps = {
  value: Session
  onChange: (session: Session) => void
  /** Colore della scuola per lo stato attivo. Default: dusty-blue */
  color?: string
}

const SESSIONS: Session[] = ['morning', 'evening']

/** Interruttore fra le due sessioni di pre/post-scuola: Mattina / Pomeriggio. */
export default function SessionSwitch({ value, onChange, color = '#6E859C' }: SessionSwitchProps) {
  return (
    <div
      role="group"
      aria-label="Sessione"
      className="inline-flex rounded-full border border-black/15 bg-white p-0.5"
    >
      {SESSIONS.map((s) => {
        const active = value === s
        return (
          <button
            key={s}
            onClick={() => onChange(s)}
            aria-pressed={active}
            style={active ? { backgroundColor: color } : undefined}
            className={
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors ' +
              (active ? 'text-cream' : 'text-warmgray hover:text-ink')
            }
          >
            {SESSION_LABELS[s]}
          </button>
        )
      })}
    </div>
  )
}
