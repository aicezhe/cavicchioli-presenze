import { useState } from 'react'
import type { FormEvent } from 'react'
import ClassAccordion from './ClassAccordion'
import Modal from './Modal'
import { CLASS_COLOR_SECTIONS, CLASS_SECTIONS, CLASS_YEARS, makeClassName, makeColorClassName } from '../../types'
import type { SchoolClass, WithId } from '../../types'

type ClassiSectionProps = {
  schoolId: string
  classes: WithId<SchoolClass>[]
  addClass: (name: string) => Promise<void>
  removeClass: (classId: string) => Promise<void>
  onToggleOperator: (classId: string, operatorUid: string, assigned: boolean) => Promise<void>
  onDataChange: () => void
  /** Classe da aprire (dalla ricerca) e nonce per riattivare l'apertura */
  openClassId?: string | null
  openNonce?: number
}

/** Sezione "Classi": elenco delle classi come accordion + creazione nuova classe. */
export default function ClassiSection({
  schoolId,
  classes,
  addClass,
  removeClass,
  onToggleOperator,
  onDataChange,
  openClassId,
  openNonce,
}: ClassiSectionProps) {
  const [showNewClass, setShowNewClass] = useState(false)
  // Composizione guidata del nome (niente testo libero):
  // 'numerica' → anno + sezione (es. "2ª B"); 'colore' → sezione a colori (es. "Sezione Blu")
  const [nameType, setNameType] = useState<'numerica' | 'colore'>('numerica')
  const [year, setYear] = useState<number>(CLASS_YEARS[0])
  const [section, setSection] = useState<string>(CLASS_SECTIONS[0])
  const [colorName, setColorName] = useState<string>(CLASS_COLOR_SECTIONS[0].name)
  const newName = nameType === 'numerica' ? makeClassName(year, section) : makeColorClassName(colorName)
  const alreadyExists = classes.some((c) => c.name === newName)

  async function handleAddClass(e: FormEvent) {
    e.preventDefault()
    if (alreadyExists) return
    await addClass(newName)
    setShowNewClass(false)
    onDataChange()
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-semibold">Classi</h2>
        <button
          onClick={() => setShowNewClass(true)}
          className="rounded-lg bg-dustyblue px-4 py-2 text-sm text-cream font-medium hover:opacity-90 transition-opacity"
        >
          + Nuova classe
        </button>
      </div>

      {classes.length === 0 ? (
        <p className="text-sm text-warmgray">Nessuna classe. Creane una per iniziare.</p>
      ) : (
        <div className="space-y-3">
          {classes.map((cls) => (
            <ClassAccordion
              key={cls.id}
              schoolId={schoolId}
              cls={cls}
              onRemoveClass={async (id) => {
                await removeClass(id)
                onDataChange()
              }}
              onToggleOperator={onToggleOperator}
              onDataChange={onDataChange}
              openSignal={openClassId === cls.id ? openNonce : undefined}
            />
          ))}
        </div>
      )}

      <Modal open={showNewClass} title="Nuova classe" onClose={() => setShowNewClass(false)}>
        <form onSubmit={handleAddClass} className="space-y-4">
          {/* Tipo di nome: numerica (1ª A) o a colori (Sezione Blu, es. infanzia) */}
          <div className="inline-flex rounded-lg border border-warmgray/40 p-0.5 text-sm">
            {(['numerica', 'colore'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setNameType(t)}
                className={
                  'rounded-md px-3 py-1.5 font-medium transition-colors ' +
                  (nameType === t ? 'bg-dustyblue text-cream' : 'text-warmgray hover:text-ink')
                }
              >
                {t === 'numerica' ? 'Numerica' : 'A colori'}
              </button>
            ))}
          </div>

          {nameType === 'numerica' ? (
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-medium">Anno</span>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-warmgray/40 bg-white px-3 py-2.5
                             focus:outline-none focus:ring-2 focus:ring-dustyblue/60 focus:border-dustyblue"
                >
                  {CLASS_YEARS.map((y) => (
                    <option key={y} value={y}>{y}ª</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium">Sezione</span>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-warmgray/40 bg-white px-3 py-2.5
                             focus:outline-none focus:ring-2 focus:ring-dustyblue/60 focus:border-dustyblue"
                >
                  {CLASS_SECTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>
          ) : (
            <div>
              <span className="text-sm font-medium">Colore della sezione</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {CLASS_COLOR_SECTIONS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setColorName(c.name)}
                    aria-pressed={colorName === c.name}
                    className={
                      'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ' +
                      (colorName === c.name ? 'border-ink bg-cream' : 'border-warmgray/40 hover:bg-cream/50')
                    }
                  >
                    <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: c.value }} />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="text-sm text-warmgray">
            Classe: <span className="font-serif font-semibold text-ink">{newName}</span>
            {alreadyExists && <span className="text-dustyblue"> · esiste già</span>}
          </p>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={alreadyExists}
              className="flex-1 rounded-lg bg-dustyblue px-4 py-2.5 text-cream font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              Crea
            </button>
            <button
              type="button"
              onClick={() => setShowNewClass(false)}
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
