import { useCallback, useEffect, useState } from 'react'
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { School, WithId } from '../types'

/**
 * Trova la scuola gestita dall'admin corrente: schools dove il suo uid è in adminIds.
 * onSnapshot così, appena l'admin crea la scuola (bootstrap), la UI si aggiorna da sola
 * senza dover rileggere manualmente.
 */
export function useSchool(uid: string | undefined) {
  const [school, setSchool] = useState<WithId<School> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return
    const q = query(collection(db, 'schools'), where('adminIds', 'array-contains', uid))
    const unsub = onSnapshot(
      q,
      (snap) => {
        // Un admin gestisce (per questo progetto) una scuola: prendiamo la prima
        const first = snap.docs[0]
        setSchool(first ? ({ id: first.id, ...(first.data() as School) }) : null)
        setLoading(false)
      },
      (err) => {
        console.error('Impossibile caricare la scuola:', err)
        setLoading(false)
      },
    )
    return unsub
  }, [uid])

  // Crea la scuola includendo l'admin in adminIds (richiesto dalle regole)
  const createSchool = useCallback(
    async (name: string) => {
      if (!uid) return
      await addDoc(collection(db, 'schools'), {
        name: name.trim(),
        adminIds: [uid],
      })
    },
    [uid],
  )

  // Rinomina la scuola (sezione Impostazioni)
  const updateSchoolName = useCallback(
    async (schoolId: string, name: string) => {
      await updateDoc(doc(db, 'schools', schoolId), { name: name.trim() })
    },
    [],
  )

  // Aggiunge un uid agli amministratori della scuola
  const addSchoolAdmin = useCallback(async (schoolId: string, uid: string) => {
    await updateDoc(doc(db, 'schools', schoolId), { adminIds: arrayUnion(uid) })
  }, [])

  return { school, loading, createSchool, updateSchoolName, addSchoolAdmin }
}
