import { useState } from 'react'
import type { FormEvent } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import { useSchool } from '../../hooks/useSchool'
import { useClasses } from '../../hooks/useClasses'
import { useAdminStats } from '../../hooks/useAdminStats'
import AppHeader from '../../components/AppHeader'
import StatsCards from '../../components/admin/StatsCards'
import ClassiSection from '../../components/admin/ClassiSection'
import OperatoriSection from '../../components/admin/OperatoriSection'
import GenitoriSection from '../../components/admin/GenitoriSection'
import ImpostazioniSection from '../../components/admin/ImpostazioniSection'

const TABS = [
  { key: 'classi', label: 'Classi' },
  { key: 'operatori', label: 'Operatori' },
  { key: 'genitori', label: 'Genitori' },
  { key: 'impostazioni', label: 'Impostazioni' },
] as const
type TabKey = (typeof TABS)[number]['key']

export default function AdminDashboard() {
  const { user, profile } = useAuth()
  const { school, loading: schoolLoading, createSchool, updateSchoolName } = useSchool(user?.uid)
  const { classes, addClass, removeClass, setOperator } = useClasses(school?.id)
  // I totali (bambini, presenze) sono calcolati con getDocs: li ricalcolo cambiando questa chiave
  const [statsKey, setStatsKey] = useState(0)
  const stats = useAdminStats(school?.id, classes, statsKey)
  const refreshStats = () => setStatsKey((k) => k + 1)

  const [tab, setTab] = useState<TabKey>('classi')
  const [newSchoolName, setNewSchoolName] = useState('')

  const headerRight = (
    <>
      <span className="hidden sm:block text-sm text-cream/90">{profile?.name}</span>
      <button
        onClick={() => signOut(auth)}
        className="rounded-lg border border-gold/60 px-3 py-1.5 text-sm hover:bg-gold/10 transition-colors"
      >
        Esci
      </button>
    </>
  )

  // Bootstrap: l'admin non ha ancora una scuola → schermata di creazione
  if (!schoolLoading && !school) {
    async function handleCreateSchool(e: FormEvent) {
      e.preventDefault()
      await createSchool(newSchoolName)
    }
    return (
      <div className="min-h-screen flex flex-col">
        <AppHeader tools right={headerRight} />
        <main className="flex-1 flex items-center justify-center px-4">
          <form onSubmit={handleCreateSchool} className="w-full max-w-sm bg-white rounded-xl border border-gold/40 p-6 sm:p-8">
            <h1 className="font-serif text-xl font-semibold text-crimson">Crea la tua scuola</h1>
            <p className="mt-1 text-sm text-warmgray">
              Per iniziare, dai un nome alla scuola che gestirai.
            </p>
            <input
              required
              value={newSchoolName}
              onChange={(e) => setNewSchoolName(e.target.value)}
              placeholder='Es. Scuola Secondaria "Giacomo Cavicchioli"'
              className="mt-4 w-full rounded-lg border border-warmgray/40 bg-cream/50 px-3 py-2.5
                         focus:outline-none focus:ring-2 focus:ring-crimson/60 focus:border-crimson"
            />
            <button
              type="submit"
              className="mt-5 w-full rounded-lg bg-crimson px-4 py-2.5 text-cream font-medium hover:opacity-90 transition-opacity"
            >
              Crea scuola
            </button>
          </form>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader tools right={headerRight} />

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-8 space-y-8">
        <div>
          <h1 className="font-serif text-2xl font-semibold">{school?.name}</h1>
          <p className="text-sm text-warmgray">Pannello amministratore</p>
        </div>

        <StatsCards stats={stats} />

        {/* Barra delle sezioni */}
        <div className="border-b border-gold/30 overflow-x-auto">
          <nav className="flex gap-1 min-w-max">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={
                  'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ' +
                  (tab === t.key
                    ? 'border-crimson text-crimson'
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
          />
        )}
        {tab === 'operatori' && (
          <OperatoriSection classes={classes} onToggle={setOperator} />
        )}
        {school && tab === 'genitori' && (
          <GenitoriSection schoolId={school.id} classes={classes} />
        )}
        {school && tab === 'impostazioni' && (
          <ImpostazioniSection school={school} updateSchoolName={updateSchoolName} />
        )}
      </main>
    </div>
  )
}
