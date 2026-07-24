import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import { useMySchools } from '../../hooks/useSchools'
import { useClasses } from '../../hooks/useClasses'
import { useAdminStats } from '../../hooks/useAdminStats'
import { useAllChildren } from '../../hooks/useAllChildren'
import AppHeader from '../../components/AppHeader'
import Crest from '../../components/Crest'
import { PlatformCrest } from '../../components/PlatformCrest'
import StatsCards from '../../components/admin/StatsCards'
import ClassiSection from '../../components/admin/ClassiSection'
import OperatoriSection from '../../components/admin/OperatoriSection'
import GenitoriSection from '../../components/admin/GenitoriSection'
import SearchModal from '../../components/admin/SearchModal'
import Modal from '../../components/admin/Modal'
import NewSchoolForm from '../../components/admin/NewSchoolForm'
import { DEFAULT_SCHOOL_COLOR, schoolColor, schoolInitials } from '../../types'

// Le Impostazioni sono una schermata separata (/admin/settings), non una scheda.
const TABS = [
  { key: 'classi', label: 'Classi' },
  { key: 'operatori', label: 'Operatori' },
  { key: 'genitori', label: 'Genitori' },
] as const
type TabKey = (typeof TABS)[number]['key']

function SettingsIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile } = useAuth()
  const { schools, loading: schoolsLoading, createSchool } = useMySchools(user?.uid)

  // Scuola attiva: le sezioni (classi, statistiche, ecc.) reagiscono a questo id
  const [activeSchoolId, setActiveSchoolId] = useState<string | null>(null)
  useEffect(() => {
    if (schools.length === 0) {
      setActiveSchoolId(null)
    } else if (!activeSchoolId || !schools.some((s) => s.id === activeSchoolId)) {
      setActiveSchoolId(schools[0].id)
    }
  }, [schools, activeSchoolId])
  const school = schools.find((s) => s.id === activeSchoolId) ?? null

  const { classes, addClass, removeClass, setOperator } = useClasses(school?.id)
  const { children: allChildren, setParentLink } = useAllChildren(school?.id, classes)
  const [statsKey, setStatsKey] = useState(0)
  const stats = useAdminStats(school?.id, classes, statsKey)
  const refreshStats = () => setStatsKey((k) => k + 1)

  // Scheda iniziale: 'operatori' se si arriva da "Gestisci" nelle Impostazioni
  const initialTab: TabKey = (location.state as { tab?: TabKey } | null)?.tab ?? 'classi'
  const [tab, setTab] = useState<TabKey>(initialTab)
  const [showNewSchool, setShowNewSchool] = useState(false)

  // Vai alle Impostazioni portando con sé la scuola attiva (schermata separata)
  const goToSettings = () =>
    navigate(activeSchoolId ? `/admin/settings?school=${activeSchoolId}` : '/admin/settings')

  // Ricerca + salto a una classe
  const [showSearch, setShowSearch] = useState(false)
  const [openClassId, setOpenClassId] = useState<string | null>(null)
  const [openNonce, setOpenNonce] = useState(0)
  const goToClass = (classId: string) => {
    setTab('classi')
    setOpenClassId(classId)
    setOpenNonce((n) => n + 1)
  }

  const headerMenu = (close: () => void) => (
    <>
      <div className="px-4 py-2 border-b border-black/10">
        <p className="text-sm font-medium">{profile?.name}</p>
        <p className="text-xs text-warmgray truncate">{profile?.email}</p>
      </div>
      <button
        onClick={() => {
          goToSettings()
          close()
        }}
        className="w-full text-left px-4 py-2 text-sm hover:bg-cream transition-colors"
      >
        Impostazioni
      </button>
      <button
        onClick={() => signOut(auth)}
        className="w-full text-left px-4 py-2 text-sm text-dustyblue hover:bg-cream transition-colors"
      >
        Esci
      </button>
    </>
  )

  // L'admin è a livello piattaforma: header NOTA (non il nome della scuola)
  const notaEmblem = <PlatformCrest variant="icon" size={30} />

  // Icona ingranaggio nell'header → schermata Impostazioni
  const settingsButton = (
    <button
      aria-label="Impostazioni"
      onClick={goToSettings}
      className="opacity-80 hover:opacity-100 transition-opacity"
    >
      <SettingsIcon />
    </button>
  )

  // Bootstrap: nessuna scuola → schermata di creazione della prima scuola
  if (!schoolsLoading && schools.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppHeader tools menu={headerMenu} right={settingsButton} emblem={notaEmblem} title="NOTA" />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-sm bg-white rounded-xl border border-black/10 p-6 sm:p-8">
            <h1 className="font-serif text-xl font-semibold text-dustyblue text-center">Crea la tua scuola</h1>
            <p className="mt-1 mb-4 text-sm text-warmgray text-center">
              Per iniziare, crea la scuola che gestirai.
            </p>
            <NewSchoolForm onSubmit={async (data) => void (await createSchool(data))} />
          </div>
        </main>
      </div>
    )
  }

  const color = school ? schoolColor(school) : DEFAULT_SCHOOL_COLOR

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader tools menu={headerMenu} onSearchClick={() => setShowSearch(true)} right={settingsButton} emblem={notaEmblem} title="NOTA" />

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-8 space-y-8">
        {/* Le mie scuole: emblema + selettore scuola attiva + nuova scuola */}
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            {school && (
              <Crest size={32} variant="compact" color={color} initials={schoolInitials(school)} />
            )}
            {schools.length > 1 ? (
              <select
                value={activeSchoolId ?? ''}
                onChange={(e) => setActiveSchoolId(e.target.value)}
                className="rounded-lg border border-black/15 bg-white px-3 py-2 text-lg font-serif font-semibold
                           focus:outline-none focus:ring-2 focus:ring-black/20"
              >
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            ) : (
              <h1 className="font-serif text-2xl font-semibold">{school?.name}</h1>
            )}
            <button
              onClick={() => setShowNewSchool(true)}
              className="ml-auto rounded-lg border border-dustyblue px-3 py-1.5 text-sm text-dustyblue font-medium hover:bg-dustyblue/10 transition-colors"
            >
              + Nuova scuola
            </button>
          </div>
          <p className="mt-1 text-sm text-warmgray">Pannello amministratore</p>
        </div>

        <StatsCards stats={stats} />

        {/* Barra delle sezioni */}
        <div className="border-b border-black/10 overflow-x-auto">
          <nav className="flex gap-1 min-w-max">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={
                  'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ' +
                  (tab === t.key
                    ? 'border-dustyblue text-dustyblue'
                    : 'border-transparent text-warmgray hover:text-ink')
                }
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Sezione attiva */}
        {school && tab === 'classi' && (
          <ClassiSection
            schoolId={school.id}
            classes={classes}
            addClass={addClass}
            removeClass={removeClass}
            onToggleOperator={setOperator}
            onDataChange={refreshStats}
            openClassId={openClassId}
            openNonce={openNonce}
          />
        )}
        {tab === 'operatori' && (
          <OperatoriSection classes={classes} onToggle={setOperator} />
        )}
        {tab === 'genitori' && (
          <GenitoriSection childrenList={allChildren} setParentLink={setParentLink} />
        )}
      </main>

      {/* Ricerca globale: classi e bambini */}
      <SearchModal
        open={showSearch}
        onClose={() => setShowSearch(false)}
        classes={classes}
        childrenList={allChildren}
        onGoToClass={goToClass}
      />

      {/* Nuova scuola */}
      <Modal open={showNewSchool} title="Nuova scuola" onClose={() => setShowNewSchool(false)}>
        <NewSchoolForm
          submitLabel="Crea scuola"
          onSubmit={async (data) => {
            const id = await createSchool(data)
            if (id) setActiveSchoolId(id) // passa subito alla nuova scuola
          }}
          onDone={() => setShowNewSchool(false)}
        />
      </Modal>
    </div>
  )
}
