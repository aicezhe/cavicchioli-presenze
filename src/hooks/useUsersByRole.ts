import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Role, UserProfile, WithId } from '../types'

/** Utenti registrati con un determinato ruolo, in tempo reale. */
export function useUsersByRole(role: Role) {
  const [users, setUsers] = useState<WithId<UserProfile>[]>([])

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', role))
    const unsub = onSnapshot(
      q,
      (snap) => setUsers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as UserProfile) }))),
      (err) => console.error('Impossibile caricare gli utenti:', err),
    )
    return unsub
  }, [role])

  return users
}
