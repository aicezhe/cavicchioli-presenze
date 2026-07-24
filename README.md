# NOTA — Piattaforma presenze pre/post-scuola

Piattaforma SaaS per digitalizzare le presenze del servizio di **pre-scuola e post-scuola**:
l'operatore registra ogni giorno chi viene preso in carico, il genitore verifica giorno per
giorno le presenze del proprio figlio, l'amministratore gestisce scuole, classi, bambini e
operatori. Progetto realizzato per il colloquio tecnico **byte3**.

> **Perché "NOTA"?** Ho scelto questo nome perché in **latino** *nota* significa **segno,
> marchio, annotazione** — cioè **"segnare/prendere nota"**. È esattamente ciò che fa la
> piattaforma: *segnare le presenze*. Un nome breve, in tema e facile da ricordare.

🔗 **Demo live:** https://schoolgiaccomo.web.app
📦 **Repository:** https://github.com/aicezhe/cavicchioli-presenze

---

## Stack tecnologico e perché

| Tecnologia | Motivazione |
|---|---|
| **React** (+ Vite) | L'ho scelto perché è **veloce, comodo e ottimo per comporre e modificare l'interfaccia**: per me è la migliore libreria su cui lavorare per il frontend. L'approccio a componenti riusabili si adatta bene a un'app con schermate simili per i tre ruoli. |
| **TypeScript** | L'ho aggiunto **per evitare errori**: i tipi (ruoli, documenti, form) mi hanno fatto scoprire i problemi a compile-time invece che a runtime. |
| **Firebase** (Authentication + Firestore) | Come da requisito. Auth per l'accesso, Firestore per i dati in tempo reale. |
| **Firebase Security Rules** | Cuore della **segregazione dei dati**: i permessi sono applicati sul server, non solo nell'app. |
| **Tailwind CSS** | Stile rapido e coerente tramite un tema centralizzato (palette in `src/index.css`). |
| **framer-motion** | Animazioni fluide per una UX più piacevole. |
| **react-router-dom** | Routing tra landing, login per ruolo e le tre dashboard. |
| **Vitest** | Test unitari sulla logica di dominio. |

---

## Ruoli e permessi

Tre tipi di utente, con privilegi diversi:

- **Amministratore** — crea e gestisce le **scuole**; dentro ogni scuola crea le **classi**;
  dentro ogni classe inserisce i **bambini** con la loro anagrafica (nome, cognome, data di
  nascita, genitori di riferimento). Abilita gli **operatori**, associandoli solo a
  determinate classi.
- **Operatore** — ogni giorno fa l'**appello** (check-in dei bambini presenti, sessione
  mattina/pomeriggio). Vede e gestisce **solo** le classi a cui è stato abilitato.
- **Genitore** — visualizza **giorno per giorno** le presenze dei **propri** figli (e solo
  dei propri).

### Segregazione dei dati
È il punto su cui ho lavorato con più attenzione. Ogni ruolo vede e fa solo ciò che gli
compete, garantito a **due livelli**:
1. **Lato applicazione** — le query filtrano a monte (es. l'operatore interroga solo le
   classi con il proprio uid in `operatorIds`; il genitore solo i bambini con la propria
   email in `parentEmails`).
2. **Security Rules Firestore** (`firestore.rules`) — anche modificando il client nel
   browser, il server rifiuta l'accesso ai dati non di competenza. La separazione è
   garantita dal database, non dall'interfaccia.

---

## Modello dati (Firestore)

```
schools/{schoolId}                       name, adminIds[], primaryColor?, emblemInitials?
  └─ classes/{classId}                   name, operatorIds[]
       └─ children/{childId}             firstName, lastName, dob, parentEmails[], parentIds[]
            └─ attendance/{YYYY-MM-DD}    morning, evening, markedBy, timestamp

users/{uid}                              role, name, email, phone?, canManageRoster?, securityPin?
```

- Il collegamento **genitore ↔ bambino** è l'**email** (`parentEmails`): è la fonte
  autorevole, verificabile dalle Security Rules contro `request.auth.token.email`. Così il
  genitore vede il figlio anche se si registra dopo, senza riconciliare gli uid.
- L'operatore trova le proprie classi in qualunque scuola con una query **collectionGroup**
  su `operatorIds` (un operatore può lavorare in **più scuole**, con selettore dedicato).

---

## Scelte di coding e qualità

- **`useMemo` per il conteggio veloce di studenti e classi** — le statistiche admin (numero
  bambini, % presenti) richiedono molte letture. Ho usato una *chiave stabile* memoizzata
  sugli id delle classi, così il ricalcolo pesante scatta **solo** quando si aggiunge/toglie
  una classe, non a ogni aggiornamento dell'array (es. assegnazione di un operatore).
- **Presenze di oggi con default prudente** — il conteggio dei presenti parte da un valore
  `null` (la UI mostra "…") finché il ricalcolo non finisce, così non restano mai a schermo i
  numeri della scuola precedente. Inoltre leggo **solo** il documento `attendance/{oggi}` di
  ogni bambino (non l'intero storico) e in **parallelo** (`Promise.all`), non in cascata.
- **TypeScript** ovunque per evitare errori di tipo.
- **Pulizia del codice** — componenti riusabili, un hook dedicato per ogni accesso ai dati,
  commenti che spiegano il *perché* delle scelte, nessun codice morto.
- **Cache-control** — `index.html` servito `no-store` (sempre fresco) e asset con hash
  `immutable`, più sessione Auth **non persistente** (`inMemoryPersistence`): così non resta
  in cache l'accesso di un altro account e **non c'è confusione tra utenti** al login.
- **Test** — un paio di test unitari (Vitest) sui helper puri di dominio, per pulizia e come
  rete di sicurezza sulle regole di fallback (`npm test`).

---

## Problemi risolti durante lo sviluppo (storie dal codice)

Alcune cose non sono venute giuste al primo colpo: le racconto perché mostrano come ho
ragionato e sistemato i problemi mano a mano che li notavo provando l'app.

- **Le statistiche caricavano lente → `useMemo`.** Il conteggio di bambini e classi rileggeva,
  *in sequenza*, l'intero storico presenze di ogni bambino. L'ho reso **parallelo**
  (`Promise.all`) e ho letto **solo il documento di oggi**. Restava un problema: il ricalcolo
  scattava a ogni aggiornamento dell'array `classes` — anche solo assegnando un operatore, che
  cambia il *riferimento* dell'array ma non l'insieme delle classi. Ho introdotto una **chiave
  stabile memoizzata con `useMemo`** sugli id delle classi: ora la lettura pesante parte
  **solo** quando si aggiunge o toglie davvero una classe. Stesso principio poi esteso ai
  grafici delle statistiche (aggregazioni memoizzate + letture limitate agli ultimi ~13 mesi):
  cambiare *giorno/settimana/mese* riaggrega all'istante, senza rileggere dal database.

- **Le barre del grafico erano tutte "schiacciate".** Apparivano basse e uguali: le altezze in
  percentuale non si risolvevano perché il contenitore non aveva un'altezza definita. Dando
  un'altezza certa alle colonne le barre sono tornate in scala (più gradiente, angoli
  arrotondati e crescita animata).

- **"L'operatore vede solo una scuola".** All'inizio sembrava un problema di cache. Verificando
  i dati reali ho scoperto che era un **limite vero**: un operatore può essere assegnato a
  classi di **più scuole**. Ho aggiunto un **selettore scuola** nella schermata operatore, con
  le classi filtrate per scuola e il tema che segue quella scelta.

- **Confusione tra account "rimasti in cache".** Passando da un ruolo all'altro capitava di
  ritrovarsi la sessione precedente. Ho **disattivato la persistenza** della sessione
  (`inMemoryPersistence`), aggiunto un **cache-control** severo (`index.html` sempre fresco) e
  **rimontato l'albero autenticato sull'uid**: al cambio utente non sopravvive nulla del
  precedente e le credenziali sono richieste ogni volta.

- **Il tema della scuola "non si aggiornava".** Ho verificato che la lettura era già in tempo
  reale (`onSnapshot`) e i dati sul server corretti: nella maggior parte dei casi era la
  **cache del browser**. Ho comunque irrobustito il codice azzerando il tema a ogni cambio di
  scuola, così non mostra mai i dati di una scuola precedente durante la transizione.

---

## Design e UX

- **Colore principale — dusty blue.** L'ho scelto perché è un colore **di tendenza** e allo
  stesso tempo trasmette **sicurezza e calma**: esattamente il tono giusto per una
  piattaforma che gestisce la presa in carico dei bambini.
- **Colori secondari** scelti per **contrasto**, con **tonalità pastello** per le singole
  scuole, così da mantenere un *mood* cromatico coerente e riconoscibile per ogni scuola.
- **Emblema/logo** — ho **generato la simbologia con l'AI a partire da un mio schizzo
  personale su iPad**: rappresenta uno **scudo/stemma**, a richiamare l'idea di **sicurezza**
  e protezione.
- **Animazioni** — transizioni ed effetti curati (framer-motion) per una UX più piacevole,
  senza appesantire.
- **Solo italiano (scelta consapevole).** Ho pensato di aggiungere l'inglese ma ho deciso di
  **non** farlo: le parole in interfaccia sono poche e chiare, così anche i **genitori
  stranieri** si orientano senza difficoltà.

---

## Statistiche presenze (funzionalità extra)

Dal menu dell'amministratore c'è una sezione **Statistiche presenze** con un **grafico a
barre** delle presenze raggruppabili per **giorno, settimana e mese**, più un riepilogo
(presenze totali, giorni con presenze, numero di bambini).

**Perché l'ho fatta:** il registro giornaliero risponde alla domanda "chi c'è oggi?", ma da
solo non mostra **l'andamento nel tempo**. Aggregando le presenze per periodo, l'amministratore
vede a colpo d'occhio i **trend** (giorni/settimane più o meno frequentati), utili per
organizzare il servizio. È anche la **base** su cui in futuro si potrebbero costruire viste
dedicate ai genitori. Il grafico è realizzato **senza librerie esterne** (solo CSS), così ogni
riga è spiegabile e il bundle resta autonomo; l'aggregazione dei dati è memoizzata con `useMemo`.

---

## Nota sui dati (database di test)

Il database è **di prova / fittizio**, quindi:
- **Non c'è la verifica email reale** al momento — so come implementarla e, su richiesta,
  posso aggiungerla.
- Ho creato **pochi** operatori e genitori di test, per **evitare confusione** durante la
  demo. Su richiesta posso **espandere il database** con più utenti e scuole.

---

## Cosa ho imparato

Lavorando a questo progetto ho **approfondito Firebase** e studiato **un nuovo servizio** che
non avevo ancora usato a fondo (Security Rules e query collectionGroup in particolare): è
stato **interessante** capire come spostare la logica dei permessi sul database.

---

## Cosa farei con più tempo

- Espandere il **database** con più dati realistici.
- Implementare la **registrazione reale** (con verifica email).
- Dedicare **più attenzione al design**.
- Aggiungere **più test** (inclusi i tre flussi e le Security Rules via emulatore).

---

## Come eseguirlo in locale

```bash
# 1. Installa le dipendenze
npm install

# 2. Configura Firebase: copia .env.example in .env e inserisci le chiavi del progetto
cp .env.example .env

# 3. Avvia in sviluppo
npm run dev

# Altri comandi
npm test        # test unitari (Vitest)
npm run lint    # lint (oxlint)
npm run build   # build di produzione
```

> Le chiavi in `.env` sono identificatori client pubblici di Firebase (non segreti): la
> protezione dei dati è garantita dalle Security Rules, non dalla segretezza della config.

---

## Struttura del progetto

```
src/
  pages/         landing, login, e le dashboard admin/operatore/genitore
  components/    UI riusabile (header, emblema, form, calendario presenze, …)
  hooks/         un hook per ogni accesso ai dati (classi, bambini, presenze, statistiche…)
  context/       AuthContext (sessione + profilo/ruolo)
  lib/           inizializzazione Firebase
  types.ts       tipi di dominio e helper puri (testati)
firestore.rules  regole di sicurezza (segregazione dei dati)
```
