// Ruoli previsti: admin — amministrazione della scuola, operatore — educatore
// del pre/post-scuola, genitore — genitore dell'alunno
export type Role = 'admin' | 'operatore' | 'genitore'

// Etichette dei ruoli mostrate nell'interfaccia (unico punto in cui sono definite)
export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Amministratore',
  operatore: 'Operatore',
  genitore: 'Genitore',
}

export type UserProfile = {
  role: Role
  name: string
  email: string
}

export type School = {
  name: string
  adminIds: string[]
}

export type SchoolClass = {
  name: string
  operatorIds: string[]
}

export type Child = {
  firstName: string
  lastName: string
  /** Stringa ISO YYYY-MM-DD */
  dob: string
  /** Email dei genitori indicate dall'admin: è il collegamento autorevole,
      verificabile contro request.auth.token.email nelle regole (vedi firestore.rules) */
  parentEmails: string[]
  /** uid dei genitori già registrati, risolti dalle email — comodità per le query */
  parentIds: string[]
}

export type AttendanceRecord = {
  present: boolean
  markedBy: string
  timestamp: number
}

/** Documento Firestore con il suo id (i doc non contengono il proprio id) */
export type WithId<T> = T & { id: string }
