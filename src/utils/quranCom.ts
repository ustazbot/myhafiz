export interface Chapter {
  id: number;
  name_arabic: string;
  name_simple: string;
  verses_count: number;
}

export interface Verse {
  id: number;
  verse_key: string; // e.g., "3:1"
  text_uthmani?: string;
  text_indopak?: string;
  translations?: { id: number; text: string; resource_name: string; language_name: string }[];
}

export interface RecitationAudio {
  verse_key: string;
  url?: string;
}

// API response interfaces for Quran Foundation API
interface QuranFoundationResponse<T> {
  code: number;
  status: string;
  data: T;
}

interface QuranFoundationChapter {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
}

interface QuranFoundationAyah {
  number: number;
  text: string;
  numberInSurah: number;
  audio?: string;
}

interface QuranFoundationChapterData {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  ayahs: QuranFoundationAyah[];
}

interface QuranFoundationEdition {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: string;
  type: string;
}

// Use Quran Foundation API for better text quality
const BASE = 'https://api.quran.foundation/v1';
const FALLBACK_BASE = 'https://api.alquran.cloud/v1';

// Text cleaning function to remove unwanted characters
function cleanArabicText(text: string): string {
  if (!text) return '';
  
  // Remove any non-Arabic characters that might be mixed in
  // Keep only Arabic letters, numbers, and proper punctuation
  const cleaned = text
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u1EE00-\u1EEFF\u1EF00-\u1EFFF0-9\s\u0640\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u08D4\u08D5\u08E3\u08E4\u08E5\u08E6\u08E7\u08E8\u08E9\u08EA\u08EB\u08EC\u08ED\u08EE\u08EF\u08F0\u08F1\u08F2\u08F3\u08F4\u08F5\u08F6\u08F7\u08F8\u08F9\u08FA\u08FB\u08FC\u08FD\u08FE\u08FF]/g, '')
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  return cleaned;
}

// Font loading detection
function isFontLoaded(fontFamily: string): boolean {
  if ('fonts' in document) {
    return document.fonts.check(`1em ${fontFamily}`);
  }
  return false;
}

export async function fetchChapters(): Promise<Chapter[]> {
  try {
    // Try Quran Foundation API first
    const res = await fetch(`${BASE}/surah`);
    if (res.ok) {
      const json = await res.json() as QuranFoundationResponse<QuranFoundationChapter[]>;
      return json.data.map((c) => ({ 
        id: c.number, 
        name_arabic: c.name, 
        name_simple: c.englishName, 
        verses_count: c.numberOfAyahs 
      })) as Chapter[];
    }
  } catch (error) {
    console.warn('Quran Foundation API failed, falling back to AlQuran.cloud:', error);
  }
  
  // Fallback to AlQuran.cloud
  const res = await fetch(`${FALLBACK_BASE}/surah`);
  if (!res.ok) throw new Error('Failed to load chapters');
  const json = await res.json() as QuranFoundationResponse<QuranFoundationChapter[]>;
  return json.data.map((c) => ({ 
    id: c.number, 
    name_arabic: c.name, 
    name_simple: c.englishName, 
    verses_count: c.numberOfAyahs 
  })) as Chapter[];
}

export async function fetchVersesByChapter(
  chapterId: number
): Promise<Verse[]> {
  try {
    // Try Quran Foundation API first for better text quality
    let arabicRes: Response;
    let arabicData: any;
    
    try {
      arabicRes = await fetch(`${BASE}/surah/${chapterId}/quran-uthmani`);
      if (arabicRes.ok) {
        arabicData = await arabicRes.json() as QuranFoundationResponse<QuranFoundationChapterData>;
      } else {
        throw new Error('Quran Foundation API failed');
      }
    } catch (error) {
      console.warn('Quran Foundation API failed, falling back to AlQuran.cloud:', error);
      // Fallback to AlQuran.cloud
      arabicRes = await fetch(`${FALLBACK_BASE}/surah/${chapterId}/quran-uthmani`);
      if (!arabicRes.ok) throw new Error('Failed to load Arabic text');
      arabicData = await arabicRes.json() as QuranFoundationResponse<QuranFoundationChapterData>;
    }
    
    // Fetch English translation
    const englishRes = await fetch(`${FALLBACK_BASE}/surah/${chapterId}/en.sahih`);
    const englishData = englishRes.ok ? await englishRes.json() as QuranFoundationResponse<QuranFoundationChapterData> : { data: { ayahs: [] } };
    
    // Fetch Malay translation
    const malayRes = await fetch(`${FALLBACK_BASE}/surah/${chapterId}/ms.basmeih`);
    const malayData = malayRes.ok ? await malayRes.json() as QuranFoundationResponse<QuranFoundationChapterData> : { data: { ayahs: [] } };
    
    // Merge the data with text cleaning
    const verses: Verse[] = [];
    const arabicAyahs = arabicData.data.ayahs || [];
    const englishAyahs = englishData.data.ayahs || [];
    const malayAyahs = malayData.data.ayahs || [];
    
    arabicAyahs.forEach((arabicAyah: QuranFoundationAyah, index: number) => {
      const englishAyah = englishAyahs[index];
      const malayAyah = malayAyahs[index];
      
      // Clean the Arabic text to remove unwanted characters
      const cleanedUthmani = cleanArabicText(arabicAyah.text);
      const cleanedIndopak = cleanArabicText(arabicAyah.text); // Same text for now
      
      verses.push({
        id: arabicAyah.numberInSurah,
        verse_key: `${chapterId}:${arabicAyah.numberInSurah}`,
        text_uthmani: cleanedUthmani,
        text_indopak: cleanedIndopak,
        translations: [
          { id: 20, text: englishAyah?.text || '', resource_name: 'Sahih International', language_name: 'English' },
          { id: 85, text: malayAyah?.text || '', resource_name: 'Basmeih', language_name: 'Malay' }
        ]
      });
    });
    
    return verses;
  } catch (error) {
    console.error('Error fetching verses:', error);
    throw new Error('Failed to load verses');
  }
}

export async function fetchAudioByChapter(recitationId: number, chapterId: number): Promise<RecitationAudio[]> {
  try {
    // Map reciter IDs to audio editions
    const audioEditions: Record<number, string> = {
      1: 'ar.abdulbasitmurattal', // Abdul Basit Murattal
      2: 'ar.abdulbasitmurattal', // Abdul Basit Murattal (same as 1)
      3: 'ar.abdurrahmaansudais', // Abdur-Rahman As-Sudais
      7: 'ar.alafasy', // Mishary Alafasy
      9: 'ar.minshawi' // Muhammad Siddiq al-Minshawi
    };
    
    const audioEdition = audioEditions[recitationId] || 'ar.abdulbasitmurattal';
    
    // Try Quran Foundation API first
    let res: Response;
    try {
      res = await fetch(`${BASE}/surah/${chapterId}/${audioEdition}`);
      if (!res.ok) {
        throw new Error('Quran Foundation API failed');
      }
    } catch (error) {
      console.warn('Quran Foundation API failed, falling back to AlQuran.cloud:', error);
      // Fallback to AlQuran.cloud
      res = await fetch(`${FALLBACK_BASE}/surah/${chapterId}/${audioEdition}`);
      if (!res.ok) {
        console.warn(`Failed to load audio for reciter ${recitationId}, chapter ${chapterId}: ${res.status}`);
        return [];
      }
    }
    
    const json = await res.json() as QuranFoundationResponse<QuranFoundationChapterData>;
    const ayahs = json.data.ayahs || [];
    
    // Convert to our format
    return ayahs.map((ayah) => ({
      verse_key: `${chapterId}:${ayah.numberInSurah}`,
      url: ayah.audio
    }));
  } catch (error) {
    console.warn(`Error fetching audio for reciter ${recitationId}, chapter ${chapterId}:`, error);
    return [];
  }
}

export interface RecitationResource { id: number; reciter_name: string; style?: string | null }

export async function fetchRecitations(): Promise<RecitationResource[]> {
  try {
    // Try Quran Foundation API first
    const res = await fetch(`${BASE}/edition?format=audio&language=ar`);
    if (res.ok) {
      const json = await res.json() as QuranFoundationResponse<QuranFoundationEdition[]>;
      return json.data.map((r, index) => ({ 
        id: index + 1, 
        reciter_name: r.englishName, 
        style: r.type 
      })) as RecitationResource[];
    }
  } catch (error) {
    console.warn('Quran Foundation API failed, falling back to AlQuran.cloud:', error);
  }
  
  // Fallback to AlQuran.cloud
  try {
    const res = await fetch(`${FALLBACK_BASE}/edition?format=audio&language=ar`);
    if (!res.ok) throw new Error('Failed to load recitations');
    const json = await res.json() as QuranFoundationResponse<QuranFoundationEdition[]>;
    return json.data.map((r, index) => ({ 
      id: index + 1, 
      reciter_name: r.englishName, 
      style: r.type 
    })) as RecitationResource[];
  } catch (error) {
    console.warn('Failed to load recitations, using fallback:', error);
    // Return fallback reciters
    return [
      { id: 1, reciter_name: 'Abdul Basit Abdul Samad (Mujawwad)', style: 'Mujawwad' },
      { id: 2, reciter_name: 'Abdul Basit Abdul Samad (Murattal)', style: 'Murattal' },
      { id: 3, reciter_name: 'Abdur-Rahman as-Sudais', style: null },
      { id: 7, reciter_name: 'Mishary Rashid al-Afasy', style: null },
      { id: 9, reciter_name: 'Mohamed Siddiq al-Minshawi', style: 'Murattal' }
    ];
  }
}

// Font loading utility
export function ensureFontsLoaded(): Promise<void> {
  return new Promise((resolve) => {
    if ('fonts' in document) {
      const fontFamilies = [
        'Uthman Taha',
        'KFGQPC Uthman Taha',
        'QCF_BSML',
        'Amiri',
        'Scheherazade New'
      ];
      
      Promise.all(
        fontFamilies.map(font => document.fonts.load(`1em ${font}`))
      ).then(() => {
        console.log('All Quran fonts loaded successfully');
        resolve();
      }).catch((error) => {
        console.warn('Some fonts failed to load:', error);
        resolve(); // Resolve anyway to not block the app
      });
    } else {
      resolve(); // Font API not supported
    }
  });
}


