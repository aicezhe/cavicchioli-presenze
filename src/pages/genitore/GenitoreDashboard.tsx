import { useEffect, useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import { useMyChildren } from '../../hooks/useMyChildren'
import { useChildAttendance } from '../../hooks/useChildAttendance'
import AppHeader from '../../components/AppHeader'
import SessionSwitch from '../../components/SessionSwitch'
import ChildSwitcher from '../../components/genitore/ChildSwitcher'
import AttendanceCalendar from '../../components/genitore/AttendanceCalendar'
import ContattiSection from '../../components/genitore/ContattiSection'
import type { Session } from '../../types'

type View = 'presenze' | 'contatti'

export default function GenitoreDashboard() {
  const { user, profile } = useAuth()
  const { children, loading } = useMyChildren(user?.email ?? undefined)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [session, setSession] = useState<Session>('morning')
  const [view, setView] = useState<View>('presenze')

  // Seleziona il primo figlio quando disponibile
  useEffect(() => {
    if (children.length === 0) setActiveId(null)
    else if (!activeId || !children.some((c) => c.id === activeId)) setActiveId(children[0].id)
  }, [children, activeId])

  const active = children.find((c) => c.id === activeId)
  const records = useChildAttendance(active?.schoolId, active?.classId, active?.id)

  // Menu hamburger: le due sezioni (presenze / contatti) + profilo + logout
  const headerMenu = (close: () => void) => (
    <>
      <div className="px-4 py-2 border-b border-dustyblue/20">
        <p className="text-sm font-medium">{profile?.name}</p>
        <p className="text-xs text-warmgray truncate">{profile?.email}</p>
      </div>
      <button
        onClick={() => {
          setView('presenze')
          close()
        }}
        className={
          'w-full text-left px-4 py-2 text-sm hover:bg-cream transition-colors ' +
          (view === 'presenze' ? 'text-dustyblue font-medium' : '')
        }
      >
        Controlla presenze
      </button>
      <button
        onClick={() => {
          setView('contatti')
          close()
        }}
        className={
          'w-full text-left px-4 py-2 text-sm hover:bg-cream transition-colors ' +
          (view === 'contatti' ? 'text-dustyblue font-medium' : '')
        }
      >
        Contatta un operatore
      </button>
      <button
        onClick={() => {
          close()
          signOut(auth)
        }}
        className="w-full text-left px-4 py-2 text-sm text-dustyblue hover:bg-cream transition-colors border-t border-dustyblue/20 mt-1 pt-2"
      >
        Esci
      </button>
    </>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader tools menu={headerMenu} />

      <main className="flex-1 mx-auto max-w-2xl w-full px-4 py-8 space-y-6">
        {view === 'contatti' ? (
          <ContattiSection />
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="font-serif text-2xl font-semibold">Presenze</h1>
                <p className="text-sm text-warmgray">
                  {active ? `${active.firstName} ${active.lastName}` : 'Calendario presenze'}
                </p>
              </div>
              {/* Sessione: mattina (pre-scuola) o pomeriggio (post-scuola) */}
              {children.length > 0 && <SessionSwitch value={session} onChange={setSession} />}
            </div>

            {loading ? (
              <p className="text-sm text-warmgray animate-pulse">Caricamento…</p>
            ) : children.length === 0 ? (
              <div className="rounded-xl border border-dustyblue/50 bg-dustyblue/10 px-4 py-3">
                <p className="font-medium">Nessun bambino collegato</p>
                <p className="mt-1 text-sm text-warmgray">
                  Il tuo account non è ancora collegato a nessun bambino. Contatta
                  l&apos;amministrazione della scuola.
                </p>
              </div>
            ) : (
              <>
                {/* Selettore solo se i figli sono più di uno */}
                {children.length > 1 && activeId && (
                  <ChildSwitcher children={children} activeId={activeId} onSelect={setActiveId} />
                )}
                <AttendanceCalendar records={records} session={session} />
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}
