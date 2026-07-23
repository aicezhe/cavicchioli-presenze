import { useCallback } from 'react'
import { deleteApp, initializeApp } from 'firebase/app'
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { db, firebaseConfig } from '../lib/firebase'
import type { Role } from '../types'

/**
 * Provisioning di un account da parte dell'admin (il "direttore" crea le credenziali).
 *
 * Perché un'app Firebase SECONDARIA: createUserWithEmailAndPassword esegue anche il login
 * dell'utente creato. Sull'istanza principale questo scalzerebbe la sessione dell'admin.
 * Creando l'account su un'app secondaria isolata, la sessione dell'admin resta intatta;
 * poi scriviamo il profilo users/{uid} dall'istanza principale (le regole consentono la
 * create solo all'admin) e distruggiamo l'app secondaria.
 *
 * Nota: sul piano Spark non c'è l'Admin SDK lato server, quindi questo è il pattern
 * standard per far creare account ad un amministratore da client.
 */
export function useProvisionUser() {
  const provisionUser = useCallback(
    async (role: Role, name: string, email: string, password: string, phone?: string) => {
      // Nome univoco per non collidere con l'app principale né con provisioning concorrenti
      const secondary = initializeApp(firebaseConfig, `provision-${Date.now()}`)
      try {
        const cred = await createUserWithEmailAndPassword(
          getAuth(secondary),
          email.trim(),
          password,
        )
        await setDoc(doc(db, 'users', cred.user.uid), {
          role,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          // Telefono solo se indicato (evita campi vuoti nel documento)
          ...(phone?.trim() ? { phone: phone.trim() } : {}),
        })
        return cred.user.uid
      } finally {
        await deleteApp(secondary)
      }
    },
    [],
  )

  return { provisionUser }
}
