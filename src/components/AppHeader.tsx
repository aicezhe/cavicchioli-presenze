import { useState } from 'react'
import type { ReactNode } from 'react'
import { PlatformCrest } from './PlatformCrest'

type AppHeaderProps = {
  /** landing: scudo + nome centrati, senza strumenti */
  centered?: boolean
  /** cabinet: mostra il menu hamburger accanto al contenuto a destra */
  tools?: boolean
  /** cabinet: se fornito, mostra il pulsante di ricerca che invoca questa callback */
  onSearchClick?: () => void
  /** cabinet: contenuto extra a destra (opzionale) */
  right?: ReactNode
  /** cabinet: contenuto del menu hamburger (riceve una funzione per chiuderlo) */
  menu?: (close: () => void) => ReactNode
  /** Emblema a sinistra. Default: scudo scuola compatto */
  emblem?: ReactNode
  /** Nome del brand a sinistra. Default: "Cavicchioli" */
  title?: string
  /** Colore di sfondo dell'header (colore della scuola). Default: dusty-blue */
  bgColor?: string
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
export default function AppHeader({ centered, tools, onSearchClick, right, menu, emblem, title, bgColor }: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <header
      className={'text-cream border-b border-black/10 ' + (bgColor ? '' : 'bg-dustyblue')}
      style={bgColor ? { backgroundColor: bgColor } : undefined}
    >
      <div
        className={
          'mx-auto max-w-5xl px-4 py-3 flex items-center gap-3 ' +
          (centered ? 'justify-center' : '')
        }
      >
        {/* Default piattaforma NOTA (le cabine passano emblema/nome della loro scuola) */}
        {emblem ?? <PlatformCrest variant="icon" size={30} color="#F8F6F2" />}
        <span className="font-serif text-xl font-semibold">{title ?? 'NOTA'}</span>

        {!centered && (
          <div className="ml-auto flex items-center gap-4">
            {onSearchClick && (
              <button
                aria-label="Cerca"
                onClick={onSearchClick}
                className="opacity-80 hover:opacity-100 transition-opacity"
              >
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
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-dustyblue/40 bg-white text-ink shadow-lg z-50 py-1.5">
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
