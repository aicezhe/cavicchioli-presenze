import { useState } from 'react'
import type { FormEvent } from 'react'
import { useUsersByRole } from '../../hooks/useUsersByRole'
import { useProvisionUser } from '../../hooks/useProvisionUser'
import { useUserAdmin } from '../../hooks/useUserAdmin'
import Modal from './Modal'
import AddUserForm from './AddUserForm'
import type { ChildWithClass } from '../../hooks/useAllChildren'
import type { UserProfile, WithId } from '../../types'

type GenitoriSectionProps = {
  childrenList: ChildWithClass[]
  setParentLink: (
    classId: string,
    childId: string,
    email: string,
    parentUid: string | undefined,
    link: boolean,
  ) => Promise<void>
}

const sameEmail = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()

/**
 * Vista d'insieme sui genitori: a quali bambini sono collegati (via parentEmails).
 * L'admin può creare un genitore, verificare e correggere il collegamento genitore-bambino.
 * I bambini arrivano dal dashboard (condivisi con la ricerca) per evitare listener doppi.
 */
export default function GenitoriSection({ childrenList, setParentLink }: GenitoriSectionProps) {
  const parents = useUsersByRole('genitore')
  const { provisionUser } = useProvisionUser()
  const { updateUserName, deleteUserProfile } = useUserAdmin()
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<WithId<UserProfile> | null>(null)
  const [editName, setEditName] = useState('')

  const childrenOf = (email: string): ChildWithClass[] =>
    childrenList.filter((c) => (c.parentEmails ?? []).some((pe) => sameEmail(pe, email)))

  function openEdit(parent: WithId<UserProfile>) {
    setEditName(parent.name)
    setEditing(parent)
  }

  async function saveEdit(e: FormEvent) {
    e.preventDefault()
    if (!editing || !editName.trim() || editName.trim() === editing.name) {
      setEditing(null)
      return
    }
    await updateUserName(editing.id, editName)
    setEditing(null)
  }

  // Elimina il genitore: prima lo scollega da tutti i bambini, poi rimuove il profilo.
  async function deleteParent(parent: WithId<UserProfile>) {
    const linked = childrenOf(parent.email)
    if (!confirm(`Eliminare il genitore ${parent.name}? Verrà scollegato da ${linked.length} bambino/i.`)) {
      return
    }
    for (const child of linked) {
      await setParentLink(child.classId, child.id, parent.email, parent.id, false)
    }
    await deleteUserProfile(parent.id)
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-semibold">Genitori</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="rounded-lg bg-dustyblue px-4 py-2 text-sm text-cream font-medium hover:opacity-90 transition-opacity"
        >
          + Aggiungi genitore
        </button>
      </div>

      {parents.length === 0 ? (
        <p className="text-sm text-warmgray">
          Nessun genitore. Gli account genitore vengono creati dalla scuola.
        </p>
      ) : (
        <div className="space-y-3">
          {parents.map((parent) => {
            const linked = childrenOf(parent.email)
            const linkedIds = new Set(linked.map((c) => c.id))
            const available = childrenList.filter((c) => !linkedIds.has(c.id))

            return (
              <div key={parent.id} className="bg-white rounded-xl border border-dustyblue/40 px-5 py-4">
                <div className="flex flex-wrap items-center gap-x-2">
                  <span className="font-medium">{parent.name}</span>
                  <span className="text-sm text-warmgray">{parent.email}</span>
                  <span className="ml-auto flex items-center gap-3">
                    <button
                      onClick={() => openEdit(parent)}
                      className="text-sm text-dustyblue font-medium hover:underline"
                    >
                      Modifica
                    </button>
                    <button
                      onClick={() => deleteParent(parent)}
                      className="text-sm text-warmgray hover:text-dustyblue transition-colors"
                    >
                      Elimina
                    </button>
                  </span>
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
                        className="inline-flex items-center gap-2 rounded-full bg-dustyblue/10 text-dustyblue px-3 py-1 text-sm"
                      >
                        {child.firstName} {child.lastName}
                        <span className="text-dustyblue/60">· {child.className}</span>
                        <button
                          onClick={() =>
                            setParentLink(child.classId, child.id, parent.email, parent.id, false)
                          }
                          aria-label="Scollega"
                          className="hover:text-dustyblue/70"
                          title="Scollega"
                        >
                          &times;
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Collega un bambino esistente a questo genitore.
                    Ogni bambino può avere due genitori: per mamma E papà, collega lo
                    stesso bambino a entrambi i profili. */}
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
                                 focus:outline-none focus:ring-2 focus:ring-dustyblue/60"
                    >
                      <option value="">+ Collega bambino…</option>
                      {available.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.firstName} {c.lastName} · {c.className}
                        </option>
                      ))}
                    </select>
                    <span className="mt-1 block text-xs text-warmgray">
                      Per mamma e papà: collega lo stesso bambino a entrambi i genitori.
                    </span>
                  </label>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Modal open={showAdd} title="Nuovo genitore" onClose={() => setShowAdd(false)}>
        <AddUserForm
          submitLabel="Crea genitore"
          onSubmit={async (name, email, password) => {
            await provisionUser('genitore', name, email, password)
          }}
          onDone={() => setShowAdd(false)}
        />
      </Modal>

      <Modal
        open={editing !== null}
        title={`Modifica genitore${editing ? ` · ${editing.name}` : ''}`}
        onClose={() => setEditing(null)}
      >
        <form onSubmit={saveEdit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Nome e cognome</span>
            <input
              required
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-warmgray/40 bg-white px-3 py-2.5
                         focus:outline-none focus:ring-2 focus:ring-dustyblue/60 focus:border-dustyblue"
            />
          </label>
          <p className="text-xs text-warmgray">L'email non è modificabile da qui.</p>
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-dustyblue px-4 py-2.5 text-cream font-medium hover:opacity-90 transition-opacity"
            >
              Salva
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-lg border border-warmgray/40 px-4 py-2.5 font-medium hover:bg-white transition-colors"
            >
              Annulla
            </button>
          </div>
        </form>
      </Modal>
    </section>
  )
}
