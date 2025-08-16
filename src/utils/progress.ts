import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

interface MemorizationData {
  userId: string;
  surahNumber: number;
  surahName: string | null;
  memorizedAyahs: number[];
  updatedAt: Timestamp;
}

export async function getMemorizedAyahs(userId: string, surahNumber: number): Promise<number[]> {
  const ref = doc(db, 'memorization', `${userId}_${surahNumber}`);
  const snap = await getDoc(ref);
  if (!snap.exists()) return [];
  const data = snap.data() as MemorizationData;
  return Array.isArray(data.memorizedAyahs) ? data.memorizedAyahs : [];
}

export async function toggleMemorizedAyah(userId: string, surahNumber: number, ayahNumber: number, surahName?: string): Promise<number[]> {
  const ref = doc(db, 'memorization', `${userId}_${surahNumber}`);
  const snap = await getDoc(ref);
  let memorized: number[] = [];
  if (snap.exists()) {
    const data = snap.data() as MemorizationData;
    memorized = Array.isArray(data.memorizedAyahs) ? data.memorizedAyahs : [];
  }
  const set = new Set<number>(memorized);
  if (set.has(ayahNumber)) set.delete(ayahNumber); else set.add(ayahNumber);
  const updated = Array.from(set).sort((a, b) => a - b);
  await setDoc(ref, { userId, surahNumber, surahName: surahName || null, memorizedAyahs: updated, updatedAt: serverTimestamp() }, { merge: true });
  return updated;
}


