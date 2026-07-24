import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { sendPasswordResetEmail, signOut } from 'firebase/auth'
import { collection, doc, documentId, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { auth, db } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import { useMySchools } from '../../hooks/useSchools'
import { useClasses } from '../../hooks/useClasses'
import { useOperators } from '../../hooks/useOperators'
import AppHeader from '../../components/AppHeader'
import { PlatformCrest } from '../../components/PlatformCrest'
import Crest from '../../components/Crest'
import NewSchoolForm from '../../components/admin/NewSchoolForm'
import { schoolColor, schoolInitials } from '../../types'
import type { UserProfile } from '../../types'

// Ancore per la navigazione rapida (solo desktop): sezioni impilate, scroll fluido.
const SECTIONS = [
  { id: 'scuola', label: 'Scuola' },
  { id: 'profilo', label: 'Profilo' },
  { id: 'sicurezza', label: 'Sicurezza e ruoli' },
] as const

/**
 * Schermata Impostazioni dell'amministratore (rotta separata /admin/settings).
 * Sezioni impilate (mobile: scroll; desktop: barra di ancore in alto):
 * Scuola (dati della scuola attiva) · Profilo (utente) · Sicurezza e ruoli (trasparenza).
 * La scuola attiva arriva come ?school=<id> dalla dashboard; fallback alla prima.
 */
export default function AdminSettings() {
  const navigate = useNavigate()
  const { user, profile, refreshProfile } = useAuth()
  const { schools, loading, updateSchool } = useMySchools(user?.uid)
  const [params, setParams] = useSearchParams()

  // Scuola attiva: id da query param, con fallback alla prima scuola gestita
  const paramId = params.get('school')
  const school = schools.find((s) => s.id === paramId) ?? schools[0] ?? null

  const { classes } = useClasses(school?.id)
  const operators = useOperators()

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppHeader emblem={<PlatformCrest variant="icon" size={30} />} title="NOTA" />
        <p className="flex-1 grid place-items-center text-sm text-warmgray animate-pulse">Caricamento…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader emblem={<PlatformCrest variant="icon" size={30} />} title="NOTA" />

      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-8 space-y-8">
        {/* Torna alla dashboard */}
        <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-warmgray hover:text-dustyblue transition-colors">
          &larr; Torna alla dashboard
        </Link>

        <div>
          <h1 className="font-serif text-2xl font-semibold">Impostazioni</h1>
          <p className="mt-1 text-sm text-warmgray">Scuola, profilo e trasparenza dei ruoli.</p>
        </div>

        {/* Navigazione rapida (solo desktop) */}
        <nav className="hidden md:flex gap-1 border-b border-black/10">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="px-4 py-2 text-sm font-medium text-warmgray hover:text-dustyblue border-b-2 border-transparent hover:border-dustyblue -mb-px transition-colors"
            >
              {s.label}
            </a>
          ))}
        </nav>

        {/* Selettore scuola se l'admin ne gestisce più d'una */}
        {schools.length > 1 && (
          <label className="block">
            <span className="text-sm font-medium">Scuola da configurare</span>
            <select
              value={school?.id ?? ''}
              onChange={(e) => setParams({ school: e.target.value })}
              className="mt-1 w-full rounded-lg border border-warmgray/40 bg-white px-3 py-2.5
                         focus:outline-none focus:ring-2 focus:ring-dustyblue/60 focus:border-dustyblue"
            >
              {schools.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
        )}

        {school && (
          <SchoolSection
            key={school.id}
            schoolName={school.name}
            initial={{
              name: school.name,
              primaryColor: schoolColor(school),
              emblemInitials: school.emblemInitials,
            }}
            initials={schoolInitials(school)}
            color={schoolColor(school)}
            adminIds={school.adminIds ?? []}
            onSave={(data) => updateSchool(school.id, data)}
          />
        )}

        {profile && (
          <ProfileSection profile={profile} uid={user!.uid} refreshProfile={refreshProfile} />
        )}

        <SecuritySection
          operators={operators.map((op) => ({
            id: op.id,
            name: op.name,
            classCount: classes.filter((c) => c.operatorIds?.includes(op.id)).length,
          }))}
          onGoToOperators={() => navigate('/admin', { state: { tab: 'operatori' } })}
        />

        {/* Esci, anche qui (non solo nell'intestazione) */}
        <section className="bg-white rounded-xl border border-dustyblue/40 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Sessione</p>
            <p className="text-xs text-warmgray">Esci dal pannello amministratore.</p>
          </div>
          <button
            onClick={() => signOut(auth)}
            className="rounded-lg border border-dustyblue px-4 py-2 text-sm text-dustyblue font-medium hover:bg-dustyblue/10 transition-colors"
          >
            Esci
          </button>
        </section>
      </main>
    </div>
  )
}

/* ---------------------------------- Scuola ---------------------------------- */

type SchoolSectionProps = {
  schoolName: string
  initial: { name: string; primaryColor?: string; emblemInitials?: string }
  initials: string
  color: string
  adminIds: string[]
  onSave: (data: { name: string; primaryColor?: string; emblemInitials?: string }) => Promise<void>
}

function SchoolSection({ schoolName, initial, initials, color, adminIds, onSave }: SchoolSectionProps) {
  const [adminEmails, setAdminEmails] = useState<string[]>([])

  // Risolve gli uid degli admin nelle rispettive email (solo lettura)
  useEffect(() => {
    if (adminIds.length === 0) {
      setAdminEmails([])
      return
    }
    // 'in' accetta fino a 30 valori: sufficiente per gli admin di una scuola
    getDocs(query(collection(db, 'users'), where(documentId(), 'in', adminIds.slice(0, 30))))
      .then((snap) => setAdminEmails(snap.docs.map((d) => (d.data() as UserProfile).email)))
      .catch((err) => console.error('Impossibile caricare gli admin:', err))
  }, [adminIds])

  return (
    <section id="scuola" className="scroll-mt-6 space-y-4">
      <div className="flex items-center gap-3">
        <Crest size={40} variant="compact" color={color} initials={initials} />
        <h2 className="font-serif text-xl font-semibold">{schoolName}</h2>
      </div>

      {/* Nome + colore + iniziali, con anteprima: riuso del form della scuola */}
      <div className="bg-white rounded-xl border border-dustyblue/40 p-5">
        <NewSchoolForm
          initial={initial}
          submitLabel="Salva modifiche"
          savedLabel="Salvato ✓"
          onSubmit={onSave}
        />
      </div>

      {/* Amministratori (solo lettura) */}
      <div className="bg-white rounded-xl border border-dustyblue/40 p-5">
        <p className="text-sm font-medium">Amministratori della scuola</p>
        <p className="text-xs text-warmgray mt-0.5">Elenco in sola lettura (nessun invito via email).</p>
        <ul className="mt-3 space-y-1">
          {adminEmails.length === 0 ? (
            <li className="text-sm text-warmgray">—</li>
          ) : (
            adminEmails.map((email) => (
              <li key={email} className="text-sm">{email}</li>
            ))
          )}
        </ul>
      </div>
    </section>
  )
}

/* ---------------------------------- Profilo --------------------------------- */

function ProfileSection({
  profile,
  uid,
  refreshProfile,
}: {
  profile: UserProfile
  uid: string
  refreshProfile: () => Promise<void>
}) {
  const [name, setName] = useState(profile.name ?? '')
  const [saved, setSaved] = useState(false)
  const [pwMsg, setPwMsg] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => setName(profile.name ?? ''), [profile.name])

  async function saveName() {
    const trimmed = name.trim()
    if (!trimmed || trimmed === profile.name) return
    setSaving(true)
    try {
      await updateDoc(doc(db, 'users', uid), { name: trimmed })
      await refreshProfile()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Impossibile salvare il nome:', err)
    } finally {
      setSaving(false)
    }
  }

  // Cambio password: email di reset (vedi commento in fondo al file per la scelta)
  async function changePassword() {
    setPwMsg(null)
    try {
      await sendPasswordResetEmail(auth, profile.email)
      setPwMsg(`Email di reset inviata a ${profile.email}.`)
    } catch (err) {
      console.error('Impossibile inviare il reset password:', err)
      setPwMsg('Invio non riuscito. Riprova più tardi.')
    }
  }

  return (
    <section id="profilo" className="scroll-mt-6 space-y-4">
      <h2 className="font-serif text-xl font-semibold">Profilo</h2>

      <div className="bg-white rounded-xl border border-dustyblue/40 p-5 space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Nome</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-warmgray/40 bg-cream/50 px-3 py-2.5
                       focus:outline-none focus:ring-2 focus:ring-dustyblue/60 focus:border-dustyblue"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input
            value={profile.email}
            readOnly
            className="mt-1 w-full rounded-lg border border-warmgray/30 bg-cream px-3 py-2.5 text-warmgray cursor-not-allowed"
          />
          <span className="mt-1 block text-xs text-warmgray">L'email di accesso non è modificabile da qui.</span>
        </label>

        <div className="flex items-center gap-3">
          <button
            onClick={saveName}
            disabled={saving || !name.trim() || name.trim() === profile.name}
            className="rounded-lg bg-dustyblue px-4 py-2 text-sm text-cream font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            Salva
          </button>
          {saved && <span className="text-sm text-dustyblue">Salvato ✓</span>}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-dustyblue/40 p-5">
        <p className="text-sm font-medium">Password</p>
        <p className="text-xs text-warmgray mt-0.5">
          Riceverai un'email con un link sicuro per impostare una nuova password.
        </p>
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <button
            onClick={changePassword}
            className="rounded-lg border border-dustyblue px-4 py-2 text-sm text-dustyblue font-medium hover:bg-dustyblue/10 transition-colors"
          >
            Cambia password
          </button>
          {pwMsg && <span className="text-sm text-dustyblue">{pwMsg}</span>}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------ Sicurezza e ruoli --------------------------- */

function SecuritySection({
  operators,
  onGoToOperators,
}: {
  operators: { id: string; name: string; classCount: number }[]
  onGoToOperators: () => void
}) {
  return (
    <section id="sicurezza" className="scroll-mt-6 space-y-4">
      <h2 className="font-serif text-xl font-semibold">Sicurezza e ruoli</h2>

      {/* Blocco descrittivo statico: come funziona la segregazione dei ruoli */}
      <div className="bg-white rounded-xl border border-dustyblue/40 p-5 space-y-3 text-sm leading-relaxed">
        <p>
          Ogni utente ha <strong>un solo ruolo</strong> salvato in <code className="text-xs">users/&#123;uid&#125;</code>:
          amministratore, operatore o genitore. Il ruolo determina cosa può leggere e scrivere — non è
          l'interfaccia a decidere i permessi, ma le <strong>regole di sicurezza di Firestore</strong> sul server.
        </p>
        <ul className="space-y-1.5 list-disc pl-5">
          <li><strong>Amministratore</strong> — gestisce le proprie scuole (è in <code className="text-xs">adminIds</code>): classi, operatori, bambini.</li>
          <li><strong>Operatore</strong> — vede e firma le presenze solo delle classi in cui è assegnato (<code className="text-xs">operatorIds</code>).</li>
          <li><strong>Genitore</strong> — vede solo i propri figli, collegati tramite l'email verificata (<code className="text-xs">parentEmails</code>).</li>
        </ul>
        <p className="text-warmgray">
          Anche se qualcuno modificasse l'app nel browser, le regole sul server rifiuterebbero l'accesso ai
          dati non di sua competenza: la separazione è garantita dal database, non dal client.
        </p>
      </div>

      {/* Operatori con numero di classi assegnate (gestione nella dashboard) */}
      <div className="bg-white rounded-xl border border-dustyblue/40 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Operatori della scuola</p>
          <button onClick={onGoToOperators} className="text-sm text-dustyblue font-medium hover:underline">
            Gestisci &rarr;
          </button>
        </div>
        <ul className="mt-3 divide-y divide-black/5">
          {operators.length === 0 ? (
            <li className="text-sm text-warmgray py-1">Nessun operatore.</li>
          ) : (
            operators.map((op) => (
              <li key={op.id} className="flex items-center justify-between py-2 text-sm">
                <span>{op.name}</span>
                <span className="text-warmgray">
                  {op.classCount} {op.classCount === 1 ? 'classe' : 'classi'}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  )
}
