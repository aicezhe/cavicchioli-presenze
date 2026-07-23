import { useCallback, useEffect, useState } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Child, WithId } from '../types'

/** Data di oggi in formato ISO (YYYY-MM-DD): è l'id del documento attendance */
export const todayIso = () => new Date().toISOString().slice(0, 10)

/**
 * Appello di una classe per OGGI: elenco bambini + stato presenza + scrittura immediata.
 *
 * - I bambini sono ordinati per cognome (comodo per l'appello).
 * - Per ogni bambino un listener su attendance/{today}: lo stato è sempre allineato.
 * - setPresent scrive subito attendance/{today} (present, markedBy, timestamp) con UI
 *   ottimistica: aggiorno lo stato locale prima della conferma, e se la scrittura fallisce
 *   ripristino. Nessun pulsante "Salva": ogni tocco è già persistito.
 */
export function useAppello(schoolId: string | undefined, classId: string | undefined) {
  const [children, setChildren] = useState<WithId<Child>[]>([])
  const [present, setPresentMap] = useState<Record<string, boolean>>({})
  const today = todayIso()

  // Bambini della classe, ordinati per cognome
  useEffect(() => {
    if (!schoolId || !classId) return
    const ref = collection(db, 'schools', schoolId, 'classes', classId, 'children')
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Child) }))
        list.sort((a, b) => a.lastName.localeCompare(b.lastName, 'it'))
        setChildren(list)
      },
      (err) => console.error('Impossibile caricare i bambini:', err),
    )
    return unsub
  }, [schoolId, classId])

  // Presenza di oggi: un listener per bambino su attendance/{today}
  const childIds = children.map((c) => c.id).join(',')
  useEffect(() => {
    if (!schoolId || !classId || children.length === 0) return
    const unsubs = children.map((c) =>
      onSnapshot(
        doc(db, 'schools', schoolId, 'classes', classId, 'children', c.id, 'attendance', today),
        (snap) =>
          setPresentMap((prev) => ({
            ...prev,
            [c.id]: snap.exists() ? snap.data().present === true : false,
          })),
      ),
    )
    return () => unsubs.forEach((u) => u())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId, classId, childIds, today])

  // Scrittura immediata con UI ottimistica
  const setPresent = useCallback(
    async (childId: string, value: boolean, markedBy: string) => {
      if (!schoolId || !classId) return
      const previous = present[childId] ?? false
      setPresentMap((prev) => ({ ...prev, [childId]: value })) // ottimistico
      try {
        await setDoc(
          doc(db, 'schools', schoolId, 'classes', classId, 'children', childId, 'attendance', today),
          { present: value, markedBy, timestamp: serverTimestamp() },
        )
      } catch (err) {
        console.error('Impossibile salvare la presenza:', err)
        setPresentMap((prev) => ({ ...prev, [childId]: previous })) // ripristino
      }
    },
    [schoolId, classId, today, present],
  )

  const presentCount = children.filter((c) => present[c.id]).length

  return { children, present, setPresent, today, presentCount }
}
