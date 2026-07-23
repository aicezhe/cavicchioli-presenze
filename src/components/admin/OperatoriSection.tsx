import { useState } from 'react'
import { useOperators } from '../../hooks/useOperators'
import { useProvisionUser } from '../../hooks/useProvisionUser'
import Modal from './Modal'
import AddUserForm from './AddUserForm'
import type { SchoolClass, WithId } from '../../types'

type OperatoriSectionProps = {
  classes: WithId<SchoolClass>[]
  /** Attiva/disattiva l'accesso di un operatore a una classe (aggiorna operatorIds) */
  onToggle: (classId: string, operatorUid: string, assigned: boolean) => Promise<void>
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

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-semibold">Operatori</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="rounded-lg bg-dustyblue px-4 py-2 text-sm text-cream font-medium hover:opacity-90 transition-opacity"
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
            <div key={op.id} className="bg-white rounded-xl border border-dustyblue/40 px-5 py-4">
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
                            ? 'bg-dustyblue text-cream'
                            : 'border border-dustyblue text-ink hover:bg-dustyblue/10')
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

      <Modal open={showAdd} title="Nuovo operatore" onClose={() => setShowAdd(false)}>
        <AddUserForm
          submitLabel="Crea operatore"
          withPhone
          onSubmit={async (name, email, password, phone) => {
            await provisionUser('operatore', name, email, password, phone)
          }}
          onDone={() => setShowAdd(false)}
        />
      </Modal>
    </section>
  )
}
