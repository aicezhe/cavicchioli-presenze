import { useState } from 'react'
import type { FormEvent } from 'react'
import ClassAccordion from './ClassAccordion'
import Modal from './Modal'
import type { SchoolClass, WithId } from '../../types'

type ClassiSectionProps = {
  schoolId: string
  classes: WithId<SchoolClass>[]
  addClass: (name: string) => Promise<void>
  removeClass: (classId: string) => Promise<void>
  onToggleOperator: (classId: string, operatorUid: string, assigned: boolean) => Promise<void>
  onDataChange: () => void
}

/** Sezione "Classi": elenco delle classi come accordion + creazione nuova classe. */
export default function ClassiSection({
  schoolId,
  classes,
  addClass,
  removeClass,
  onToggleOperator,
  onDataChange,
}: ClassiSectionProps) {
  const [showNewClass, setShowNewClass] = useState(false)
  const [newClassName, setNewClassName] = useState('')

  async function handleAddClass(e: FormEvent) {
    e.preventDefault()
    if (!newClassName.trim()) return
    await addClass(newClassName)
    setNewClassName('')
    setShowNewClass(false)
    onDataChange()
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-semibold">Classi</h2>
        <button
          onClick={() => setShowNewClass(true)}
          className="rounded-lg bg-crimson px-4 py-2 text-sm text-cream font-medium hover:opacity-90 transition-opacity"
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
            />
          ))}
        </div>
      )}

      <Modal open={showNewClass} title="Nuova classe" onClose={() => setShowNewClass(false)}>
        <form onSubmit={handleAddClass} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Nome della classe</span>
            <input
              required
              autoFocus
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="Es. 1ª A"
              className="mt-1 w-full rounded-lg border border-warmgray/40 bg-white px-3 py-2.5
                         focus:outline-none focus:ring-2 focus:ring-crimson/60 focus:border-crimson"
            />
          </label>
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-crimson px-4 py-2.5 text-cream font-medium hover:opacity-90 transition-opacity"
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
