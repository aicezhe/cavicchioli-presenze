import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import type { UserProfile } from '../types'

type AuthState = {
  user: User | null
  /** Profilo da users/{uid}: ruolo, nome. null se il documento manca o è negato l'accesso */
  profile: UserProfile | null
  /** true finché Firebase non comunica se c'è una sessione attiva
      e finché il profilo non è caricato (altrimenti si vedrebbero redirect e «nessun ruolo» lampeggianti) */
  loading: boolean
  /** Ricarica il profilo dell'utente corrente (usato dopo la registrazione,
      quando il documento users/{uid} viene creato subito dopo il login automatico) */
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<AuthState, 'refreshProfile'>>({
    user: null,
    profile: null,
    loading: true,
  })

  // Legge il documento profilo di un utente e aggiorna lo stato
  const loadProfile = useCallback(async (user: User) => {
    try {
      const snap = await getDoc(doc(db, 'users', user.uid))
      setState({
        user,
        profile: snap.exists() ? (snap.data() as UserProfile) : null,
        loading: false,
      })
    } catch (err) {
      // Permessi mancanti o rete assente: l'utente è autenticato ma senza ruolo
      console.error('Impossibile caricare il profilo:', err)
      setState({ user, profile: null, loading: false })
    }
  }, [])

  useEffect(() => {
    // Si attiva al login, al logout e al ripristino della sessione dopo un reload
    return onAuthStateChanged(auth, (user) => {
      if (!user) {
        setState({ user: null, profile: null, loading: false })
        return
      }
      // L'utente è noto subito, il profilo è ancora in caricamento: teniamo loading=true,
      // altrimenti ProtectedRoute reagirebbe a user=null e reindirizzerebbe alla home
      setState({ user, profile: null, loading: true })
      loadProfile(user)
    })
  }, [loadProfile])

  // Esposta ai componenti: rilegge il profilo dell'utente attualmente autenticato
  const refreshProfile = useCallback(async () => {
    if (auth.currentUser) await loadProfile(auth.currentUser)
  }, [loadProfile])

  return (
    <AuthContext.Provider value={{ ...state, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
