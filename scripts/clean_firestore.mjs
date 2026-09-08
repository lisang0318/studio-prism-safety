import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBux8WCXuLJosCsts7vmcfpuMLN-aUJ1Z4",
  authDomain: "studioprism-safety-system.firebaseapp.com",
  projectId: "studioprism-safety-system",
  storageBucket: "studioprism-safety-system.firebasestorage.app",
  messagingSenderId: "929269117201",
  appId: "1:929269117201:web:612842a625e46fa7685cb0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanFirestore() {
  try {
    const permitsSnap = await getDocs(collection(db, 'work_permits'));
    console.log(`Found ${permitsSnap.size} work permits in Firestore.`);
    for (const d of permitsSnap.docs) {
      await deleteDoc(doc(db, 'work_permits', d.id));
      console.log(`Deleted permit doc: ${d.id}`);
    }
    console.log('Firestore work_permits collection is now empty.');
    process.exit(0);
  } catch (err) {
    console.error('Firestore cleanup error:', err);
    process.exit(1);
  }
}

cleanFirestore();
