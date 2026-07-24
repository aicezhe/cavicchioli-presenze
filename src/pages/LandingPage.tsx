import { PlatformCrest } from '../components/PlatformCrest'
import NavCard from '../components/NavCard'
import BrickBackground from '../components/BrickBackground'

/**
 * Landing di piattaforma NOTA (livello sopra le singole scuole):
 * si sceglie se entrare come amministratore o selezionare una scuola.
 * Fondo scuro (ink) con muri di mattoni animati agli angoli.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-ink relative overflow-hidden">
      <BrickBackground />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-16">
        {/* Emblema piattaforma + sottotitolo */}
        <PlatformCrest variant="full" size={164} color="#F8F6F2" />
        <p className="mt-5 text-sm tracking-wide text-cream/70 font-sans">
          Piattaforma presenze scolastiche
        </p>

        <h1 className="mt-16 font-serif text-3xl sm:text-4xl font-semibold text-cream text-center">
          Come vuoi accedere?
        </h1>
        <div className="mt-4 h-px w-24 bg-dustyblue" aria-hidden="true" />

        {/* Scelta del ruolo: la scuola si ricava automaticamente dall'account al login.
            In riga su desktop (in larghezza), impilate su mobile. */}
        <div className="mt-12 sm:mt-14 flex flex-col sm:flex-row gap-4 sm:gap-6 w-full max-w-4xl items-stretch justify-center">
          <NavCard to="/login/admin" label="Amministratore" />
          <NavCard to="/login/operatore" label="Operatore" />
          <NavCard to="/login/genitore" label="Genitore" />
        </div>
      </main>
    </div>
  )
}
