import type { OperatoreClass } from '../../hooks/useOperatoreClasses'

type ClassSwitcherProps = {
  classes: OperatoreClass[]
  activeId: string
  onSelect: (classId: string) => void
}

/** Selettore di classe (solo quando l'operatore ne ha più di una): tab scorrevoli. */
export default function ClassSwitcher({ classes, activeId, onSelect }: ClassSwitcherProps) {
  return (
    <div className="border-b border-gold/30 overflow-x-auto">
      <nav className="flex gap-1 min-w-max">
        {classes.map((cls) => (
          <button
            key={cls.id}
            onClick={() => onSelect(cls.id)}
            className={
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ' +
              (activeId === cls.id
                ? 'border-crimson text-crimson'
                : 'border-transparent text-warmgray hover:text-ink')
            }
          >
            {cls.name}
          </button>
        ))}
      </nav>
    </div>
  )
}
