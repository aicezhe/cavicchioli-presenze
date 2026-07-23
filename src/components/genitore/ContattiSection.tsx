import { useUsersByRole } from '../../hooks/useUsersByRole'

/** Rubrica: gli operatori del pre/post-scuola con email e telefono, per contattarli. */
export default function ContattiSection() {
  const operators = useUsersByRole('operatore')

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-serif text-xl font-semibold">Contatta un operatore</h2>
        <p className="text-sm text-warmgray">
          Operatori del pre e post-scuola. Puoi scrivere o chiamare.
        </p>
      </div>

      {operators.length === 0 ? (
        <p className="text-sm text-warmgray">Nessun operatore disponibile al momento.</p>
      ) : (
        <ul className="space-y-3">
          {operators.map((op) => (
            <li key={op.id} className="bg-white rounded-xl border border-dustyblue/40 px-5 py-4">
              <p className="font-medium">{op.name}</p>
              <div className="mt-2 space-y-1 text-sm">
                <a
                  href={`mailto:${op.email}`}
                  className="flex items-center gap-2 text-dustyblue hover:underline"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </svg>
                  {op.email}
                </a>
                {op.phone ? (
                  <a
                    href={`tel:${op.phone.replace(/\s+/g, '')}`}
                    className="flex items-center gap-2 text-dustyblue hover:underline"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.5-1.1a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z" />
                    </svg>
                    {op.phone}
                  </a>
                ) : (
                  <p className="flex items-center gap-2 text-warmgray">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.5-1.1a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z" />
                    </svg>
                    Telefono non disponibile
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
