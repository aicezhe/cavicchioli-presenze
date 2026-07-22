import { useCallback, useEffect, useState } from 'react'
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Child, SchoolClass, WithId } from '../types'

/** Bambino arricchito con la classe di appartenenza (per le viste trasversali) */
export type ChildWithClass = WithId<Child> & { classId: string; className: string }

/**
 * Tutti i bambini della scuola, attraverso tutte le classi (vista trasversale
 * usata dalla sezione Genitori). Un listener onSnapshot per classe: per poche
 * classi è leggero e mantiene la vista sempre aggiornata.
 */
export function useAllChildren(
  schoolId: string | undefined,
  classes: WithId<SchoolClass>[],
) {
  const [byClass, setByClass] = useState<Record<string, ChildWithClass[]>>({})
  // Chiave stabile: ri-sottoscrive solo quando cambia l'insieme delle classi
  const classKey = classes.map((c) => `${c.id}:${c.name}`).join('|')

  useEffect(() => {
    if (!schoolId) return
    const unsubs = classes.map((cls) =>
      onSnapshot(
        collection(db, 'schools', schoolId, 'classes', cls.id, 'children'),
        (snap) =>
          setByClass((prev) => ({
            ...prev,
            [cls.id]: snap.docs.map((d) => ({
              id: d.id,
              classId: cls.id,
              className: cls.name,
              ...(d.data() as Child),
            })),
          })),
        (err) => console.error('Impossibile caricare i bambini:', err),
      ),
    )
    return () => unsubs.forEach((u) => u())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId, classKey])

  // Solo le classi ancora esistenti, appiattite
  const validIds = new Set(classes.map((c) => c.id))
  const children = Object.entries(byClass)
    .filter(([cid]) => validIds.has(cid))
    .flatMap(([, arr]) => arr)

  // Collega/scollega un genitore a un bambino. parentEmails è la fonte autorevole
  // (verificata dalle regole); parentIds si aggiorna in parallelo per comodità.
  const setParentLink = useCallback(
    async (
      classId: string,
      childId: string,
      email: string,
      parentUid: string | undefined,
      link: boolean,
    ) => {
      if (!schoolId) return
      const ref = doc(db, 'schools', schoolId, 'classes', classId, 'children', childId)
      const patch: Record<string, unknown> = {
        parentEmails: link ? arrayUnion(email) : arrayRemove(email),
      }
      if (parentUid) {
        patch.parentIds = link ? arrayUnion(parentUid) : arrayRemove(parentUid)
      }
      await updateDoc(ref, patch)
    },
    [schoolId],
  )

  return { children, setParentLink }
}
