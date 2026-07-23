import { useCallback, useEffect, useState } from 'react'
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { SchoolClass, WithId } from '../types'

/**
 * Classi di una scuola in tempo reale.
 *
 * Perché onSnapshot e non getDocs: l'elenco delle classi è la parte "viva" della pagina
 * (si aggiunge/elimina una classe, si assegnano operatori). Con onSnapshot ogni modifica —
 * anche da un altro admin o da un'altra scheda — si riflette subito senza ricaricare a mano.
 * getDocs darebbe una fotografia statica e costringerebbe a rileggere dopo ogni mutazione.
 */
export function useClasses(schoolId: string | undefined) {
  const [classes, setClasses] = useState<WithId<SchoolClass>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!schoolId) return
    // Reset immediato al cambio scuola: evita di mostrare le classi della scuola precedente
    setClasses([])
    setLoading(true)
    const ref = collection(db, 'schools', schoolId, 'classes')
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setClasses(snap.docs.map((d) => ({ id: d.id, ...(d.data() as SchoolClass) })))
        setLoading(false)
      },
      (err) => {
        console.error('Impossibile caricare le classi:', err)
        setLoading(false)
      },
    )
    return unsub
  }, [schoolId])

  const addClass = useCallback(
    async (name: string) => {
      if (!schoolId) return
      await addDoc(collection(db, 'schools', schoolId, 'classes'), {
        name: name.trim(),
        operatorIds: [],
      })
    },
    [schoolId],
  )

  const removeClass = useCallback(
    async (classId: string) => {
      if (!schoolId) return
      await deleteDoc(doc(db, 'schools', schoolId, 'classes', classId))
    },
    [schoolId],
  )

  // Assegna/rimuove un operatore alla classe (arrayUnion/arrayRemove sono atomici)
  const setOperator = useCallback(
    async (classId: string, operatorUid: string, assigned: boolean) => {
      if (!schoolId) return
      await updateDoc(doc(db, 'schools', schoolId, 'classes', classId), {
        operatorIds: assigned ? arrayUnion(operatorUid) : arrayRemove(operatorUid),
      })
    },
    [schoolId],
  )

  return { classes, loading, addClass, removeClass, setOperator }
}
