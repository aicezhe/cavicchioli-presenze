import { useOperators } from '../../hooks/useOperators'

type AssignOperatoreFormProps = {
  /** uid degli operatori già assegnati alla classe */
  assignedIds: string[]
  onToggle: (operatorUid: string, assigned: boolean) => Promise<void>
}

/**
 * Elenco degli operatori registrati con un interruttore per assegnarli/rimuoverli dalla classe.
 * La sorgente è users con role 'operatore': si sceglie tra utenti esistenti, non si inventano email.
 */
export default function AssignOperatoreForm({ assignedIds, onToggle }: AssignOperatoreFormProps) {
  const operators = useOperators()

  if (operators.length === 0) {
    return (
      <p className="text-sm text-warmgray">
        Nessun operatore registrato. Gli operatori si registrano da soli e poi possono essere assegnati qui.
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {operators.map((op) => {
        const assigned = assignedIds.includes(op.id)
        return (
          <li key={op.id} className="flex items-center justify-between gap-3 text-sm">
            <span className="min-w-0">
              <span className="font-medium">{op.name}</span>
              <span className="text-warmgray"> · {op.email}</span>
            </span>
            <button
              onClick={() => onToggle(op.id, !assigned)}
              className={
                'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ' +
                (assigned
                  ? 'bg-crimson text-cream hover:opacity-90'
                  : 'border border-gold text-crimson hover:bg-gold/10')
              }
            >
              {assigned ? 'Rimuovi' : 'Assegna'}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
