'use client';

import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Target, TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MemorizationProgress } from '@/types';

export default function ProgressPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [userProgress, setUserProgress] = useState<MemorizationProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalMemorizedAyahs, setTotalMemorizedAyahs] = useState(0);

  // Total ayahs in the Quran (6,236)
  const TOTAL_QURAN_AYAHS = 6236;

  useEffect(() => {
    if (user) {
      loadUserProgress();
    }
  }, [user]);

  const loadUserProgress = async () => {
    try {
      setLoading(true);
      
      if (!user || !user.uid) return;
      
      console.log('Loading progress for user:', user.uid);
      
      // Try multiple collection names and data structures
      const collectionsToTry = ['memorizationProgress', 'progress', 'memorization', 'quranProgress'];
      let progressData: MemorizationProgress[] = [];
      
      for (const collectionName of collectionsToTry) {
        try {
          console.log(`Trying collection: ${collectionName}`);
          const progressQuery = query(
            collection(db, collectionName),
            where('userId', '==', user.uid)
          );
          
          const progressSnapshot = await getDocs(progressQuery);
          console.log(`Found ${progressSnapshot.docs.length} documents in ${collectionName}`);
          
          if (progressSnapshot.docs.length > 0) {
            progressData = progressSnapshot.docs.map(doc => {
              const data = doc.data();
              console.log('Document data:', data);
              
              // Handle different data structures
              let memorizedAyahs: number[] = [];
              let totalAyahs = 0;
              
              if (Array.isArray(data.memorizedAyahs)) {
                memorizedAyahs = data.memorizedAyahs;
              } else if (data.memorizedAyahs && typeof data.memorizedAyahs === 'object') {
                // If it's an object, try to extract the array
                memorizedAyahs = Object.values(data.memorizedAyahs).filter(val => typeof val === 'number') as number[];
              }
              
              if (typeof data.totalAyahs === 'number') {
                totalAyahs = data.totalAyahs;
              } else if (data.surahNumber) {
                // Calculate total ayahs for the surah if not provided
                totalAyahs = getSurahTotalAyahs(data.surahNumber);
              }
              
              return {
                id: doc.id,
                userId: data.userId || user.uid,
                surahNumber: data.surahNumber || 1,
                memorizedAyahs,
                totalAyahs,
                lastUpdated: data.lastUpdated || data.updatedAt || data.timestamp
              };
            }) as MemorizationProgress[];
            
            console.log('Processed progress data:', progressData);
            break; // Found data, stop trying other collections
          }
        } catch (error) {
          console.log(`Error with collection ${collectionName}:`, error);
          continue;
        }
      }
      
      // If no data found in any collection, create a default entry for Al-Fatiha
      if (progressData.length === 0) {
        console.log('No progress data found, creating default entry for Al-Fatiha');
        progressData = [{
          id: 'default',
          userId: user.uid,
          surahNumber: 1,
          memorizedAyahs: [],
          totalAyahs: 7, // Al-Fatiha
          lastUpdated: null
        }];
      }
      
      console.log('Final progress data:', progressData);
      setUserProgress(progressData);
      
      // Calculate total memorized ayahs
      const total = progressData.reduce((sum, p) => sum + (p.memorizedAyahs?.length || 0), 0);
      setTotalMemorizedAyahs(total);
      
    } catch (error) {
      console.error('Error loading user progress:', error);
      // Set default data on error
      setUserProgress([{
        id: 'error',
        userId: user?.uid || 'unknown',
        surahNumber: 1,
        memorizedAyahs: [],
        totalAyahs: 7,
        lastUpdated: null
      }]);
      setTotalMemorizedAyahs(0);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallProgress = () => {
    if (userProgress.length === 0) return 0;
    const percentage = Math.round((totalMemorizedAyahs / TOTAL_QURAN_AYAHS) * 100);
    return percentage;
  };

  const getSurahTotalAyahs = (surahNumber: number) => {
    const surahAyahCounts: Record<number, number> = {
      1: 7, 2: 286, 3: 200, 4: 176, 5: 120, 6: 165, 7: 206, 8: 75, 9: 129, 10: 109,
      11: 123, 12: 111, 13: 43, 14: 52, 15: 99, 16: 128, 17: 111, 18: 110, 19: 98, 20: 135,
      21: 112, 22: 78, 23: 118, 24: 64, 25: 77, 26: 227, 27: 93, 28: 88, 29: 69, 30: 60,
      31: 34, 32: 30, 33: 73, 34: 54, 35: 45, 36: 83, 37: 182, 38: 88, 39: 75, 40: 85,
      41: 54, 42: 53, 43: 89, 44: 59, 45: 37, 46: 35, 47: 38, 48: 29, 49: 18, 50: 45,
      51: 60, 52: 49, 53: 62, 54: 55, 55: 78, 56: 96, 57: 29, 58: 22, 59: 24, 60: 13,
      61: 14, 62: 11, 63: 11, 64: 18, 65: 12, 66: 12, 67: 30, 68: 52, 69: 52, 70: 44,
      71: 28, 72: 28, 73: 20, 74: 56, 75: 40, 76: 31, 77: 50, 78: 40, 79: 46, 80: 42,
      81: 29, 82: 19, 83: 36, 84: 25, 85: 22, 86: 17, 87: 19, 88: 26, 89: 30, 90: 20,
      91: 15, 92: 21, 93: 11, 94: 8, 95: 8, 96: 19, 97: 5, 98: 8, 99: 8, 100: 11,
      101: 11, 102: 8, 103: 3, 104: 9, 105: 5, 106: 4, 107: 7, 108: 3, 109: 6, 110: 3,
      111: 5, 112: 4, 113: 5, 114: 6
    };
    
    return surahAyahCounts[surahNumber] || 0;
  };

  const getSurahName = (surahNumber: number) => {
    const surahNames = [
      'Al-Fatiha', 'Al-Baqarah', 'Aali Imran', 'An-Nisa', 'Al-Ma\'idah',
      'Al-An\'am', 'Al-A\'raf', 'Al-Anfal', 'At-Tawbah', 'Yunus',
      'Hud', 'Yusuf', 'Ar-Ra\'d', 'Ibrahim', 'Al-Hijr',
      'An-Nahl', 'Al-Isra', 'Al-Kahf', 'Maryam', 'Ta-Ha',
      'Al-Anbiya', 'Al-Hajj', 'Al-Mu\'minun', 'An-Nur', 'Al-Furqan',
      'Ash-Shu\'ara', 'An-Naml', 'Al-Qasas', 'Al-Ankabut', 'Ar-Rum',
      'Luqman', 'As-Sajdah', 'Al-Ahzab', 'Saba', 'Fatir',
      'Ya-Sin', 'As-Saffat', 'Sad', 'Az-Zumar', 'Ghafir',
      'Fussilat', 'Ash-Shura', 'Az-Zukhruf', 'Ad-Dukhan', 'Al-Jathiyah',
      'Al-Ahqaf', 'Muhammad', 'Al-Fath', 'Al-Hujurat', 'Qaf',
      'Adh-Dhariyat', 'At-Tur', 'An-Najm', 'Al-Qamar', 'Ar-Rahman',
      'Al-Waqi\'ah', 'Al-Hadid', 'Al-Mujadila', 'Al-Hashr', 'Al-Mumtahanah',
      'As-Saff', 'Al-Jumu\'ah', 'Al-Munafiqun', 'At-Taghabun', 'At-Talaq',
      'At-Tahrim', 'Al-Mulk', 'Al-Qalam', 'Al-Haqqah', 'Al-Ma\'arij',
      'Nuh', 'Al-Jinn', 'Al-Muzzammil', 'Al-Muddathir', 'Al-Qiyamah',
      'Al-Insan', 'Al-Mursalat', 'An-Naba', 'An-Nazi\'at', 'Abasa',
      'At-Takwir', 'Al-Infitar', 'Al-Mutaffifin', 'Al-Inshiqaq', 'Al-Buruj',
      'At-Tariq', 'Al-A\'la', 'Al-Ghashiyah', 'Al-Fajr', 'Al-Balad',
      'Ash-Shams', 'Al-Layl', 'Ad-Duha', 'Ash-Sharh', 'At-Tin',
      'Al-\'Alaq', 'Al-Qadr', 'Al-Bayyinah', 'Az-Zalzalah', 'Al-\'Adiyat',
      'Al-Qari\'ah', 'At-Takathur', 'Al-\'Asr', 'Al-Humazah', 'Al-Fil',
      'Quraish', 'Al-Ma\'un', 'Al-Kawthar', 'Al-Kafirun', 'An-Nasr',
      'Al-Masad', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas'
    ];
    
    return surahNames[surahNumber - 1] || `Surah ${surahNumber}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Target className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Access Denied
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Please log in to view your progress.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const overallProgress = calculateOverallProgress();

  return (
    <div className="min-h-screen bg-[#F6EFD2] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#E2DDB4]">
            <div className="flex items-center space-x-6 mb-8">
              <div className="w-16 h-16 bg-blue-600 rounded-xl p-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-black mb-3">
                  {t('memorizationProgress')}
                </h1>
                <p className="text-lg text-black">
                  Track your Quran memorization journey
                </p>
              </div>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#E2DDB4]">
            <h2 className="text-2xl font-bold text-black mb-6">
              Overall Progress
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {totalMemorizedAyahs}
                </div>
                <div className="text-black">
                  {t('ayahsMemorized')}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {TOTAL_QURAN_AYAHS.toLocaleString()}
                </div>
                <div className="text-black">
                  Total Ayahs
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {overallProgress}%
                </div>
                <div className="text-black">
                  {t('complete')}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#F6EFD2] rounded-full h-4 mb-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
            
            <div className="text-center text-sm text-black">
              {totalMemorizedAyahs} of {TOTAL_QURAN_AYAHS.toLocaleString()} ayahs memorized
            </div>
          </div>

          {/* Surah Progress */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#E2DDB4]">
            <h2 className="text-2xl font-bold text-black mb-6">
              {t('surahProgress')}
            </h2>
            
            {userProgress.length === 0 ? (
              <p className="text-black text-center py-4">No progress recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {userProgress
                  .sort((a, b) => a.surahNumber - b.surahNumber)
                  .map((progress) => {
                    const isCompleted = progress.memorizedAyahs?.length === progress.totalAyahs;
                    const memorizedCount = progress.memorizedAyahs?.length || 0;
                    const totalCount = progress.totalAyahs || 0;
                    const surahProgress = totalCount > 0 ? Math.round((memorizedCount / totalCount) * 100) : 0;
                    
                    return (
                      <div
                        key={progress.id}
                        className="flex items-center justify-between p-4 bg-[#F6EFD2] rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-600 bg-opacity-20 rounded-lg p-2">
                            <span className="text-white font-bold text-lg">
                              {progress.surahNumber}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-black">
                              {getSurahName(progress.surahNumber)}
                            </h3>
                            <p className="text-sm text-black">
                              {memorizedCount} of {totalCount} ayahs memorized
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {surahProgress}%
                          </div>
                          <div className="text-sm text-black">
                            {isCompleted ? 'Completed' : `${memorizedCount} ayahs`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
