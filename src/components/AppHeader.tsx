import { useState } from 'react'
import type { ReactNode } from 'react'
import Crest from './Crest'

type AppHeaderProps = {
  /** landing: scudo + nome centrati, senza strumenti */
  centered?: boolean
  /** cabinet: mostra ricerca + menu hamburger accanto al contenuto a destra */
  tools?: boolean
  /** cabinet: contenuto extra a destra (opzionale) */
  right?: ReactNode
  /** cabinet: contenuto del menu hamburger (riceve una funzione per chiuderlo) */
  menu?: (close: () => void) => ReactNode
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
    centered → landing; altrimenti cabina con ricerca e menu hamburger (impostazioni, logout). */
export default function AppHeader({ centered, tools, right, menu }: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

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
              <div className="relative">
                <button
                  aria-label="Menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((v) => !v)}
                  className="opacity-80 hover:opacity-100 transition-opacity"
                >
                  <MenuIcon />
                </button>

                {menuOpen && menu && (
                  <>
                    {/* Overlay per chiudere cliccando fuori */}
                    <div className="fixed inset-0 z-40" onClick={closeMenu} />
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gold/40 bg-white text-ink shadow-lg z-50 py-1.5">
                      {menu(closeMenu)}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
