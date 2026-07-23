import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { SchoolClass, WithId } from '../types'

export type AdminStats = {
  classCount: number
  childrenCount: number
  /** % di bambini presenti oggi su tutta la scuola (0–100), null se non ci sono bambini */
  presentPct: number | null
  operatorCount: number
}

const todayIso = () => new Date().toISOString().slice(0, 10)

/**
 * Statistiche aggregate della scuola.
 *
 * Qui uso getDocs (una fotografia) e non onSnapshot: le statistiche sono un totale
 * calcolato su MOLTE sotto-collezioni (bambini di ogni classe + la loro presenza di oggi).
 * Tenere un listener live su tutte significherebbe decine di sottoscrizioni per un numero
 * che non serve aggiornare al millisecondo. Ricalcolo quando cambiano le classi o dopo una
 * mutazione (refreshKey). Le LISTE interattive (classi, bambini) restano invece onSnapshot.
 */
export function useAdminStats(
  schoolId: string | undefined,
  classes: WithId<SchoolClass>[],
  refreshKey: number,
): AdminStats {
  const [stats, setStats] = useState<AdminStats>({
    classCount: 0,
    childrenCount: 0,
    presentPct: null,
    operatorCount: 0,
  })

  useEffect(() => {
    if (!schoolId) return
    let cancelled = false

    async function compute() {
      let childrenCount = 0
      let presentCount = 0

      for (const cls of classes) {
        const childrenSnap = await getDocs(
          collection(db, 'schools', schoolId!, 'classes', cls.id, 'children'),
        )
        childrenCount += childrenSnap.size

        // Presenza di oggi: leggo attendance/{today} per ciascun bambino
        for (const child of childrenSnap.docs) {
          const attSnap = await getDocs(
            collection(db, 'schools', schoolId!, 'classes', cls.id, 'children', child.id, 'attendance'),
          )
          // Presente oggi = presente ad almeno una sessione (mattina o pomeriggio)
          const today = attSnap.docs.find((a) => a.id === todayIso())?.data()
          if (today?.morning === true || today?.evening === true) presentCount += 1
        }
      }

      // Operatori attivi: uid distinti presenti negli operatorIds di tutte le classi
      const operatorIds = new Set<string>()
      classes.forEach((c) => c.operatorIds?.forEach((id) => operatorIds.add(id)))

      if (!cancelled) {
        setStats({
          classCount: classes.length,
          childrenCount,
          presentPct: childrenCount > 0 ? Math.round((presentCount / childrenCount) * 100) : null,
          operatorCount: operatorIds.size,
        })
      }
    }

    compute()
    return () => {
      cancelled = true
    }
  }, [schoolId, classes, refreshKey])

  return stats
}
