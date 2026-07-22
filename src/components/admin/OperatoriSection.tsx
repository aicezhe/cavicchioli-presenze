import { useOperators } from '../../hooks/useOperators'
import type { SchoolClass, WithId } from '../../types'

type OperatoriSectionProps = {
  classes: WithId<SchoolClass>[]
  /** Attiva/disattiva l'accesso di un operatore a una classe (aggiorna operatorIds) */
  onToggle: (classId: string, operatorUid: string, assigned: boolean) => Promise<void>
}

/**
 * Vista d'insieme sugli operatori della scuola: per ciascuno, le classi a cui ha
 * accesso, come multiselezione di chip. A differenza dell'assegnazione dentro la
 * singola classe, qui l'admin vede il quadro completo per operatore.
 */
export default function OperatoriSection({ classes, onToggle }: OperatoriSectionProps) {
  const operators = useOperators()

  return (
    <section className="space-y-4">
      <h2 className="font-serif text-xl font-semibold">Operatori</h2>

      {operators.length === 0 ? (
        <p className="text-sm text-warmgray">
          Nessun operatore. Gli account operatore vengono creati dalla scuola.
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
    </section>
  )
}
