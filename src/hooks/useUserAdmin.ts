import { useCallback } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

/**
 * Operazioni dell'amministratore sugli account (documenti users/{uid}).
 *
 * Il cambio password usa sendPasswordResetEmail: sul piano Spark non c'è l'Admin SDK,
 * quindi non si può impostare la password di un altro utente dal client. L'invio del
 * link di reset è l'unico modo reale — la nuova password la sceglie l'utente stesso.
 */
export function useUserAdmin() {
  // Rinomina un utente (operatore/genitore) — regole: update consentito solo all'admin
  const updateUserName = useCallback(async (uid: string, name: string) => {
    await updateDoc(doc(db, 'users', uid), { name: name.trim() })
  }, [])

  // Concede/revoca all'operatore il permesso di gestire il roster delle sue classi
  const setCanManageRoster = useCallback(async (uid: string, allowed: boolean) => {
    await updateDoc(doc(db, 'users', uid), { canManageRoster: allowed })
  }, [])

  // Elimina il PROFILO utente (l'account Auth resta: serve l'Admin SDK per rimuoverlo)
  const deleteUserProfile = useCallback(async (uid: string) => {
    await deleteDoc(doc(db, 'users', uid))
  }, [])

  // Invia l'email di reset password all'utente indicato
  const sendPasswordReset = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim())
  }, [])

  // Imposta/aggiorna la chiave di sicurezza (PIN) sul PROPRIO profilo admin
  const setSecurityPin = useCallback(async (adminUid: string, pin: string) => {
    await updateDoc(doc(db, 'users', adminUid), { securityPin: pin.trim() })
  }, [])

  return { updateUserName, setCanManageRoster, deleteUserProfile, sendPasswordReset, setSecurityPin }
}
