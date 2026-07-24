import { useEffect, useState } from 'react'
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { AttendanceRecord, SchoolClass, WithId } from '../types'

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
 * si aggiornano all'istante. childrenCount e presentPct richiedono letture su molte
 * sotto-collezioni: durante il ricalcolo valgono null (la UI mostra "…"), così non restano
 * mai i numeri della scuola precedente. Uso getDoc/getDocs e non onSnapshot perché è un totale
 * che non serve aggiornare al millisecondo; ricalcolo al cambio classi o dopo una mutazione.
 *
 * Prestazioni: tutte le letture partono in parallelo (Promise.all), non in cascata, e per la
 * presenza di oggi leggo il SINGOLO documento attendance/{oggi}, non l'intero storico del
 * bambino. Così il ricalcolo resta veloce anche con molte classi e molti bambini.
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
      const today = todayIso()

      // 1) Elenco bambini di ogni classe, in parallelo (una lettura per classe).
      const childrenSnaps = await Promise.all(
        classes.map((cls) =>
          getDocs(collection(db, 'schools', schoolId!, 'classes', cls.id, 'children')),
        ),
      )
      if (cancelled) return

      const childrenCount = childrenSnaps.reduce((sum, snap) => sum + snap.size, 0)

      // 2) Presenza di OGGI: leggo il singolo doc attendance/{oggi} di ogni bambino,
      //    tutti in parallelo. Niente storico completo, niente cascata.
      const attRefs = classes.flatMap((cls, i) =>
        childrenSnaps[i].docs.map((child) =>
          getDoc(doc(db, 'schools', schoolId!, 'classes', cls.id, 'children', child.id, 'attendance', today)),
        ),
      )
      const attDocs = await Promise.all(attRefs)
      if (cancelled) return

      const presentCount = attDocs.reduce((count, snap) => {
        const rec = snap.data() as AttendanceRecord | undefined
        // Presente oggi = presente ad almeno una sessione (mattina o pomeriggio)
        return rec?.morning === true || rec?.evening === true ? count + 1 : count
      }, 0)

      setAggregate({
        childrenCount,
        presentPct: childrenCount > 0 ? Math.round((presentCount / childrenCount) * 100) : null,
      })
    }

    compute()
    return () => {
      cancelled = true
    }
  }, [schoolId, classes, refreshKey])

  return { classCount, childrenCount: aggregate.childrenCount, presentPct: aggregate.presentPct, operatorCount }
}
