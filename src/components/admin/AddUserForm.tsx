import { useState } from 'react'
import type { FormEvent } from 'react'
import { FirebaseError } from 'firebase/app'

type AddUserFormProps = {
  /** Crea l'utente; deve rifiutare l'errore per mostrarne il messaggio */
  onSubmit: (name: string, email: string, password: string, phone: string) => Promise<void>
  onDone: () => void
  submitLabel: string
  /** Mostra il campo telefono (utile per gli operatori: rubrica dei genitori) */
  withPhone?: boolean
}

const inputClass =
  'mt-1 w-full rounded-lg border border-warmgray/40 bg-white px-3 py-2.5 ' +
  'focus:outline-none focus:ring-2 focus:ring-dustyblue/60 focus:border-dustyblue'

function errorMessage(err: unknown): string {
  if (err instanceof FirebaseError) {
    if (err.code === 'auth/email-already-in-use') return 'Esiste già un account con questa email.'
    if (err.code === 'auth/invalid-email') return 'Indirizzo email non valido.'
    if (err.code === 'auth/weak-password') return 'La password deve contenere almeno 6 caratteri.'
  }
  return 'Impossibile creare l’account. Riprova.'
}

/** Form condiviso per creare un account (operatore/genitore/amministratore). */
export default function AddUserForm({ onSubmit, onDone, submitLabel, withPhone }: AddUserFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await onSubmit(name, email, password, phone)
      onDone()
    } catch (err) {
      console.error(err)
      setError(errorMessage(err))
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium">Nome e cognome</span>
        <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Email</span>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
      </label>
      {withPhone && (
        <label className="block">
          <span className="text-sm font-medium">Telefono</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            placeholder="opzionale — visibile ai genitori"
          />
        </label>
      )}
      <label className="block">
        <span className="text-sm font-medium">Password iniziale</span>
        <input
          type="text"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        <span className="mt-1 block text-xs text-warmgray">
          Almeno 6 caratteri. Da consegnare all’utente.
        </span>
      </label>

      {error && <p className="text-sm text-dustyblue">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-lg bg-dustyblue px-4 py-2.5 text-cream font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? 'Creazione…' : submitLabel}
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
