import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { AttendanceRecord } from '../types'

/**
 * Tutte le presenze di un bambino, indicizzate per data (YYYY-MM-DD).
 *
 * È una query sulla sottocollezione attendance a percorso FISSO (il bambino è noto),
 * quindi la regola isChildParent (get sul documento del bambino) la autorizza per il
 * genitore. onSnapshot così il calendario resta sempre aggiornato.
 */
export function useChildAttendance(
  schoolId: string | undefined,
  classId: string | undefined,
  childId: string | undefined,
) {
  const [records, setRecords] = useState<Record<string, AttendanceRecord>>({})

  useEffect(() => {
    if (!schoolId || !classId || !childId) return
    const ref = collection(db, 'schools', schoolId, 'classes', classId, 'children', childId, 'attendance')
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const map: Record<string, AttendanceRecord> = {}
        snap.docs.forEach((d) => {
          map[d.id] = d.data() as AttendanceRecord
        })
        setRecords(map)
      },
      (err) => console.error('Impossibile caricare le presenze:', err),
    )
    return unsub
  }, [schoolId, classId, childId])

  return records
}
