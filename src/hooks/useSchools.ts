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
import { DEFAULT_SCHOOL_COLOR, schoolColor, schoolInitials } from '../types'
import type { School, WithId } from '../types'

export type NewSchoolData = {
  name: string
  primaryColor?: string
  emblemInitials?: string
}

/**
 * Directory pubblica delle scuole, per lo schermo /schools.
 * Viene letta PRIMA del login → richiede una regola di lettura pubblica su schools.
 */
export function useSchools() {
  const [schools, setSchools] = useState<WithId<School>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'schools'),
      (snap) => {
        setSchools(snap.docs.map((d) => ({ id: d.id, ...(d.data() as School) })))
        setLoading(false)
      },
      (err) => {
        console.error('Impossibile caricare le scuole:', err)
        setLoading(false)
      },
    )
    return unsub
  }, [])

  return { schools, loading }
}

/** Una singola scuola per id (per temizzare login/scelta ruolo col suo colore). */
export function useSchoolById(schoolId: string | undefined) {
  const [school, setSchool] = useState<WithId<School> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!schoolId) {
      setLoading(false)
      return
    }
    const unsub = onSnapshot(
      doc(db, 'schools', schoolId),
      (snap) => {
        setSchool(snap.exists() ? ({ id: snap.id, ...(snap.data() as School) }) : null)
        setLoading(false)
      },
      (err) => {
        console.error('Impossibile caricare la scuola:', err)
        setLoading(false)
      },
    )
    return unsub
  }, [schoolId])

  return { school, loading }
}

/**
 * Tema di una scuola (nome, colore, iniziali) per intestare le cabine operatore/genitore
 * con la scuola scelta. Centralizza il fallback al colore di piattaforma.
 */
export function useSchoolTheme(schoolId: string | undefined) {
  const { school } = useSchoolById(schoolId)
  return {
    school,
    color: school ? schoolColor(school) : DEFAULT_SCHOOL_COLOR,
    initials: school ? schoolInitials(school) : '',
  }
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
