import { DEFAULT_SCHOOL_COLOR } from '../../types'
import type { OperatoreClass } from '../../hooks/useOperatoreClasses'

type ClassSwitcherProps = {
  classes: OperatoreClass[]
  activeId: string
  onSelect: (classId: string) => void
  /** Colore della scuola per la tab attiva. Default: dusty-blue */
  color?: string
}

/** Selettore di classe (solo quando l'operatore ne ha più di una): tab scorrevoli. */
export default function ClassSwitcher({ classes, activeId, onSelect, color = DEFAULT_SCHOOL_COLOR }: ClassSwitcherProps) {
  return (
    <div className="border-b border-black/10 overflow-x-auto">
      <nav className="flex gap-1 min-w-max">
        {classes.map((cls) => {
          const active = activeId === cls.id
          return (
            <button
              key={cls.id}
              onClick={() => onSelect(cls.id)}
              style={active ? { borderBottomColor: color, color } : undefined}
              className={
                'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ' +
                (active ? '' : 'border-transparent text-warmgray hover:text-ink')
              }
            >
              {cls.name}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
