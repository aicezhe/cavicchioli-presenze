import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { FirebaseError } from 'firebase/app'
import { motion } from 'framer-motion'
import { auth, db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import { PlatformCrest } from '../components/PlatformCrest'
import { ROLE_LABELS } from '../types'
import type { Role, UserProfile } from '../types'

const ROLES: Role[] = ['admin', 'operatore', 'genitore']

function errorMessage(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Email o password non corretti.'
      case 'auth/too-many-requests':
        return 'Troppi tentativi. Riprova tra qualche minuto.'
      case 'auth/invalid-email':
        return 'Indirizzo email non valido.'
    }
  }
  return 'Errore di accesso. Riprova.'
}

/**
 * Accesso per RUOLO (admin/operatore/genitore): si entra con email + password.
 * La scuola NON si sceglie qui: viene ricavata automaticamente dall'account
 * (assegnazioni delle classi per l'operatore, collegamenti dei figli per il genitore,
 * adminIds per l'amministratore). Il ruolo nell'URL serve solo a etichettare e a
 * verificare che le credenziali appartengano davvero a quel ruolo.
 */
export default function LoginPage() {
  const params = useParams<{ role?: string }>()
  const role = params.role
  const isValidRole = !!role && (ROLES as string[]).includes(role)
  const roleLabel = isValidRole ? ROLE_LABELS[role as Role] : ''

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  // Sessione già attiva → al proprio dashboard (il dispatcher smista per ruolo)
  useEffect(() => {
    if (!loading && user && !submitting) navigate('/dashboard', { replace: true })
  }, [loading, user, submitting, navigate])

  if (!isValidRole) return <Navigate to="/" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password)
      // La pagina è per un ruolo preciso: se l'account ha un altro ruolo, esco e avviso
      const snap = await getDoc(doc(db, 'users', cred.user.uid))
      const accountRole = snap.exists() ? (snap.data() as UserProfile).role : null
      if (accountRole !== role) {
        await signOut(auth)
        setError(`Queste credenziali non appartengono a un account ${roleLabel}.`)
        return
      }
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <PlatformCrest variant="full" size={104} />
          <h1 className="mt-4 font-serif text-2xl font-semibold text-dustyblue">NOTA</h1>
          <p className="mt-1 text-sm text-warmgray">
            Accesso&nbsp;&mdash;&nbsp;<span className="text-ink font-medium">{roleLabel}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-black/10 shadow-sm p-6 sm:p-8">
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-warmgray/40 bg-cream/50 px-3 py-2.5
                         focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent"
            />
          </label>

          <label className="block mt-4">
            <span className="text-sm font-medium">Password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-warmgray/40 bg-cream/50 px-3 py-2.5
                         focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent"
            />
          </label>

          {error && (
            <p role="alert" className="mt-4 text-sm rounded-lg px-3 py-2 text-dustyblue bg-dustyblue/5 border border-dustyblue/20">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-lg bg-dustyblue px-4 py-2.5 text-cream font-medium
                       hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? 'Accesso in corso…' : 'Accedi'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-warmgray hover:text-dustyblue transition-colors">
            &larr; Indietro
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
