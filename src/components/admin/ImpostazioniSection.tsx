import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { collection, documentId, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useProvisionUser } from '../../hooks/useProvisionUser'
import Modal from './Modal'
import AddUserForm from './AddUserForm'
import type { School, UserProfile, WithId } from '../../types'

type ImpostazioniSectionProps = {
  school: WithId<School>
  updateSchoolName: (schoolId: string, name: string) => Promise<void>
  addSchoolAdmin: (schoolId: string, uid: string) => Promise<void>
}

/** Sezione "Impostazioni": nome scuola, elenco/creazione degli amministratori. */
export default function ImpostazioniSection({
  school,
  updateSchoolName,
  addSchoolAdmin,
}: ImpostazioniSectionProps) {
  const { provisionUser } = useProvisionUser()
  const [name, setName] = useState(school.name)
  const [saved, setSaved] = useState(false)
  const [adminEmails, setAdminEmails] = useState<string[]>([])
  const [showAddAdmin, setShowAddAdmin] = useState(false)

  // Risolve gli uid in adminIds nelle rispettive email (solo lettura)
  useEffect(() => {
    const ids = school.adminIds ?? []
    if (ids.length === 0) {
      setAdminEmails([])
      return
    }
    // 'in' accetta fino a 30 valori: sufficiente per gli admin di una scuola
    getDocs(query(collection(db, 'users'), where(documentId(), 'in', ids.slice(0, 30))))
      .then((snap) => setAdminEmails(snap.docs.map((d) => (d.data() as UserProfile).email)))
      .catch((err) => console.error('Impossibile caricare gli admin:', err))
  }, [school.adminIds])

  // Crea l'account admin e lo aggiunge agli adminIds della scuola
  async function createAdmin(fullName: string, email: string, password: string) {
    const uid = await provisionUser('admin', fullName, email, password)
    if (uid) await addSchoolAdmin(school.id, uid)
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || name.trim() === school.name) return
    await updateSchoolName(school.id, name)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <section className="space-y-6 max-w-xl">
      <h2 className="font-serif text-xl font-semibold">Impostazioni</h2>

      {/* Nome della scuola */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-dustyblue/40 p-5">
        <label className="block">
          <span className="text-sm font-medium">Nome della scuola</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-warmgray/40 bg-cream/50 px-3 py-2.5
                       focus:outline-none focus:ring-2 focus:ring-dustyblue/60 focus:border-dustyblue"
          />
        </label>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="submit"
            disabled={!name.trim() || name.trim() === school.name}
            className="rounded-lg bg-dustyblue px-4 py-2 text-sm text-cream font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            Salva
          </button>
          {saved && <span className="text-sm text-dustyblue">Salvato ✓</span>}
        </div>
      </form>

      {/* Amministratori */}
      <div className="bg-white rounded-xl border border-dustyblue/40 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Amministratori della scuola</p>
          <button
            onClick={() => setShowAddAdmin(true)}
            className="text-sm text-dustyblue font-medium hover:underline"
          >
            + Aggiungi
          </button>
        </div>
        <p className="text-xs text-warmgray mt-0.5">
          Gli account amministratore vengono creati dalla scuola (nessun invito via email).
        </p>
        <ul className="mt-3 space-y-1">
          {adminEmails.length === 0 ? (
            <li className="text-sm text-warmgray">—</li>
          ) : (
            adminEmails.map((email) => (
              <li key={email} className="text-sm">
                {email}
              </li>
            ))
          )}
        </ul>
      </div>

      <Modal open={showAddAdmin} title="Nuovo amministratore" onClose={() => setShowAddAdmin(false)}>
        <AddUserForm
          submitLabel="Crea amministratore"
          onSubmit={createAdmin}
          onDone={() => setShowAddAdmin(false)}
        />
      </Modal>
    </section>
  )
}
