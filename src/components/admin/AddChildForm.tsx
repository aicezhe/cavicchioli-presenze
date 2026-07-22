import { useState } from 'react'
import type { FormEvent } from 'react'

type AddChildFormProps = {
  onSubmit: (data: {
    firstName: string
    lastName: string
    dob: string
    parentEmail: string
  }) => Promise<void>
  onDone: () => void
}

const inputClass =
  'mt-1 w-full rounded-lg border border-warmgray/40 bg-white px-3 py-2.5 ' +
  'focus:outline-none focus:ring-2 focus:ring-crimson/60 focus:border-crimson'

/** Form per aggiungere un bambino a una classe. */
export default function AddChildForm({ onSubmit, onDone }: AddChildFormProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dob, setDob] = useState('')
  const [parentEmail, setParentEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await onSubmit({ firstName, lastName, dob, parentEmail })
      onDone()
    } catch (err) {
      console.error(err)
      setError('Impossibile salvare. Riprova.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium">Nome</span>
        <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Cognome</span>
        <input required value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Data di nascita</span>
        <input type="date" required value={dob} onChange={(e) => setDob(e.target.value)} className={inputClass} />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Email del genitore</span>
        <input
          type="email"
          value={parentEmail}
          onChange={(e) => setParentEmail(e.target.value)}
          className={inputClass}
          placeholder="opzionale"
        />
        <span className="mt-1 block text-xs text-warmgray">
          Il genitore vedrà il figlio anche se si registra più tardi con questa email.
        </span>
      </label>

      {error && <p className="text-sm text-crimson">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-lg bg-crimson px-4 py-2.5 text-cream font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? 'Salvataggio…' : 'Aggiungi'}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-warmgray/40 px-4 py-2.5 font-medium hover:bg-white transition-colors"
        >
          Annulla
        </button>
      </div>
    </form>
  )
}
