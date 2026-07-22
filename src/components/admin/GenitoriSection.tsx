import { useUsersByRole } from '../../hooks/useUsersByRole'
import { useAllChildren } from '../../hooks/useAllChildren'
import type { ChildWithClass } from '../../hooks/useAllChildren'
import type { SchoolClass, WithId } from '../../types'

type GenitoriSectionProps = {
  schoolId: string
  classes: WithId<SchoolClass>[]
}

const sameEmail = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()

/**
 * Vista d'insieme sui genitori: a quali bambini sono collegati (via parentEmails).
 * L'admin può verificare e correggere il collegamento genitore-bambino.
 */
export default function GenitoriSection({ schoolId, classes }: GenitoriSectionProps) {
  const parents = useUsersByRole('genitore')
  const { children, setParentLink } = useAllChildren(schoolId, classes)

  const childrenOf = (email: string): ChildWithClass[] =>
    children.filter((c) => (c.parentEmails ?? []).some((pe) => sameEmail(pe, email)))

  return (
    <section className="space-y-4">
      <h2 className="font-serif text-xl font-semibold">Genitori</h2>

      {parents.length === 0 ? (
        <p className="text-sm text-warmgray">
          Nessun genitore. Gli account genitore vengono creati dalla scuola.
        </p>
      ) : (
        <div className="space-y-3">
          {parents.map((parent) => {
            const linked = childrenOf(parent.email)
            const linkedIds = new Set(linked.map((c) => c.id))
            const available = children.filter((c) => !linkedIds.has(c.id))

            return (
              <div key={parent.id} className="bg-white rounded-xl border border-gold/40 px-5 py-4">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-medium">{parent.name}</span>
                  <span className="text-sm text-warmgray">{parent.email}</span>
                </div>

                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-warmgray">
                  Bambini collegati
                </p>
                {linked.length === 0 ? (
                  <p className="mt-1 text-sm text-warmgray">Nessun bambino collegato.</p>
                ) : (
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {linked.map((child) => (
                      <li
                        key={child.id}
                        className="inline-flex items-center gap-2 rounded-full bg-crimson/10 text-crimson px-3 py-1 text-sm"
                      >
                        {child.firstName} {child.lastName}
                        <span className="text-crimson/60">· {child.className}</span>
                        <button
                          onClick={() =>
                            setParentLink(child.classId, child.id, parent.email, parent.id, false)
                          }
                          aria-label="Scollega"
                          className="hover:text-crimson/70"
                          title="Scollega"
                        >
                          &times;
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Collega un bambino esistente a questo genitore */}
                {available.length > 0 && (
                  <label className="mt-3 block">
                    <span className="sr-only">Collega bambino</span>
                    <select
                      value=""
                      onChange={(e) => {
                        const child = available.find((c) => c.id === e.target.value)
                        if (child) setParentLink(child.classId, child.id, parent.email, parent.id, true)
                      }}
                      className="w-full sm:w-auto rounded-lg border border-warmgray/40 bg-cream/50 px-3 py-2 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-crimson/60"
                    >
                      <option value="">+ Collega bambino…</option>
                      {available.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.firstName} {c.lastName} · {c.className}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
