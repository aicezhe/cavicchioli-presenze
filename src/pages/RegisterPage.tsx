import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { FirebaseError } from 'firebase/app'
import { motion } from 'framer-motion'
import { auth, db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import Crest from '../components/Crest'
import { ROLE_LABELS } from '../types'
import type { Role } from '../types'

// Ruoli che possono auto-registrarsi: admin è escluso (lo crea la scuola)
const SELF_ROLES: Role[] = ['operatore', 'genitore']

// Traduciamo gli errori Firebase in messaggi leggibili; per il resto un testo generico
function errorMessage(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case 'auth/email-already-in-use':
        return 'Esiste già un account con questa email.'
      case 'auth/invalid-email':
        return 'Indirizzo email non valido.'
      case 'auth/weak-password':
        return 'La password deve contenere almeno 6 caratteri.'
    }
  }
  return 'Errore durante la registrazione. Riprova.'
}

export default function RegisterPage() {
  const { role } = useParams<{ role: string }>()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()

  // Il ruolo nell'URL deve essere uno di quelli noti, altrimenti si torna alla scelta del ruolo
  const isKnownRole = role === 'admin' || role === 'operatore' || role === 'genitore'
  if (!isKnownRole) return <Navigate to="/" replace />
  const typedRole = role as Role
  const roleLabel = ROLE_LABELS[typedRole]

  // L'account amministratore non è auto-registrabile
  if (!SELF_ROLES.includes(typedRole)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 text-center">
        <Crest size={90} variant="full" />
        <h1 className="mt-4 font-serif text-2xl font-semibold text-crimson">
          Registrazione non disponibile
        </h1>
        <p className="mt-2 max-w-sm text-sm text-warmgray">
          Gli account <span className="font-medium text-ink">{roleLabel}</span> vengono
          creati dall&apos;amministrazione della scuola.
        </p>
        <Link
          to={`/login/${role}`}
          className="mt-6 rounded-lg bg-crimson px-5 py-2.5 text-cream font-medium hover:opacity-90 transition-opacity"
        >
          Vai all&apos;accesso
        </Link>
        <Link to="/" className="mt-4 text-sm text-warmgray hover:text-crimson transition-colors">
          &larr; Cambia ruolo
        </Link>
      </div>
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      // 1. Crea l'account in Firebase Auth (esegue anche il login automatico)
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
      // 2. Salva il nome nel profilo Auth (comodo per displayName)
      await updateProfile(cred.user, { displayName: name.trim() })
      // 3. Crea il documento users/{uid} con ruolo e dati.
      //    Le regole permettono l'auto-creazione solo per operatore/genitore.
      await setDoc(doc(db, 'users', cred.user.uid), {
        role: typedRole,
        name: name.trim(),
        email: email.trim(),
      })
      // 4. Ricarica il profilo nel contesto (era null subito dopo il login automatico)
      await refreshProfile()
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(errorMessage(err))
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
          <Crest size={110} variant="full" />
          <h1 className="mt-4 font-serif text-2xl font-semibold text-crimson">
            Crea il tuo account
          </h1>
          <p className="mt-1 text-sm text-warmgray">
            Registrazione&nbsp;&mdash;&nbsp;<span className="text-ink font-medium">{roleLabel}</span>
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-gold/40 shadow-sm p-6 sm:p-8"
        >
          <label className="block">
            <span className="text-sm font-medium">Nome e cognome</span>
            <input
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-warmgray/40 bg-cream/50 px-3 py-2.5
                         focus:outline-none focus:ring-2 focus:ring-crimson/60 focus:border-crimson"
            />
          </label>

          <label className="block mt-4">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-warmgray/40 bg-cream/50 px-3 py-2.5
                         focus:outline-none focus:ring-2 focus:ring-crimson/60 focus:border-crimson"
            />
          </label>

          <label className="block mt-4">
            <span className="text-sm font-medium">Password</span>
            <input
              type="password"
              required
              autoComplete="new-password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-warmgray/40 bg-cream/50 px-3 py-2.5
                         focus:outline-none focus:ring-2 focus:ring-crimson/60 focus:border-crimson"
            />
            <span className="mt-1 block text-xs text-warmgray">Almeno 6 caratteri</span>
          </label>

          {error && (
            <p role="alert" className="mt-4 text-sm text-crimson bg-crimson/5 border border-crimson/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-lg bg-crimson px-4 py-2.5 text-cream font-medium
                       hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? 'Registrazione in corso…' : 'Registrati'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-warmgray">
          Hai già un account?{' '}
          <Link to={`/login/${role}`} className="text-crimson font-medium hover:underline">
            Accedi
          </Link>
        </div>
        <div className="mt-2 text-center">
          <Link to="/" className="text-sm text-warmgray hover:text-crimson transition-colors">
            &larr; Cambia ruolo
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
