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
import ClassAccordion from '../../components/admin/ClassAccordion'
import Modal from '../../components/admin/Modal'

export default function AdminDashboard() {
  const { user, profile } = useAuth()
  const { school, loading: schoolLoading, createSchool } = useSchool(user?.uid)
  const { classes, addClass, removeClass, setOperator } = useClasses(school?.id)
  // I totali (bambini, presenze) sono calcolati con getDocs: li ricalcolo cambiando questa chiave
  const [statsKey, setStatsKey] = useState(0)
  const stats = useAdminStats(school?.id, classes, statsKey)
  const refreshStats = () => setStatsKey((k) => k + 1)

  const [showNewClass, setShowNewClass] = useState(false)
  const [newClassName, setNewClassName] = useState('')
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

  async function handleAddClass(e: FormEvent) {
    e.preventDefault()
    if (!newClassName.trim()) return
    await addClass(newClassName)
    setNewClassName('')
    setShowNewClass(false)
    refreshStats()
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

        {/* Classi */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold">Classi</h2>
            <button
              onClick={() => setShowNewClass(true)}
              className="rounded-lg bg-crimson px-4 py-2 text-sm text-cream font-medium hover:opacity-90 transition-opacity"
            >
              + Nuova classe
            </button>
          </div>

          {classes.length === 0 ? (
            <p className="text-sm text-warmgray">Nessuna classe. Creane una per iniziare.</p>
          ) : (
            <div className="space-y-3">
              {classes.map((cls) => (
                <ClassAccordion
                  key={cls.id}
                  schoolId={school!.id}
                  cls={cls}
                  onRemoveClass={async (id) => {
                    await removeClass(id)
                    refreshStats()
                  }}
                  onToggleOperator={setOperator}
                  onDataChange={refreshStats}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modale: nuova classe */}
      <Modal open={showNewClass} title="Nuova classe" onClose={() => setShowNewClass(false)}>
        <form onSubmit={handleAddClass} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Nome della classe</span>
            <input
              required
              autoFocus
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="Es. 1ª A"
              className="mt-1 w-full rounded-lg border border-warmgray/40 bg-white px-3 py-2.5
                         focus:outline-none focus:ring-2 focus:ring-crimson/60 focus:border-crimson"
            />
          </label>
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-crimson px-4 py-2.5 text-cream font-medium hover:opacity-90 transition-opacity"
            >
              Crea
            </button>
            <button
              type="button"
              onClick={() => setShowNewClass(false)}
              className="rounded-lg border border-warmgray/40 px-4 py-2.5 font-medium hover:bg-white transition-colors"
            >
              Annulla
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
