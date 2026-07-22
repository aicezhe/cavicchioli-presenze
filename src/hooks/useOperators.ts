import { useUsersByRole } from './useUsersByRole'

/**
 * Tutti gli utenti registrati con ruolo 'operatore'.
 * Servono all'admin per assegnarli alle classi (l'operatore va registrato prima:
 * lo staff è provisioned, quindi il collegamento è diretto via uid).
 */
export function useOperators() {
  return useUsersByRole('operatore')
}
