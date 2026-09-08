import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, deleteDoc, doc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

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

const CLEAN_STANDARD_PROGRAMS = [
  {
    id: 'prog-01',
    title: '동상이몽',
    genre: '예능',
    status: '제작중',
    mainStudio: '상암 프리즘타워',
    pd: '안병욱',
    safetyOfficer: '이상욱 안전관리 책임자',
    riskRating: '고위험 (화기·폭파·고소)',
    monthlyPermits: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, monthLabel: `${i + 1}월`, status: '미발행' }))
  },
  {
    id: 'prog-02',
    title: '우리들의 발라드',
    genre: '예능(관객)',
    status: '제작중',
    mainStudio: '인천 넥스트 스튜디오',
    pd: '안정현',
    safetyOfficer: '이상욱 안전관리 책임자',
    riskRating: '고위험 (화기·폭파·고소)',
    monthlyPermits: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, monthLabel: `${i + 1}월`, status: '미발행' }))
  },
  {
    id: 'prog-03',
    title: '골 때리는 그녀들',
    genre: '예능',
    status: '제작중',
    mainStudio: '강화 고인돌 체육관',
    pd: '권형구',
    safetyOfficer: '이상욱 안전관리 책임자',
    riskRating: '고위험 (화기·폭파·고소)',
    monthlyPermits: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, monthLabel: `${i + 1}월`, status: '미발행' }))
  },
  {
    id: 'prog-04',
    title: '틈만나면',
    genre: '예능',
    status: '제작중',
    mainStudio: '상암 프리즘타워',
    pd: '최보필',
    safetyOfficer: '이상욱 안전관리 책임자',
    riskRating: '고위험 (화기·폭파·고소)',
    monthlyPermits: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, monthLabel: `${i + 1}월`, status: '미발행' }))
  },
  {
    id: 'prog-05',
    title: '비서진',
    genre: '예능',
    status: '제작중',
    mainStudio: '상암 프리즘타워',
    pd: '김정욱',
    safetyOfficer: '이상욱 안전관리 책임자',
    riskRating: '고위험 (화기·폭파·고소)',
    monthlyPermits: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, monthLabel: `${i + 1}월`, status: '미발행' }))
  },
  {
    id: 'prog-06',
    title: '런닝맨',
    genre: '예능',
    status: '제작중',
    mainStudio: '상암프리즘타워',
    pd: '김솔마로',
    safetyOfficer: '이상욱 안전관리 책임자',
    riskRating: '고위험 (화기·폭파·고소)',
    monthlyPermits: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, monthLabel: `${i + 1}월`, status: '미발행' }))
  },
  {
    id: 'prog-07',
    title: '미운우리새끼',
    genre: '예능',
    status: '제작중',
    mainStudio: '스튜디오 A (탄현 1세트)',
    pd: '김명하',
    safetyOfficer: '이상욱 안전관리 책임자',
    riskRating: '고위험 (화기·폭파·고소)',
    monthlyPermits: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, monthLabel: `${i + 1}월`, status: '미발행' }))
  },
  {
    id: 'prog-08',
    title: '인기가요',
    genre: '콘서트',
    status: '제작중',
    mainStudio: '등촌동 SBS 공개홀',
    pd: '최보필',
    safetyOfficer: '이상욱 안전관리 책임자',
    riskRating: '고위험 (화기·폭파·고소)',
    monthlyPermits: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, monthLabel: `${i + 1}월`, status: '미발행' }))
  }
];

async function syncAndCleanSchemas() {
  console.log('--- Cleaning and standardizing Firestore Schemas ---');
  
  // 1. Clean and reset Firestore work_permits
  const wpSnap = await getDocs(collection(db, 'work_permits'));
  console.log(`Current Firestore work_permits count: ${wpSnap.size}`);
  for (const d of wpSnap.docs) {
    await deleteDoc(doc(db, 'work_permits', d.id));
  }
  console.log('✓ Firestore work_permits collection purged.');

  // 2. Clean and reset Firestore programs
  const progSnap = await getDocs(collection(db, 'programs'));
  console.log(`Current Firestore programs count: ${progSnap.size}`);
  for (const d of progSnap.docs) {
    await deleteDoc(doc(db, 'programs', d.id));
  }
  for (const p of CLEAN_STANDARD_PROGRAMS) {
    await setDoc(doc(db, 'programs', p.id), p);
  }
  console.log(`✓ Firestore programs collection reset with 8 standardized programs.`);

  // 3. Update local data/safety_db.json
  const dbPath = path.join('C:\\안전관리', 'data', 'safety_db.json');
  let localDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  localDb.workPermits = [];
  localDb.programs = CLEAN_STANDARD_PROGRAMS;
  localDb.workerOpinions = [];
  localDb.inspections = [];
  localDb.contractors = [];
  localDb.tbmRecords = [];
  localDb.incidents = [];
  localDb.safetyLogs = [];
  fs.writeFileSync(dbPath, JSON.stringify(localDb, null, 2), 'utf8');
  console.log('✓ Local data/safety_db.json updated.');

  console.log('--- Schema Verification & Cleanup Complete! ---');
  process.exit(0);
}

syncAndCleanSchemas().catch(e => {
  console.error(e);
  process.exit(1);
});
