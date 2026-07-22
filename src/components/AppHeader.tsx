import type { ReactNode } from 'react'
import Crest from './Crest'

type AppHeaderProps = {
  /** Contenuto a destra: ricerca/menu sulla landing, utente + logout nel dashboard */
  right?: ReactNode
}

/** Intestazione condivisa: scudo + nome scuola su fondo bordeaux con linea dorata.
    Usata sulla landing e nei dashboard per coerenza visiva. */
export default function AppHeader({ right }: AppHeaderProps) {
  return (
    <header className="bg-crimson text-cream border-b-2 border-gold">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-3">
        <Crest size={40} variant="compact" />
        <span className="font-serif text-xl font-semibold">Cavicchioli</span>
        {right && <div className="ml-auto flex items-center gap-4">{right}</div>}
      </div>
    </header>
  )
}
