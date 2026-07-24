import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useMySchools } from '../../hooks/useSchools'
import { useOperators } from '../../hooks/useOperators'
import { useUsersByRole } from '../../hooks/useUsersByRole'
import { useUserAdmin } from '../../hooks/useUserAdmin'
import AppHeader from '../../components/AppHeader'
import { PlatformCrest } from '../../components/PlatformCrest'
import Crest from '../../components/Crest'
import NewSchoolForm from '../../components/admin/NewSchoolForm'
import { schoolColor, schoolInitials } from '../../types'
import type { UserProfile, WithId } from '../../types'

/**
 * Impostazioni dell'amministratore (rotta /admin/settings, dal menu hamburger).
 * Ridotta a due sole capacità:
 *  1. Scuola — nome, colore ed emblema della scuola attiva.
 *  2. Password — invio reset a sé / operatori / genitori, protetto da una chiave (PIN)
 *     personale dell'admin (salvata su users/{uid}, leggibile solo dall'admin).
 */
export default function AdminSettings() {
  const { user, profile, refreshProfile } = useAuth()
  const { schools, loading, updateSchool } = useMySchools(user?.uid)
  const [params, setParams] = useSearchParams()

  const paramId = params.get('school')
  const school = schools.find((s) => s.id === paramId) ?? schools[0] ?? null

  if (loading || !profile || !user) {
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
        <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-warmgray hover:text-dustyblue transition-colors">
          &larr; Torna alla dashboard
        </Link>

        <div>
          <h1 className="font-serif text-2xl font-semibold">Impostazioni</h1>
          <p className="mt-1 text-sm text-warmgray">Dati della scuola e gestione password.</p>
        </div>

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
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <Crest size={40} variant="compact" color={schoolColor(school)} initials={schoolInitials(school)} />
              <h2 className="font-serif text-xl font-semibold">{school.name}</h2>
            </div>
            <div className="bg-white rounded-xl border border-dustyblue/40 p-5">
              <NewSchoolForm
                key={school.id}
                initial={{
                  name: school.name,
                  primaryColor: schoolColor(school),
                  emblemInitials: school.emblemInitials,
                }}
                submitLabel="Salva modifiche"
                savedLabel="Salvato ✓"
                onSubmit={(data) => updateSchool(school.id, data)}
              />
            </div>
          </section>
        )}

        <PasswordSection
          adminUid={user.uid}
          adminEmail={profile.email}
          savedPin={profile.securityPin}
          refreshProfile={refreshProfile}
        />
      </main>
    </div>
  )
}

/* --------------------------------- Password --------------------------------- */

// Chiave predefinita: si sblocca subito digitandola, senza doverla prima impostare.
// L'admin può comunque sostituirla con una chiave personale ("Cambia chiave").
const DEFAULT_ADMIN_PIN = '0101'

function PasswordSection({
  adminUid,
  adminEmail,
  savedPin,
  refreshProfile,
}: {
  adminUid: string
  adminEmail: string
  savedPin?: string
  refreshProfile: () => Promise<void>
}) {
  const operators = useOperators()
  const parents = useUsersByRole('genitore')
  const { sendPasswordReset, setSecurityPin } = useUserAdmin()

  const [unlocked, setUnlocked] = useState(false)
  const [changingPin, setChangingPin] = useState(false)

  // Chiave attesa: quella personalizzata dell'admin oppure quella predefinita (0101)
  const expectedPin = savedPin || DEFAULT_ADMIN_PIN

  return (
    <section className="space-y-4">
      <h2 className="font-serif text-xl font-semibold">Password</h2>

      {!unlocked ? (
        // Sempre lo stesso passo: inserisci il PIN per sbloccare i cambi password.
        // Se non ne hai impostato uno tuo, vale la chiave predefinita 0101.
        <UnlockCard
          expected={expectedPin}
          usingDefault={!savedPin}
          onUnlock={() => setUnlocked(true)}
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-dustyblue">Sbloccato ✓</p>
            <button onClick={() => setChangingPin((v) => !v)} className="text-sm text-warmgray hover:text-dustyblue transition-colors">
              {changingPin ? 'Annulla' : 'Cambia chiave'}
            </button>
          </div>

          {changingPin && (
            <SetPinCard
              title="Nuova chiave di sicurezza"
              hint="Sostituisce la chiave attuale."
              onSave={async (pin) => {
                await setSecurityPin(adminUid, pin)
                await refreshProfile()
                setChangingPin(false)
              }}
            />
          )}

          <ResetGroup title="Il tuo account" people={[{ id: adminUid, name: 'Tu (amministratore)', email: adminEmail }]} onReset={sendPasswordReset} />
          <ResetGroup title="Operatori" people={operators} onReset={sendPasswordReset} />
          <ResetGroup title="Genitori" people={parents} onReset={sendPasswordReset} />
        </>
      )}
    </section>
  )
}

function SetPinCard({ title, hint, onSave }: { title: string; hint: string; onSave: (pin: string) => Promise<void> }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (pin.trim().length < 4) {
      setError('Almeno 4 caratteri.')
      return
    }
    setError(null)
    setSaving(true)
    try {
      await onSave(pin.trim())
      setPin('')
    } catch (err) {
      console.error(err)
      setError('Impossibile salvare. Riprova.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-xl border border-dustyblue/40 p-5 space-y-3">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-warmgray mt-0.5">{hint}</p>
      </div>
      <input
        type="password"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        placeholder="Chiave (min. 4 caratteri)"
        className="w-full sm:w-64 rounded-lg border border-warmgray/40 bg-cream/50 px-3 py-2.5
                   focus:outline-none focus:ring-2 focus:ring-dustyblue/60 focus:border-dustyblue"
      />
      {error && <p className="text-sm text-dustyblue">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-dustyblue px-4 py-2 text-sm text-cream font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
      >
        {saving ? 'Salvataggio…' : 'Salva chiave'}
      </button>
    </form>
  )
}

function UnlockCard({ expected, usingDefault, onUnlock }: { expected: string; usingDefault: boolean; onUnlock: () => void }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)

  function submit(e: FormEvent) {
    e.preventDefault()
    if (pin === expected) {
      onUnlock()
    } else {
      setError('Chiave errata.')
    }
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-xl border border-dustyblue/40 p-5 space-y-3">
      <div>
        <p className="text-sm font-medium">Chiave di sicurezza</p>
        <p className="text-xs text-warmgray mt-0.5">
          Inseriscila per sbloccare i cambi password di operatori e genitori.
          {usingDefault && <span className="block">Chiave predefinita: <span className="font-mono font-semibold text-ink">0101</span>.</span>}
        </p>
      </div>
      <input
        type="password"
        autoFocus
        value={pin}
        onChange={(e) => { setPin(e.target.value); setError(null) }}
        placeholder="Chiave"
        className="w-full sm:w-64 rounded-lg border border-warmgray/40 bg-cream/50 px-3 py-2.5
                   focus:outline-none focus:ring-2 focus:ring-dustyblue/60 focus:border-dustyblue"
      />
      {error && <p className="text-sm text-dustyblue">{error}</p>}
      <button
        type="submit"
        className="rounded-lg bg-dustyblue px-4 py-2 text-sm text-cream font-medium hover:opacity-90 transition-opacity"
      >
        Sblocca
      </button>
    </form>
  )
}

function ResetGroup({
  title,
  people,
  onReset,
}: {
  title: string
  people: (WithId<UserProfile> | { id: string; name: string; email: string })[]
  onReset: (email: string) => Promise<void>
}) {
  const [sent, setSent] = useState<Record<string, boolean>>({})
  const [busy, setBusy] = useState<string | null>(null)

  async function reset(id: string, email: string) {
    setBusy(id)
    try {
      await onReset(email)
      setSent((s) => ({ ...s, [id]: true }))
    } catch (err) {
      console.error('Reset non riuscito:', err)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-dustyblue/40 p-5">
      <p className="text-sm font-medium">{title}</p>
      {people.length === 0 ? (
        <p className="mt-2 text-sm text-warmgray">Nessuno.</p>
      ) : (
        <ul className="mt-2 divide-y divide-black/5">
          {people.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span className="min-w-0">
                <span className="font-medium">{p.name}</span>
                <span className="text-warmgray"> · {p.email}</span>
              </span>
              {sent[p.id] ? (
                <span className="text-dustyblue shrink-0">Email inviata ✓</span>
              ) : (
                <button
                  onClick={() => reset(p.id, p.email)}
                  disabled={busy === p.id}
                  className="shrink-0 rounded-lg border border-dustyblue px-3 py-1.5 text-dustyblue font-medium hover:bg-dustyblue/10 transition-colors disabled:opacity-40"
                >
                  {busy === p.id ? 'Invio…' : 'Invia reset'}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
