import { useEffect, useMemo, useState } from 'react'
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
 *
 * Quando si ricalcola: solo quando cambia l'INSIEME delle classi (aggiunta/rimozione),
 * non ad ogni aggiornamento dell'array `classes`. `classes` cambia riferimento anche quando
 * si assegna un operatore: senza la chiave stabile qui sotto rileggeremmo tutti i bambini per
 * niente. classIdsKey (memoizzata sugli id) fa scattare la lettura solo su add/remove; le
 * modifiche ai bambini arrivano invece tramite refreshKey (refreshStats dall'admin).
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

  // Chiave stabile: cambia SOLO quando l'insieme delle classi cambia (add/remove),
  // non quando cambia il riferimento dell'array (es. assegnazione operatore).
  const classIdsKey = useMemo(() => classes.map((c) => c.id).sort().join(','), [classes])

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
    // Dipende da classIdsKey (non da `classes`): rilegge solo su cambio scuola,
    // add/remove classe o refresh esplicito dopo una modifica ai bambini.
    // `classes` è usato dentro compute() ma il suo contenuto rilevante (gli id) è
    // catturato da classIdsKey, quindi la lettura resta corretta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId, classIdsKey, refreshKey])

  return { classCount, childrenCount: aggregate.childrenCount, presentPct: aggregate.presentPct, operatorCount }
}
