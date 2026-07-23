import { useEffect, useState } from 'react'
import { collectionGroup, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { SchoolClass, WithId } from '../types'

/** Classe con il riferimento alla scuola a cui appartiene */
export type OperatoreClass = WithId<SchoolClass> & { schoolId: string }

/**
 * Classi assegnate all'operatore, in tempo reale.
 *
 * SEGREGAZIONE (frontend): la query NON scarica tutte le classi per poi nasconderle,
 * ma filtra a monte con `operatorIds array-contains uid` su una collectionGroup 'classes'.
 * Firestore restituisce solo le classi dove l'uid è davvero fra gli operatori; le regole
 * (resource.data.operatorIds) confermano che la query è ammessa. Lo schoolId si ricava dal
 * percorso del documento (classes è sotto schools/{schoolId}).
 */
export function useOperatoreClasses(uid: string | undefined) {
  const [classes, setClasses] = useState<OperatoreClass[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return
    const q = query(collectionGroup(db, 'classes'), where('operatorIds', 'array-contains', uid))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setClasses(
          snap.docs.map((d) => ({
            id: d.id,
            schoolId: d.ref.parent.parent!.id,
            ...(d.data() as SchoolClass),
          })),
        )
        setLoading(false)
      },
      (err) => {
        console.error('Impossibile caricare le classi dell’operatore:', err)
        setLoading(false)
      },
    )
    return unsub
  }, [uid])

  return { classes, loading }
}
