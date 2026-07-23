import { useState } from 'react'
import type { FormEvent } from 'react'
import Crest from '../Crest'
import { SCHOOL_COLORS, schoolInitials } from '../../types'
import type { NewSchoolData } from '../../hooks/useSchools'

type NewSchoolFormProps = {
  onSubmit: (data: NewSchoolData) => Promise<void>
  onDone?: () => void
  submitLabel?: string
}

/** Form scuola: nome + colore (palette) + iniziali, con anteprima dell'emblema. */
export default function NewSchoolForm({ onSubmit, onDone, submitLabel = 'Crea scuola' }: NewSchoolFormProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(SCHOOL_COLORS[0].value)
  const [initials, setInitials] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Anteprima iniziali: quelle digitate o quelle derivate dal nome
  const previewInitials = schoolInitials({ name, emblemInitials: initials.trim() || undefined })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setError(null)
    setSaving(true)
    try {
      await onSubmit({ name, primaryColor: color, emblemInitials: initials.trim() || undefined })
      onDone?.()
    } catch (err) {
      console.error(err)
      setError('Impossibile salvare. Riprova.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Anteprima emblema */}
      <div className="flex justify-center">
        <Crest size={80} variant="compact" color={color} initials={previewInitials} />
      </div>

      <label className="block">
        <span className="text-sm font-medium">Nome della scuola</span>
        <input
          required
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Es. Scuola Primaria "Dante Alighieri"'
          className="mt-1 w-full rounded-lg border border-warmgray/40 bg-cream/50 px-3 py-2.5
                     focus:outline-none focus:ring-2 focus:ring-black/20"
        />
      </label>

      <div>
        <span className="text-sm font-medium">Colore</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {SCHOOL_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              aria-label={c.name}
              aria-pressed={color === c.value}
              title={c.name}
              style={{ backgroundColor: c.value }}
              className={
                'w-8 h-8 rounded-full transition-transform ' +
                (color === c.value ? 'ring-2 ring-offset-2 ring-ink scale-110' : 'hover:scale-105')
              }
            />
          ))}
        </div>
      </div>

      <label className="block">
        <span className="text-sm font-medium">Iniziali emblema</span>
        <input
          value={initials}
          maxLength={3}
          onChange={(e) => setInitials(e.target.value)}
          placeholder={previewInitials}
          className="mt-1 w-28 rounded-lg border border-warmgray/40 bg-cream/50 px-3 py-2.5 uppercase
                     focus:outline-none focus:ring-2 focus:ring-black/20"
        />
        <span className="mt-1 block text-xs text-warmgray">Lascia vuoto per derivarle dal nome.</span>
      </label>

      {error && <p className="text-sm text-dustyblue">{error}</p>}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          style={{ backgroundColor: color }}
          className="flex-1 rounded-lg px-4 py-2.5 text-cream font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? 'Salvataggio…' : submitLabel}
        </button>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="rounded-lg border border-warmgray/40 px-4 py-2.5 font-medium hover:bg-white transition-colors"
          >
            Annulla
          </button>
        )}
      </div>
    </form>
  )
}
