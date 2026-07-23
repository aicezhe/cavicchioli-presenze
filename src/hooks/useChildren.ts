import { useCallback, useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Child, WithId } from '../types'

/** Dati del form bambino (creazione e modifica) */
export type ChildFormData = {
  firstName: string
  lastName: string
  dob: string
  parentEmail: string
}

// Normalizza i dati + risolve l'uid del genitore già registrato con quell'email.
// A livello di modulo perché non dipende da scuola/classe (solo dai dati e da db).
async function buildChildDoc(data: ChildFormData) {
  const parentEmail = data.parentEmail.trim().toLowerCase()
  let parentIds: string[] = []
  if (parentEmail) {
    const q = query(
      collection(db, 'users'),
      where('email', '==', parentEmail),
      where('role', '==', 'genitore'),
    )
    const found = await getDocs(q)
    parentIds = found.docs.map((d) => d.id)
  }
  return {
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    dob: data.dob,
    parentEmails: parentEmail ? [parentEmail] : [],
    parentIds,
  }
}

/**
 * Bambini di una classe in tempo reale (stesso motivo di useClasses: lista viva).
 *
 * Collegamento genitore: l'admin inserisce l'email del genitore. La memorizziamo in
 * parentEmails — è il collegamento autorevole, perché le regole lo confrontano con
 * request.auth.token.email (verificato da Firebase). Così il genitore vede il figlio
 * anche se si registra DOPO, senza bisogno di riconciliare gli uid né di far scrivere
 * al genitore il documento del bambino (regole più strette).
 * In più risolviamo l'uid del genitore già registrato e lo salviamo in parentIds,
 * come comodità per eventuali query.
 */
export function useChildren(schoolId: string | undefined, classId: string | undefined) {
  const [children, setChildren] = useState<WithId<Child>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!schoolId || !classId) return
    const ref = collection(db, 'schools', schoolId, 'classes', classId, 'children')
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setChildren(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Child) })))
        setLoading(false)
      },
      (err) => {
        console.error('Impossibile caricare i bambini:', err)
        setLoading(false)
      },
    )
    return unsub
  }, [schoolId, classId])

  const addChild = useCallback(
    async (data: ChildFormData) => {
      if (!schoolId || !classId) return
      await addDoc(collection(db, 'schools', schoolId, 'classes', classId, 'children'), await buildChildDoc(data))
    },
    [schoolId, classId],
  )

  // Modifica i dati di un bambino esistente (nome, cognome, data, email genitore)
  const updateChild = useCallback(
    async (childId: string, data: ChildFormData) => {
      if (!schoolId || !classId) return
      await updateDoc(
        doc(db, 'schools', schoolId, 'classes', classId, 'children', childId),
        await buildChildDoc(data),
      )
    },
    [schoolId, classId],
  )

  const removeChild = useCallback(
    async (childId: string) => {
      if (!schoolId || !classId) return
      await deleteDoc(doc(db, 'schools', schoolId, 'classes', classId, 'children', childId))
    },
    [schoolId, classId],
  )

  return { children, loading, addChild, updateChild, removeChild }
}
