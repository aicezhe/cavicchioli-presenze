import type { ParentChild } from '../../hooks/useMyChildren'

type ChildSwitcherProps = {
  children: ParentChild[]
  activeId: string
  onSelect: (childId: string) => void
}

/** Selettore del figlio (solo se il genitore ha più di un bambino): tab scorrevoli. */
export default function ChildSwitcher({ children, activeId, onSelect }: ChildSwitcherProps) {
  return (
    <div className="border-b border-gold/30 overflow-x-auto">
      <nav className="flex gap-1 min-w-max">
        {children.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ' +
              (activeId === c.id
                ? 'border-crimson text-crimson'
                : 'border-transparent text-warmgray hover:text-ink')
            }
          >
            {c.firstName} {c.lastName}
          </button>
        ))}
      </nav>
    </div>
  )
}
