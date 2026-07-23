import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChildren } from '../../hooks/useChildren'
import { useOperators } from '../../hooks/useOperators'
import Modal from './Modal'
import AddChildForm from './AddChildForm'
import AssignOperatoreForm from './AssignOperatoreForm'
import type { SchoolClass, WithId } from '../../types'

type ClassAccordionProps = {
  schoolId: string
  cls: WithId<SchoolClass>
  onRemoveClass: (classId: string) => void
  onToggleOperator: (classId: string, operatorUid: string, assigned: boolean) => Promise<void>
  onDataChange: () => void
  /** Se cambia a un valore > 0, apre l'accordion (usato dalla ricerca per saltare qui) */
  openSignal?: number
}

// Formatta una data ISO in gg/mm/aaaa per la UI
function formatDob(iso: string): string {
  const [y, m, d] = iso.split('-')
  return d && m && y ? `${d}/${m}/${y}` : iso
}

export default function ClassAccordion({
  schoolId,
  cls,
  onRemoveClass,
  onToggleOperator,
  onDataChange,
  openSignal,
}: ClassAccordionProps) {
  const [open, setOpen] = useState(false)

  // La ricerca chiede di aprire questa classe
  useEffect(() => {
    if (openSignal) setOpen(true)
  }, [openSignal])
  const [showAddChild, setShowAddChild] = useState(false)
  const [showAssign, setShowAssign] = useState(false)
  const { children, addChild, removeChild } = useChildren(schoolId, open ? cls.id : undefined)
  const operators = useOperators()

  // Nomi degli operatori assegnati (per il sottotitolo)
  const assignedNames = operators
    .filter((op) => cls.operatorIds?.includes(op.id))
    .map((op) => op.name)

  return (
    <div className="bg-white rounded-xl border border-gold/40 overflow-hidden">
      {/* Testata cliccabile dell'accordion */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-cream/60 transition-colors"
      >
        <span className="font-serif text-lg font-semibold">{cls.name}</span>
        <span className="text-xs text-warmgray">
          {assignedNames.length > 0 ? assignedNames.join(', ') : 'nessun operatore'}
        </span>
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          className="ml-auto text-warmgray"
          aria-hidden="true"
        >
          ▸
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-gold/30 pt-4 space-y-5">
              {/* Bambini */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-warmgray">Bambini</h4>
                  <button
                    onClick={() => setShowAddChild(true)}
                    className="text-sm text-crimson font-medium hover:underline"
                  >
                    + Aggiungi bambino
                  </button>
                </div>
                {children.length === 0 ? (
                  <p className="text-sm text-warmgray">Nessun bambino in questa classe.</p>
                ) : (
                  <ul className="divide-y divide-gold/20">
                    {children.map((child) => (
                      <li key={child.id} className="flex items-center justify-between py-2 text-sm">
                        <span>
                          <span className="font-medium">
                            {child.firstName} {child.lastName}
                          </span>
                          <span className="text-warmgray"> · {formatDob(child.dob)}</span>
                        </span>
                        <button
                          onClick={async () => {
                            if (confirm(`Rimuovere ${child.firstName} ${child.lastName}?`)) {
                              await removeChild(child.id)
                              onDataChange()
                            }
                          }}
                          className="text-warmgray hover:text-crimson transition-colors text-xs"
                        >
                          Rimuovi
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Operatori */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-warmgray">Operatori</h4>
                  <button
                    onClick={() => setShowAssign(true)}
                    className="text-sm text-crimson font-medium hover:underline"
                  >
                    Gestisci
                  </button>
                </div>
                {assignedNames.length === 0 ? (
                  <p className="text-sm text-warmgray">Nessun operatore assegnato.</p>
                ) : (
                  <p className="text-sm">{assignedNames.join(', ')}</p>
                )}
              </div>

              {/* Elimina classe */}
              <div className="pt-1">
                <button
                  onClick={() => {
                    if (confirm(`Eliminare la classe "${cls.name}"?`)) onRemoveClass(cls.id)
                  }}
                  className="text-xs text-crimson hover:underline"
                >
                  Elimina classe
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modale: aggiungi bambino */}
      <Modal open={showAddChild} title={`Aggiungi bambino · ${cls.name}`} onClose={() => setShowAddChild(false)}>
        <AddChildForm
          onSubmit={async (data) => {
            await addChild(data)
            onDataChange()
          }}
          onDone={() => setShowAddChild(false)}
        />
      </Modal>

      {/* Modale: gestisci operatori */}
      <Modal open={showAssign} title={`Operatori · ${cls.name}`} onClose={() => setShowAssign(false)}>
        <AssignOperatoreForm
          assignedIds={cls.operatorIds ?? []}
          onToggle={async (uid, assigned) => {
            await onToggleOperator(cls.id, uid, assigned)
            onDataChange()
          }}
        />
      </Modal>
    </div>
  )
}
