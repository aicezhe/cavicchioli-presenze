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
  /** OPERATORE: se true può modificare la composizione (roster) delle proprie classi,
      come un mini-admin. Assegnato dall'amministratore. */
  canManageRoster?: boolean
  /** ADMIN: chiave di sicurezza personale (PIN) per confermare i cambi password.
      Leggibile solo dall'admin stesso (vedi regole users). */
  securityPin?: string
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

/** Palette pronta per la scelta del colore scuola (niente picker libero) */
export const SCHOOL_COLORS: { name: string; value: string }[] = [
  { name: 'Blu polvere', value: '#6E859C' },
  { name: 'Terracotta', value: '#B5654A' },
  { name: 'Verde bosco', value: '#4F7060' },
  { name: 'Prugna', value: '#7A5C7E' },
  { name: 'Ocra', value: '#B08A3E' },
  { name: 'Ardesia', value: '#55606E' },
]

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

/** Scelte per comporre il nome classe (niente testo libero): anno + sezione. */
export const CLASS_YEARS = [1, 2, 3, 4, 5] as const
export const CLASS_SECTIONS = ['A', 'B', 'C', 'D', 'E'] as const

/** Nome classe canonico dai selettori, es. (2, 'B') → "2ª B". */
export function makeClassName(year: number, section: string): string {
  return `${year}ª ${section}`
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
