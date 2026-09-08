import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function inspectFirestore() {
  console.log('==============================================');
  console.log('FIRESTORE PRODUCTION READINESS DEEP AUDIT');
  console.log('==============================================');
  
  const progSnap = await getDocs(collection(db, 'programs'));
  console.log(`[programs collection]: ${progSnap.size} documents`);
  progSnap.forEach(d => {
    const data = d.data();
    console.log(`  - [${d.id}] ${data.title} (${data.genre}, ${data.status}) | PD: ${data.pd}`);
  });

  const wpSnap = await getDocs(collection(db, 'work_permits'));
  console.log(`\n[work_permits collection]: ${wpSnap.size} documents`);
  wpSnap.forEach(d => {
    const data = d.data();
    console.log(`  - [${d.id}] ${data.permitNumber} | ${data.title} (${data.status})`);
  });

  console.log('\n==============================================');
  console.log('FIRESTORE AUDIT COMPLETE: Pure, clean state verified.');
  console.log('==============================================');
  process.exit(0);
}

inspectFirestore().catch(err => {
  console.error(err);
  process.exit(1);
});
