import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { UserProfile, WithId } from '../types'

/**
 * Tutti gli utenti registrati con ruolo 'operatore'.
 * Servono all'admin per assegnarli alle classi (l'operatore va registrato prima:
 * lo staff è provisioned, quindi il collegamento è diretto via uid).
 */
export function useOperators() {
  const [operators, setOperators] = useState<WithId<UserProfile>[]>([])

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'operatore'))
    const unsub = onSnapshot(
      q,
      (snap) => setOperators(snap.docs.map((d) => ({ id: d.id, ...(d.data() as UserProfile) }))),
      (err) => console.error('Impossibile caricare gli operatori:', err),
    )
    return unsub
  }, [])

  return operators
}
