import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { SchoolClass, WithId } from '../types'

export type AdminStats = {
  classCount: number
  /** null mentre l'aggregato è in ricalcolo (così non si mostrano i numeri della scuola precedente) */
  childrenCount: number | null
  /** % di bambini presenti oggi (0–100); null se in ricalcolo o senza bambini */
  presentPct: number | null
  operatorCount: number
}

const todayIso = () => new Date().toISOString().slice(0, 10)

/**
 * Statistiche aggregate della scuola.
 *
 * classCount e operatorCount si ricavano SUBITO da `classes` (sincroni) → al cambio scuola
 * si aggiornano all'istante. childrenCount e presentPct richiedono getDocs su molte
 * sotto-collezioni: durante il ricalcolo valgono null (la UI mostra "…"), così non restano
 * mai i numeri della scuola precedente. Uso getDocs e non onSnapshot perché è un totale che
 * non serve aggiornare al millisecondo; ricalcolo al cambio classi o dopo una mutazione.
 */
export function useAdminStats(
  schoolId: string | undefined,
  classes: WithId<SchoolClass>[],
  refreshKey: number,
): AdminStats {
  const [aggregate, setAggregate] = useState<{ childrenCount: number | null; presentPct: number | null }>({
    childrenCount: null,
    presentPct: null,
  })

  // Sincroni: sempre allineati alla scuola attiva
  const classCount = classes.length
  const operatorIds = new Set<string>()
  classes.forEach((c) => c.operatorIds?.forEach((id) => operatorIds.add(id)))
  const operatorCount = operatorIds.size

  useEffect(() => {
    if (!schoolId) {
      setAggregate({ childrenCount: 0, presentPct: null })
      return
    }
    let cancelled = false
    setAggregate({ childrenCount: null, presentPct: null }) // "…" durante il ricalcolo

    async function compute() {
      let childrenCount = 0
      let presentCount = 0

      for (const cls of classes) {
        const childrenSnap = await getDocs(
          collection(db, 'schools', schoolId!, 'classes', cls.id, 'children'),
        )
        childrenCount += childrenSnap.size

        for (const child of childrenSnap.docs) {
          const attSnap = await getDocs(
            collection(db, 'schools', schoolId!, 'classes', cls.id, 'children', child.id, 'attendance'),
          )
          // Presente oggi = presente ad almeno una sessione (mattina o pomeriggio)
          const today = attSnap.docs.find((a) => a.id === todayIso())?.data()
          if (today?.morning === true || today?.evening === true) presentCount += 1
        }
      }

      if (!cancelled) {
        setAggregate({
          childrenCount,
          presentPct: childrenCount > 0 ? Math.round((presentCount / childrenCount) * 100) : null,
        })
      }
    }

    compute()
    return () => {
      cancelled = true
    }
  }, [schoolId, classes, refreshKey])

  return { classCount, childrenCount: aggregate.childrenCount, presentPct: aggregate.presentPct, operatorCount }
}
