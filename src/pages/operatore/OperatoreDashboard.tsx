import { useEffect, useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import { useOperatoreClasses } from '../../hooks/useOperatoreClasses'
import { useSchoolById } from '../../hooks/useSchools'
import AppHeader from '../../components/AppHeader'
import Crest from '../../components/Crest'
import SessionSwitch from '../../components/SessionSwitch'
import ClassSwitcher from '../../components/operatore/ClassSwitcher'
import AppelloList from '../../components/operatore/AppelloList'
import { schoolColor, schoolInitials } from '../../types'
import type { Session } from '../../types'

export default function OperatoreDashboard() {
  const { user, profile } = useAuth()
  const { classes, loading } = useOperatoreClasses(user?.uid)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [session, setSession] = useState<Session>('morning')

  // Seleziona la prima classe appena disponibili (o se quella attiva sparisce)
  useEffect(() => {
    if (classes.length === 0) {
      setActiveId(null)
    } else if (!activeId || !classes.some((c) => c.id === activeId)) {
      setActiveId(classes[0].id)
    }
  }, [classes, activeId])

  // Contenuto del menu hamburger: profilo + logout
  const headerMenu = (close: () => void) => (
    <>
      <div className="px-4 py-2 border-b border-dustyblue/20">
        <p className="text-sm font-medium">{profile?.name}</p>
        <p className="text-xs text-warmgray truncate">{profile?.email}</p>
      </div>
      <button
        onClick={() => {
          close()
          signOut(auth)
        }}
        className="w-full text-left px-4 py-2 text-sm text-dustyblue hover:bg-cream transition-colors"
      >
        Esci
      </button>
    </>
  )

  const active = classes.find((c) => c.id === activeId)

  // La scuola dell'operatore si ricava dai suoi dati (schoolId nel percorso della classe):
  // header e accenti prendono nome e colore di QUELLA scuola.
  const { school } = useSchoolById(active?.schoolId ?? classes[0]?.schoolId)
  const color = school ? schoolColor(school) : '#6E859C'
  const headerEmblem = school ? (
    <Crest size={40} variant="compact" color={color} initials={schoolInitials(school)} />
  ) : undefined

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader tools menu={headerMenu} emblem={headerEmblem} title={school?.name} bgColor={school ? color : undefined} />

      <main className="flex-1 mx-auto max-w-2xl w-full px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl font-semibold">Appello</h1>
            <p className="text-sm text-warmgray">Registro presenze pre/post-scuola</p>
          </div>
          {/* Sessione: mattina (pre-scuola) o pomeriggio (post-scuola) */}
          {classes.length > 0 && <SessionSwitch value={session} onChange={setSession} color={color} />}
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
            {/* Selettore solo se le classi sono più di una */}
            {classes.length > 1 && activeId && (
              <ClassSwitcher classes={classes} activeId={activeId} onSelect={setActiveId} color={color} />
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
