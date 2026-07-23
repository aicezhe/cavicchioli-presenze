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

export type NewSchoolData = {
  name: string
  primaryColor?: string
  emblemInitials?: string
}

/**
 * TUTTE le scuole gestite dall'admin corrente (adminIds array-contains uid), in tempo reale.
 * Un admin può gestire più scuole: la dashboard sceglie quale è attiva.
 */
export function useMySchools(uid: string | undefined) {
  const [schools, setSchools] = useState<WithId<School>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return
    const q = query(collection(db, 'schools'), where('adminIds', 'array-contains', uid))
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as School) }))
        list.sort((a, b) => a.name.localeCompare(b.name, 'it'))
        setSchools(list)
        setLoading(false)
      },
      (err) => {
        console.error('Impossibile caricare le scuole:', err)
        setLoading(false)
      },
    )
    return unsub
  }, [uid])

  // Crea la scuola includendo l'admin in adminIds (richiesto dalle regole). Ritorna il nuovo id.
  const createSchool = useCallback(
    async (data: NewSchoolData): Promise<string | undefined> => {
      if (!uid) return
      const initials = data.emblemInitials?.trim().toUpperCase()
      const ref = await addDoc(collection(db, 'schools'), {
        name: data.name.trim(),
        adminIds: [uid],
        // Campi opzionali solo se valorizzati (Firestore non accetta undefined)
        ...(data.primaryColor ? { primaryColor: data.primaryColor } : {}),
        ...(initials ? { emblemInitials: initials } : {}),
      })
      return ref.id
    },
    [uid],
  )

  // Rinomina la scuola (sezione Impostazioni)
  const updateSchoolName = useCallback(async (schoolId: string, name: string) => {
    await updateDoc(doc(db, 'schools', schoolId), { name: name.trim() })
  }, [])

  // Aggiunge un uid agli amministratori della scuola
  const addSchoolAdmin = useCallback(async (schoolId: string, adminUid: string) => {
    await updateDoc(doc(db, 'schools', schoolId), { adminIds: arrayUnion(adminUid) })
  }, [])

  return { schools, loading, createSchool, updateSchoolName, addSchoolAdmin }
}
