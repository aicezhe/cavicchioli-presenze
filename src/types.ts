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
  /** Telefono di contatto (usato per gli operatori nella rubrica dei genitori) */
  phone?: string
}

export type School = {
  name: string
  adminIds: string[]
  /** Colore identità della scuola (emblema, bordi, temi). Default: dusty-blue */
  primaryColor?: string
  /** Iniziali mostrate sull'emblema. Default: derivate dal nome */
  emblemInitials?: string
}

/** Colore di default della piattaforma quando la scuola non ne ha uno */
export const DEFAULT_SCHOOL_COLOR = '#6E859C'

/** Colore effettivo della scuola (con fallback) */
export function schoolColor(s: Pick<School, 'primaryColor'>): string {
  return s.primaryColor || DEFAULT_SCHOOL_COLOR
}

/** Iniziali dell'emblema: quelle impostate, altrimenti derivate dal nome (max 2 lettere) */
export function schoolInitials(s: Pick<School, 'name' | 'emblemInitials'>): string {
  if (s.emblemInitials) return s.emblemInitials
  const letters = s.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
  return letters || '—'
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

// Due sessioni di pre/post-scuola: mattina e pomeriggio, registrate separatamente
export type Session = 'morning' | 'evening'

export const SESSION_LABELS: Record<Session, string> = {
  morning: 'Mattina',
  evening: 'Pomeriggio',
}

export type AttendanceRecord = {
  /** presenza al pre-scuola (mattina) */
  morning: boolean
  /** presenza al post-scuola (pomeriggio) */
  evening: boolean
  markedBy: string
  timestamp: number
}

/** Documento Firestore con il suo id (i doc non contengono il proprio id) */
export type WithId<T> = T & { id: string }
