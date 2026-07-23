import type { ParentChild } from '../../hooks/useMyChildren'

type ChildSwitcherProps = {
  children: ParentChild[]
  activeId: string
  onSelect: (childId: string) => void
  /** Colore della scuola per la tab attiva. Default: dusty-blue */
  color?: string
}

/** Selettore del figlio (solo se il genitore ha più di un bambino): tab scorrevoli. */
export default function ChildSwitcher({ children, activeId, onSelect, color = '#6E859C' }: ChildSwitcherProps) {
  return (
    <div className="border-b border-black/10 overflow-x-auto">
      <nav className="flex gap-1 min-w-max">
        {children.map((c) => {
          const active = activeId === c.id
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              style={active ? { borderBottomColor: color, color } : undefined}
              className={
                'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ' +
                (active ? '' : 'border-transparent text-warmgray hover:text-ink')
              }
            >
              {c.firstName} {c.lastName}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
