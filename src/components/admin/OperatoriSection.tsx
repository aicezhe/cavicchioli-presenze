import { useState } from 'react'
import type { FormEvent } from 'react'
import { FirebaseError } from 'firebase/app'
import { useOperators } from '../../hooks/useOperators'
import { useProvisionUser } from '../../hooks/useProvisionUser'
import Modal from './Modal'
import type { SchoolClass, WithId } from '../../types'

type OperatoriSectionProps = {
  classes: WithId<SchoolClass>[]
  /** Attiva/disattiva l'accesso di un operatore a una classe (aggiorna operatorIds) */
  onToggle: (classId: string, operatorUid: string, assigned: boolean) => Promise<void>
}

const inputClass =
  'mt-1 w-full rounded-lg border border-warmgray/40 bg-white px-3 py-2.5 ' +
  'focus:outline-none focus:ring-2 focus:ring-crimson/60 focus:border-crimson'

function errorMessage(err: unknown): string {
  if (err instanceof FirebaseError) {
    if (err.code === 'auth/email-already-in-use') return 'Esiste già un account con questa email.'
    if (err.code === 'auth/invalid-email') return 'Indirizzo email non valido.'
    if (err.code === 'auth/weak-password') return 'La password deve contenere almeno 6 caratteri.'
  }
  return 'Impossibile creare l’operatore. Riprova.'
}

/**
 * Vista d'insieme sugli operatori della scuola: per ciascuno, le classi a cui ha
 * accesso, come multiselezione di chip. L'admin può anche creare un nuovo operatore
 * (il direttore assegna le credenziali).
 */
export default function OperatoriSection({ classes, onToggle }: OperatoriSectionProps) {
  const operators = useOperators()
  const { provisionUser } = useProvisionUser()

  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function resetForm() {
    setName('')
    setEmail('')
    setPassword('')
    setError(null)
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await provisionUser('operatore', name, email, password)
      resetForm()
      setShowAdd(false)
    } catch (err) {
      console.error(err)
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-semibold">Operatori</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="rounded-lg bg-crimson px-4 py-2 text-sm text-cream font-medium hover:opacity-90 transition-opacity"
        >
          + Aggiungi operatore
        </button>
      </div>

      {operators.length === 0 ? (
        <p className="text-sm text-warmgray">
          Nessun operatore. Aggiungine uno: le credenziali le consegna la scuola.
        </p>
      ) : (
        <div className="space-y-3">
          {operators.map((op) => (
            <div key={op.id} className="bg-white rounded-xl border border-gold/40 px-5 py-4">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-medium">{op.name}</span>
                <span className="text-sm text-warmgray">{op.email}</span>
              </div>

              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-warmgray">
                Classi con accesso
              </p>
              {classes.length === 0 ? (
                <p className="mt-1 text-sm text-warmgray">Nessuna classe disponibile.</p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  {classes.map((cls) => {
                    const assigned = cls.operatorIds?.includes(op.id) ?? false
                    return (
                      <button
                        key={cls.id}
                        onClick={() => onToggle(cls.id, op.id, !assigned)}
                        aria-pressed={assigned}
                        className={
                          'rounded-full px-3 py-1 text-sm font-medium transition-colors ' +
                          (assigned
                            ? 'bg-crimson text-cream'
                            : 'border border-gold text-ink hover:bg-gold/10')
                        }
                      >
                        {cls.name}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modale: nuovo operatore */}
      <Modal
        open={showAdd}
        title="Nuovo operatore"
        onClose={() => {
          resetForm()
          setShowAdd(false)
        }}
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Nome e cognome</span>
            <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </label>
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
              Almeno 6 caratteri. Da consegnare all’operatore.
            </span>
          </label>

          {error && <p className="text-sm text-crimson">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-crimson px-4 py-2.5 text-cream font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? 'Creazione…' : 'Crea operatore'}
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm()
                setShowAdd(false)
              }}
              className="rounded-lg border border-warmgray/40 px-4 py-2.5 font-medium hover:bg-white transition-colors"
            >
              Annulla
            </button>
          </div>
        </form>
      </Modal>
    </section>
  )
}
