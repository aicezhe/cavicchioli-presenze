import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { AttendanceRecord } from '../types'

export type AttendanceStats = {
  /** Presenze per giorno: { 'YYYY-MM-DD': numero di bambini presenti quel giorno } */
  byDate: Record<string, number>
  /** Numero totale di bambini della scuola (per contestualizzare i numeri) */
  childrenCount: number
  loading: boolean
}

/**
 * Aggrega le presenze di TUTTA la scuola per data, per la sezione Statistiche.
 *
 * Un "presente" = il bambino era presente ad almeno una sessione (mattina o pomeriggio)
 * in quel giorno. Le letture partono in parallelo (Promise.all), non in cascata. Uso getDocs
 * (foto statica) e non onSnapshot: è una vista analitica, non serve aggiornarla al millisecondo.
 */
export function useAttendanceStats(schoolId: string | undefined): AttendanceStats {
  const [byDate, setByDate] = useState<Record<string, number>>({})
  const [childrenCount, setChildrenCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!schoolId) {
      setByDate({})
      setChildrenCount(0)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setByDate({})

    async function run() {
      // 1) Tutti i bambini della scuola (una lettura per classe, in parallelo)
      const classesSnap = await getDocs(collection(db, 'schools', schoolId!, 'classes'))
      const childrenSnaps = await Promise.all(
        classesSnap.docs.map((c) => getDocs(collection(c.ref, 'children'))),
      )
      if (cancelled) return
      const childRefs = childrenSnaps.flatMap((s) => s.docs.map((d) => d.ref))

      // 2) Presenze di ogni bambino (tutto lo storico), in parallelo
      const attSnaps = await Promise.all(childRefs.map((ref) => getDocs(collection(ref, 'attendance'))))
      if (cancelled) return

      const map: Record<string, number> = {}
      for (const snap of attSnaps) {
        for (const d of snap.docs) {
          const rec = d.data() as AttendanceRecord
          if (rec.morning === true || rec.evening === true) {
            map[d.id] = (map[d.id] ?? 0) + 1 // d.id è la data YYYY-MM-DD
          }
        }
      }

      setByDate(map)
      setChildrenCount(childRefs.length)
      setLoading(false)
    }

    run().catch((err) => {
      console.error('Impossibile calcolare le statistiche:', err)
      if (!cancelled) setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [schoolId])

  return { byDate, childrenCount, loading }
}
