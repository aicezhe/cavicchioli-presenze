import type { ReactNode } from 'react'
import Crest from './Crest'

type AppHeaderProps = {
  /** landing: scudo + nome centrati, senza strumenti */
  centered?: boolean
  /** cabinet: mostra ricerca + menu hamburger (segnaposto) accanto al contenuto a destra */
  tools?: boolean
  /** cabinet: contenuto a destra (es. nome utente + logout) */
  right?: ReactNode
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.5" y2="16.5" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

/** Intestazione condivisa: scudo + nome scuola su fondo bordeaux con linea dorata.
    centered → landing (tutto al centro); altrimenti → cabina personale con strumenti a destra. */
export default function AppHeader({ centered, tools, right }: AppHeaderProps) {
  return (
    <header className="bg-crimson text-cream border-b-2 border-gold">
      <div
        className={
          'mx-auto max-w-5xl px-4 py-3 flex items-center gap-3 ' +
          (centered ? 'justify-center' : '')
        }
      >
        <Crest size={40} variant="compact" />
        <span className="font-serif text-xl font-semibold">Cavicchioli</span>

        {!centered && (
          <div className="ml-auto flex items-center gap-4">
            {tools && (
              <button aria-label="Cerca" className="opacity-80 hover:opacity-100 transition-opacity">
                <SearchIcon />
              </button>
            )}
            {right}
            {tools && (
              <button aria-label="Menu" className="opacity-80 hover:opacity-100 transition-opacity">
                <MenuIcon />
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
