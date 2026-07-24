import { useState } from 'react'
import type { FormEvent } from 'react'

type EditOperatoreFormProps = {
  initialName: string
  initialCanManageRoster: boolean
  onSubmit: (name: string, canManageRoster: boolean) => Promise<void>
  onDone: () => void
}

/**
 * Modifica di un operatore: nome + permesso "Può gestire la classe".
 * Il permesso concede all'operatore il diritto di modificare la composizione (bambini)
 * delle sue classi, come un mini-admin — applicato anche dalle regole Firestore.
 */
export default function EditOperatoreForm({
  initialName,
  initialCanManageRoster,
  onSubmit,
  onDone,
}: EditOperatoreFormProps) {
  const [name, setName] = useState(initialName)
  const [canManage, setCanManage] = useState(initialCanManageRoster)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setError(null)
    setSaving(true)
    try {
      await onSubmit(name.trim(), canManage)
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
        <span className="text-sm font-medium">Nome e cognome</span>
        <input
          required
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-warmgray/40 bg-white px-3 py-2.5
                     focus:outline-none focus:ring-2 focus:ring-dustyblue/60 focus:border-dustyblue"
        />
      </label>

      {/* Permesso "gestione classe" (mini-admin sul roster) */}
      <button
        type="button"
        role="switch"
        aria-checked={canManage}
        onClick={() => setCanManage((v) => !v)}
        className="w-full flex items-start gap-3 rounded-lg border border-warmgray/40 p-3 text-left hover:bg-cream/50 transition-colors"
      >
        <span
          className={
            'mt-0.5 relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ' +
            (canManage ? 'bg-dustyblue' : 'bg-warmgray/40')
          }
        >
          <span
            className={
              'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ' +
              (canManage ? 'left-4' : 'left-0.5')
            }
          />
        </span>
        <span>
          <span className="block text-sm font-medium">Può gestire la classe</span>
          <span className="block text-xs text-warmgray">
            Consente all'operatore di aggiungere, modificare o rimuovere i bambini delle sue classi.
          </span>
        </span>
      </button>

      {error && <p className="text-sm text-dustyblue">{error}</p>}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-lg bg-dustyblue px-4 py-2.5 text-cream font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? 'Salvataggio…' : 'Salva'}
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
