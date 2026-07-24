import { useEffect, useMemo, useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import { useOperatoreClasses } from '../../hooks/useOperatoreClasses'
import { useSchools, useSchoolTheme } from '../../hooks/useSchools'
import AppHeader from '../../components/AppHeader'
import Crest from '../../components/Crest'
import SessionSwitch from '../../components/SessionSwitch'
import ClassSwitcher from '../../components/operatore/ClassSwitcher'
import AppelloList from '../../components/operatore/AppelloList'
import type { School, Session, WithId } from '../../types'

export default function OperatoreDashboard() {
  const { user, profile } = useAuth()
  const { classes, loading } = useOperatoreClasses(user?.uid)
  const { schools: allSchools } = useSchools()
  const [session, setSession] = useState<Session>('morning')

  // Un operatore può lavorare in PIÙ scuole: ricaviamo le scuole dalle classi assegnate.
  const schoolIds = useMemo(() => Array.from(new Set(classes.map((c) => c.schoolId))), [classes])
  const [activeSchoolId, setActiveSchoolId] = useState<string | null>(null)
  useEffect(() => {
    if (schoolIds.length === 0) setActiveSchoolId(null)
    else if (!activeSchoolId || !schoolIds.includes(activeSchoolId)) setActiveSchoolId(schoolIds[0])
  }, [schoolIds, activeSchoolId])

  // Classi della SOLA scuola attiva (le tab classe non mescolano più scuole diverse)
  const schoolClasses = useMemo(
    () => classes.filter((c) => c.schoolId === activeSchoolId),
    [classes, activeSchoolId],
  )
  const [activeId, setActiveId] = useState<string | null>(null)
  useEffect(() => {
    if (schoolClasses.length === 0) setActiveId(null)
    else if (!activeId || !schoolClasses.some((c) => c.id === activeId)) setActiveId(schoolClasses[0].id)
  }, [schoolClasses, activeId])

  const active = schoolClasses.find((c) => c.id === activeId)
  const { school, color, initials } = useSchoolTheme(activeSchoolId ?? undefined)

  // Le scuole dell'operatore (con nome/colore) per il selettore in alto
  const mySchools = useMemo(
    () =>
      schoolIds
        .map((id) => allSchools.find((s) => s.id === id))
        .filter((s): s is WithId<School> => Boolean(s)),
    [schoolIds, allSchools],
  )

  // Contenuto del menu hamburger: profilo + logout
  const headerMenu = (close: () => void) => (
    <>
      <div className="px-4 py-2 border-b border-black/10">
        <p className="text-sm font-medium">{profile?.name}</p>
        <p className="text-xs text-warmgray truncate">{profile?.email}</p>
      </div>
      <button
        onClick={() => {
          close()
          signOut(auth)
        }}
        className="w-full text-left px-4 py-2 text-sm text-ink hover:bg-cream transition-colors"
      >
        Esci
      </button>
    </>
  )

  const headerEmblem = school ? (
    <Crest size={40} variant="compact" color={color} initials={initials} />
  ) : undefined

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader tools menu={headerMenu} emblem={headerEmblem} title={school?.name} bgColor={school ? color : undefined} />

      <main className="flex-1 mx-auto max-w-2xl w-full px-4 py-8 space-y-6">
        {/* Selettore scuola: compare solo se l'operatore lavora in più di una scuola */}
        {mySchools.length > 1 && (
          <label className="block">
            <span className="text-sm font-medium">Scuola</span>
            <select
              value={activeSchoolId ?? ''}
              onChange={(e) => setActiveSchoolId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-warmgray/40 bg-white px-3 py-2.5 font-serif font-semibold
                         focus:outline-none focus:ring-2 focus:ring-black/20"
            >
              {mySchools.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
        )}

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl font-semibold">Appello</h1>
            <p className="text-sm text-warmgray">Registro presenze pre/post-scuola</p>
          </div>
          {/* Sessione: mattina (pre-scuola) o pomeriggio (post-scuola) */}
          {schoolClasses.length > 0 && <SessionSwitch value={session} onChange={setSession} color={color} />}
        </div>

        {loading ? (
          <p className="text-sm text-warmgray animate-pulse">Caricamento…</p>
        ) : classes.length === 0 ? (
          <div className="rounded-xl border border-dustyblue/50 bg-dustyblue/10 px-4 py-3">
            <p className="font-medium">Nessuna classe assegnata</p>
            <p className="mt-1 text-sm text-warmgray">
              Non sei ancora assegnato a nessuna classe. Contatta l&apos;amministrazione della scuola.
            </p>
          </div>
        ) : (
          <>
            {/* Selettore di classe (solo se la scuola attiva ha più di una classe) */}
            {schoolClasses.length > 1 && activeId && (
              <ClassSwitcher classes={schoolClasses} activeId={activeId} onSelect={setActiveId} color={color} />
            )}
            {active && user && (
              <AppelloList
                schoolId={active.schoolId}
                classId={active.id}
                operatoreUid={user.uid}
                session={session}
                color={color}
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}
