import { useCallback, useEffect, useState } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Child, Session, WithId } from '../types'

/** Data di oggi in formato ISO (YYYY-MM-DD): è l'id del documento attendance */
export const todayIso = () => new Date().toISOString().slice(0, 10)

/**
 * Appello di una classe per una DATA e una SESSIONE (mattina o pomeriggio).
 *
 * - I bambini sono ordinati per cognome (comodo per l'appello).
 * - Per ogni bambino un listener su attendance/{date}: lo stato è sempre allineato.
 * - setPresent scrive subito attendance/{date} con merge, aggiornando SOLO il campo della
 *   sessione corrente (mattina/pomeriggio) senza sovrascrivere l'altra. UI ottimistica:
 *   aggiorno lo stato locale prima della conferma, e se la scrittura fallisce ripristino.
 *   Nessun pulsante "Salva": ogni tocco è già persistito.
 */
export function useAppello(
  schoolId: string | undefined,
  classId: string | undefined,
  session: Session,
  date: string,
) {
  const [children, setChildren] = useState<WithId<Child>[]>([])
  // Per ogni bambino: presenza della sessione corrente
  const [present, setPresentMap] = useState<Record<string, boolean>>({})

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

  // Presenza della data scelta per la sessione: un listener per bambino su attendance/{date}
  const childIds = children.map((c) => c.id).join(',')
  useEffect(() => {
    if (!schoolId || !classId || children.length === 0) return
    // Reset immediato cambiando data/sessione: evita di mostrare i valori del giorno precedente
    setPresentMap({})
    const unsubs = children.map((c) =>
      onSnapshot(
        doc(db, 'schools', schoolId, 'classes', classId, 'children', c.id, 'attendance', date),
        (snap) =>
          setPresentMap((prev) => ({
            ...prev,
            [c.id]: snap.exists() ? snap.data()[session] === true : false,
          })),
      ),
    )
    return () => unsubs.forEach((u) => u())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId, classId, childIds, date, session])

  // Scrittura immediata (merge sul solo campo della sessione) con UI ottimistica
  const setPresent = useCallback(
    async (childId: string, value: boolean, markedBy: string) => {
      if (!schoolId || !classId) return
      const previous = present[childId] ?? false
      setPresentMap((prev) => ({ ...prev, [childId]: value })) // ottimistico
      try {
        await setDoc(
          doc(db, 'schools', schoolId, 'classes', classId, 'children', childId, 'attendance', date),
          { [session]: value, markedBy, timestamp: serverTimestamp() },
          { merge: true }, // non tocca l'altra sessione
        )
      } catch (err) {
        console.error('Impossibile salvare la presenza:', err)
        setPresentMap((prev) => ({ ...prev, [childId]: previous })) // ripristino
      }
    },
    [schoolId, classId, date, session, present],
  )

  const presentCount = children.filter((c) => present[c.id]).length

  return { children, present, setPresent, presentCount }
}
