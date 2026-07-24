import { Link } from 'react-router-dom'

/** Pulsante "Dashboard" per l'header delle schermate admin secondarie (Impostazioni, Statistiche). */
export default function BackToDashboard() {
  return (
    <Link
      to="/admin"
      className="inline-flex items-center gap-1.5 rounded-lg border border-cream/40 px-3 py-1.5
                 text-sm font-medium text-cream hover:bg-cream/10 transition-colors"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
      Dashboard
    </Link>
  )
}
