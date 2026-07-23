import { useEffect, useState } from 'react'
import { collectionGroup, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Child, WithId } from '../types'

/** Bambino con il percorso completo (scuola/classe) ricavato dal riferimento del documento */
export type ParentChild = WithId<Child> & { schoolId: string; classId: string }

/**
 * I figli del genitore corrente, in tempo reale.
 *
 * SEGREGAZIONE: query collectionGroup su 'children' filtrata per
 * `parentEmails array-contains <email>`. Il genitore vede SOLO i bambini in cui la sua
 * email è fra i parentEmails; la regola con wildcard ricorsivo lo autorizza sulla stessa
 * condizione (resource.data), quindi altri bambini restano inaccessibili anche via query diretta.
 */
export function useMyChildren(email: string | undefined) {
  const [children, setChildren] = useState<ParentChild[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!email) return
    // Reset al cambio utente: non mostrare i figli del genitore precedente
    setChildren([])
    setLoading(true)
    const q = query(
      collectionGroup(db, 'children'),
      where('parentEmails', 'array-contains', email.toLowerCase()),
    )
    const unsub = onSnapshot(
      q,
      (snap) => {
        setChildren(
          snap.docs.map((d) => ({
            id: d.id,
            // children ← classe ← classes ← scuola
            classId: d.ref.parent.parent!.id,
            schoolId: d.ref.parent.parent!.parent.parent!.id,
            ...(d.data() as Child),
          })),
        )
        setLoading(false)
      },
      (err) => {
        console.error('Impossibile caricare i figli:', err)
        setLoading(false)
      },
    )
    return unsub
  }, [email])

  return { children, loading }
}
