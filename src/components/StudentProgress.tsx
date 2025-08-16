'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, MemorizationProgress } from '@/types';
import { BarChart3, BookOpen, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface StudentProgressProps {
  userRole: 'Teacher' | 'Parent' | 'Student';
}

export default function StudentProgress({ userRole }: StudentProgressProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [students, setStudents] = useState<User[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [studentProgress, setStudentProgress] = useState<MemorizationProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(false);

  // Total ayahs in the Quran (6,236)
  const TOTAL_QURAN_AYAHS = 6236;

  useEffect(() => {
    if (user) {
      loadStudents();
    }
  }, [user]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      
      if (!user || !user.uid) return;
      
      if (userRole === 'Teacher') {
        // Load students from teacher's studentIds array
        const teacherDoc = await getDoc(doc(db, 'users', user.uid));
        const teacherData = teacherDoc.data() as User;
        const studentIds = teacherData?.studentIds || [];
        
        // Also check for students with teacherId set to this teacher (legacy method)
        const legacyStudentsQuery = query(
          collection(db, 'users'),
          where('teacherId', '==', user.uid)
        );
        const legacyStudentsSnapshot = await getDocs(legacyStudentsQuery);
        const legacyStudents = legacyStudentsSnapshot.docs.map(doc => doc.data() as User);
        
        // Combine both methods
        let allStudentIds = new Set([...studentIds]);
        legacyStudents.forEach(student => allStudentIds.add(student.uid));
        
        let students: User[] = [];
        if (allStudentIds.size > 0) {
          // Get all students by their IDs
          const studentPromises = Array.from(allStudentIds).map(async (studentId) => {
            try {
              const studentDoc = await getDoc(doc(db, 'users', studentId));
              if (studentDoc.exists()) {
                return studentDoc.data() as User;
              }
              return null;
            } catch (error) {
              console.error('Error fetching student:', studentId, error);
              return null;
            }
          });
          
          const studentResults = await Promise.all(studentPromises);
          students = studentResults.filter(student => student !== null) as User[];
        }
        
        setStudents(students);
      } else if (userRole === 'Parent') {
        // Load children from parent's childIds array
        const parentDoc = await getDoc(doc(db, 'users', user.uid));
        const parentData = parentDoc.data() as User;
        const childIds = parentData?.childIds || [];
        
        // Also check for children with parentIds containing this parent (legacy method)
        const legacyChildrenQuery = query(
          collection(db, 'users'),
          where('parentIds', 'array-contains', user.uid)
        );
        const legacyChildrenSnapshot = await getDocs(legacyChildrenQuery);
        const legacyChildren = legacyChildrenSnapshot.docs.map(doc => doc.data() as User);
        
        // Combine both methods
        let allChildIds = new Set([...childIds]);
        legacyChildren.forEach(child => allChildIds.add(child.uid));
        
        let children: User[] = [];
        if (allChildIds.size > 0) {
          // Get all children by their IDs
          const childPromises = Array.from(allChildIds).map(async (childId) => {
            try {
              const childDoc = await getDoc(doc(db, 'users', childId));
              if (childDoc.exists()) {
                return childDoc.data() as User;
              }
              return null;
            } catch (error) {
              console.error('Error fetching child:', childId, error);
              return null;
            }
          });
          
          const childResults = await Promise.all(childPromises);
          children = childResults.filter(child => child !== null) as User[];
        }
        
        setStudents(children);
      } else if (userRole === 'Student') {
        // For students, they are their own "student"
        setStudents([user]);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentProgress = async (student: User) => {
    try {
      setProgressLoading(true);
      setSelectedStudent(student);
      
      console.log('Loading progress for student:', student.uid);
      
      // Try multiple collection names and data structures
      const collectionsToTry = ['memorizationProgress', 'progress', 'memorization', 'quranProgress'];
      let progressData: MemorizationProgress[] = [];
      
      for (const collectionName of collectionsToTry) {
        try {
          console.log(`Trying collection: ${collectionName}`);
          const progressQuery = query(
            collection(db, collectionName),
            where('userId', '==', student.uid)
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
                userId: data.userId || student.uid,
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
      
      // If no data found in any collection, create a default entry
      if (progressData.length === 0) {
        console.log('No progress data found, creating default entry');
        progressData = [{
          id: 'default',
          userId: student.uid,
          surahNumber: 1,
          memorizedAyahs: [],
          totalAyahs: 7, // Al-Fatiha
          lastUpdated: null
        }];
      }
      
      console.log('Final progress data:', progressData);
      setStudentProgress(progressData);
    } catch (error) {
      console.error('Error loading student progress:', error);
      // Set default data on error
      setStudentProgress([{
        id: 'error',
        userId: student.uid,
        surahNumber: 1,
        memorizedAyahs: [],
        totalAyahs: 7,
        lastUpdated: null
      }]);
    } finally {
      setProgressLoading(false);
    }
  };

  const calculateOverallProgress = (progress: MemorizationProgress[]) => {
    if (progress.length === 0) return 0;
    
    const totalMemorized = progress.reduce((sum, p) => sum + (p.memorizedAyahs?.length || 0), 0);
    const percentage = Math.round((totalMemorized / TOTAL_QURAN_AYAHS) * 100);
    console.log(`Calculating progress: ${totalMemorized} / ${TOTAL_QURAN_AYAHS} = ${percentage}%`);
    return percentage;
  };

  const getTotalMemorizedAyahs = (progress: MemorizationProgress[]) => {
    const total = progress.reduce((sum, p) => sum + (p.memorizedAyahs?.length || 0), 0);
    console.log(`Total memorized ayahs: ${total}`);
    return total;
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

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading students...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student Selection */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {userRole === 'Teacher' ? 'Select Student' : userRole === 'Parent' ? 'Select Child' : 'My Progress'}
        </h3>
        {students.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No {userRole === 'Teacher' ? 'students' : 'children'} connected yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
              <motion.button
                key={student.uid}
                onClick={() => loadStudentProgress(student)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedStudent?.uid === student.uid
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold text-lg">
                      {student.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900">{student.name || student.email}</h4>
                  <p className="text-sm text-gray-500">{student.role}</p>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Progress Display */}
      {selectedStudent && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Progress for {selectedStudent.name || selectedStudent.email}
          </h3>

          {progressLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading progress...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall Progress */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-lg mb-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-700">
                        {calculateOverallProgress(studentProgress)}%
                      </div>
                      <div className="text-sm text-blue-600">Complete</div>
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Overall Memorization Progress
                  </h4>
                  <p className="text-gray-600">
                    {getTotalMemorizedAyahs(studentProgress)} of {TOTAL_QURAN_AYAHS.toLocaleString()} ayahs memorized
                  </p>
                </div>
              </div>

              {/* Surah Progress */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Surah Progress</h4>
                {studentProgress.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No progress recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {studentProgress
                      .sort((a, b) => a.surahNumber - b.surahNumber)
                      .map((progress) => {
                        const isCompleted = progress.memorizedAyahs?.length === progress.totalAyahs;
                        const memorizedCount = progress.memorizedAyahs?.length || 0;
                        const totalCount = progress.totalAyahs || 0;
                        
                        return (
                          <motion.div
                            key={progress.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-gray-50 p-4 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900">
                                {progress.surahNumber}. {getSurahName(progress.surahNumber)}
                              </h5>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">
                                  {memorizedCount}/{totalCount} ayahs
                                </span>
                                {isCompleted && (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                                    Completed
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${totalCount > 0 ? (memorizedCount / totalCount) * 100 : 0}%`
                                }}
                              ></div>
                            </div>
                            <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                              <span>
                                {totalCount > 0 ? Math.round((memorizedCount / totalCount) * 100) : 0}% complete
                              </span>
                              <span>
                                Last updated: {progress.lastUpdated ? 
                                  progress.lastUpdated.toDate ? 
                                    progress.lastUpdated.toDate().toLocaleDateString() : 
                                    (typeof progress.lastUpdated === 'string' ? 
                                      new Date(progress.lastUpdated).toLocaleDateString() : 
                                      'Invalid date')
                                  : (progress.memorizedAyahs.length > 0 ? 'Recently' : 'No progress yet')
                                }
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}