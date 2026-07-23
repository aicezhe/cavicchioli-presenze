import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, collectionGroup, collection, query, where, getDocs } from 'firebase/firestore'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync(new URL('./.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=')).map((l) => l.split(/=(.*)/s).slice(0, 2)),
)
const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY, authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID, appId: env.VITE_FIREBASE_APP_ID,
})
const auth = getAuth(app); const db = getFirestore(app)
const cred = await signInWithEmailAndPassword(auth, 'operatore@cavicchioli.test', 'Presenze2026!')
const uid = cred.user.uid
console.log('operatore uid:', uid)

const SCHOOL = 'ndsFTcHL9f5BFO3JevsD'

try {
  const s = await getDocs(query(collection(db, 'schools', SCHOOL, 'classes'), where('operatorIds', 'array-contains', uid)))
  console.log('SUBCOLLECTION ok:', s.docs.map((d) => d.data().name))
} catch (e) { console.log('SUBCOLLECTION FAIL:', e.code) }

try {
  const g = await getDocs(query(collectionGroup(db, 'classes'), where('operatorIds', 'array-contains', uid)))
  console.log('COLLECTIONGROUP ok:', g.docs.map((d) => d.data().name))
} catch (e) { console.log('COLLECTIONGROUP FAIL:', e.code) }
process.exit(0)
