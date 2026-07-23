import { useEffect, useState } from 'react'
import { collection, doc, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { School, WithId } from '../types'

/**
 * Elenco pubblico delle scuole (directory), per lo schermo /schools.
 * Viene letto PRIMA del login → richiede una regola di lettura pubblica su schools.
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
