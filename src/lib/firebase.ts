import { initializeApp } from 'firebase/app'
import { getAuth, inMemoryPersistence, setPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Le chiavi sono identificatori client pubblici (non segreti),
// ma le teniamo in .env così il codice non è legato a un progetto Firebase specifico.
// Esportata: serve a creare un'app secondaria per il provisioning degli account
// (l'admin crea operatori senza perdere la propria sessione).
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

// Istanze uniche di Auth e Firestore condivise da tutta l'applicazione
export const auth = getAuth(app)

// NESSUNA persistenza della sessione: l'accesso NON viene salvato (né localStorage,
// né IndexedDB, né tra le schede). A ogni apertura o ricarica bisogna reinserire le
// credenziali. Così non resta in cache l'accesso di un altro account e non c'è confusione
// quando si prova ad accedere con ruoli/utenti diversi.
setPersistence(auth, inMemoryPersistence)

export const db = getFirestore(app)
