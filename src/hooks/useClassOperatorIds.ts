import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { SchoolClass } from '../types'

/**
 * operatorIds della classe del figlio, per mostrare al genitore SOLO gli operatori giusti.
 * Il genitore legge il documento classe (metadati non sensibili: nome + operatorIds).
 */
export function useClassOperatorIds(schoolId: string | undefined, classId: string | undefined) {
  const [operatorIds, setOperatorIds] = useState<string[]>([])

  useEffect(() => {
    if (!schoolId || !classId) {
      setOperatorIds([])
      return
    }
    const unsub = onSnapshot(
      doc(db, 'schools', schoolId, 'classes', classId),
      (snap) => setOperatorIds(snap.exists() ? ((snap.data() as SchoolClass).operatorIds ?? []) : []),
      (err) => console.error('Impossibile leggere la classe:', err),
    )
    return unsub
  }, [schoolId, classId])

  return operatorIds
}
