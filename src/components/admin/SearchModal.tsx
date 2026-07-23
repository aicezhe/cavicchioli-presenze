import { useMemo, useState } from 'react'
import Modal from './Modal'
import type { ChildWithClass } from '../../hooks/useAllChildren'
import type { SchoolClass, WithId } from '../../types'

type SearchModalProps = {
  open: boolean
  onClose: () => void
  classes: WithId<SchoolClass>[]
  children: ChildWithClass[]
  /** Vai a una classe (apre la scheda Classi ed espande la classe indicata) */
  onGoToClass: (classId: string) => void
}

const norm = (s: string) => s.trim().toLowerCase()

/** Ricerca rapida di una classe o di un bambino. Filtra i dati già caricati. */
export default function SearchModal({ open, onClose, classes, children, onGoToClass }: SearchModalProps) {
  const [q, setQ] = useState('')
  const query = norm(q)

  const classMatches = useMemo(
    () => (query ? classes.filter((c) => norm(c.name).includes(query)) : []),
    [query, classes],
  )
  const childMatches = useMemo(
    () =>
      query
        ? children.filter((c) =>
            norm(`${c.firstName} ${c.lastName}`).includes(query) ||
            norm(`${c.lastName} ${c.firstName}`).includes(query),
          )
        : [],
    [query, children],
  )

  function goClass(classId: string) {
    onGoToClass(classId)
    setQ('')
    onClose()
  }

  return (
    <Modal
      open={open}
      title="Cerca"
      onClose={() => {
        setQ('')
        onClose()
      }}
    >
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Nome di una classe o di un bambino…"
        className="w-full rounded-lg border border-warmgray/40 bg-white px-3 py-2.5
                   focus:outline-none focus:ring-2 focus:ring-crimson/60 focus:border-crimson"
      />

      {query && classMatches.length === 0 && childMatches.length === 0 && (
        <p className="mt-4 text-sm text-warmgray">Nessun risultato.</p>
      )}

      {classMatches.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-warmgray">Classi</p>
          <ul className="mt-1">
            {classMatches.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => goClass(c.id)}
                  className="w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-cream transition-colors"
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {childMatches.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-warmgray">Bambini</p>
          <ul className="mt-1">
            {childMatches.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => goClass(c.classId)}
                  className="w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-cream transition-colors"
                >
                  {c.lastName} {c.firstName}
                  <span className="text-warmgray"> · {c.className}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
  )
}
