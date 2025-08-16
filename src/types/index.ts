import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string;
  name: string;
  role: 'Student' | 'Teacher' | 'Parent';
  createdAt: Date;
  // For students
  teacherId?: string; // ID of the teacher
  parentIds?: string[]; // Array of parent IDs
  // For teachers
  studentIds?: string[]; // Array of student IDs
  // For parents
  childIds?: string[]; // Array of child (student) IDs
}

export interface QuranAyah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
}

export interface QuranSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
  ayahs: QuranAyah[];
}

export interface MemorizationProgress {
  id?: string; // Add optional id property
  userId: string;
  surahNumber: number;
  memorizedAyahs: number[];
  totalAyahs: number;
  lastUpdated: Timestamp | null;
}

// Client shape used in UI
export interface MemorizedEntry {
  surahNumber: number;
  ayahNumber: number;
  surahName?: string;
}

export interface AudioReciter {
  id: string;
  name: string;
  language: string;
  style: string;
}

export interface Translation {
  text: string;
  language: 'en' | 'ms';
  source: string;
}

export interface Language {
  code: 'en' | 'ms';
  name: string;
  nativeName: string;
}

export interface StudentConnection {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  connectedAt: Date;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface TeacherConnection {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  connectedAt: Date;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt?: Date;
}

export interface ParentConnection {
  id: string;
  parentId: string;
  parentName: string;
  parentEmail: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  connectedAt: Date;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt?: Date;
}
