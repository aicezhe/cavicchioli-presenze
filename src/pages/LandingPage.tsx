import { PlatformCrest } from '../components/PlatformCrest'
import NavCard from '../components/NavCard'

/**
 * Landing di piattaforma NOTA (livello sopra le singole scuole):
 * si sceglie se entrare come amministratore o selezionare una scuola.
 * Sfondo tinta unita scura (ink), senza immagine.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-ink">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Emblema piattaforma + sottotitolo */}
        <PlatformCrest variant="full" size={128} color="#F8F6F2" />
        <p className="mt-3 text-sm text-cream/70 font-sans">
          Piattaforma presenze scolastiche
        </p>

        <h1 className="mt-12 font-serif text-3xl sm:text-4xl font-semibold text-cream text-center">
          Come vuoi accedere?
        </h1>
        <div className="mt-4 h-px w-24 bg-dustyblue" aria-hidden="true" />

        <div className="mt-10 sm:mt-14 flex flex-col sm:flex-row gap-5 sm:gap-6 w-full max-w-2xl items-stretch justify-center">
          <NavCard to="/admin/login" label="Amministratore" />
          <NavCard to="/schools" label="Seleziona la tua scuola" />
        </div>
      </main>
    </div>
  )
}
