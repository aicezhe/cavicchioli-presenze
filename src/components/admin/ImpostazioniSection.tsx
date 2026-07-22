import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { collection, documentId, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import type { School, UserProfile, WithId } from '../../types'

type ImpostazioniSectionProps = {
  school: WithId<School>
  updateSchoolName: (schoolId: string, name: string) => Promise<void>
}

/** Sezione "Impostazioni": nome scuola (modificabile) ed elenco email degli amministratori. */
export default function ImpostazioniSection({ school, updateSchoolName }: ImpostazioniSectionProps) {
  const [name, setName] = useState(school.name)
  const [saved, setSaved] = useState(false)
  const [adminEmails, setAdminEmails] = useState<string[]>([])

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
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-gold/40 p-5">
        <label className="block">
          <span className="text-sm font-medium">Nome della scuola</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-warmgray/40 bg-cream/50 px-3 py-2.5
                       focus:outline-none focus:ring-2 focus:ring-crimson/60 focus:border-crimson"
          />
        </label>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="submit"
            disabled={!name.trim() || name.trim() === school.name}
            className="rounded-lg bg-crimson px-4 py-2 text-sm text-cream font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            Salva
          </button>
          {saved && <span className="text-sm text-crimson">Salvato ✓</span>}
        </div>
      </form>

      {/* Amministratori */}
      <div className="bg-white rounded-xl border border-gold/40 p-5">
        <p className="text-sm font-medium">Amministratori della scuola</p>
        <p className="text-xs text-warmgray mt-0.5">
          Gli account amministratore vengono gestiti dalla scuola (nessun invito via email).
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
    </section>
  )
}
