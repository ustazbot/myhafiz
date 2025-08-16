'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { BookOpen, Play, Pause, Volume2, VolumeX, Settings, Bookmark, CheckCircle, ArrowLeft, ArrowRight, Search, Filter, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchChapters, fetchVersesByChapter, fetchAudioByChapter, Chapter, Verse, RecitationAudio } from '@/utils/quranCom';
import { getMemorizedAyahs, toggleMemorizedAyah } from '@/utils/progress';

export default function QuranPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage(); // Add language to destructuring
  
  // State management
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [currentVerse, setCurrentVerse] = useState<number>(1);
  const [fontSize, setFontSize] = useState<'text-xl' | 'text-2xl' | 'text-3xl' | 'text-4xl'>('text-3xl');
  const [script, setScript] = useState<'quran-uthmani' | 'quran-indopak'>('quran-uthmani');
  const [showTranslation, setShowTranslation] = useState(true);
  const [showTafsir, setShowTafsir] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChapters, setFilteredChapters] = useState<Chapter[]>([]);
  const [memoSet, setMemoSet] = useState<Set<number>>(new Set());
  const [fontFamily, setFontFamily] = useState<'uthmani' | 'indopak'>('uthmani');
  
  // New state for Show/Hide functionality
  const [visibleAyahs, setVisibleAyahs] = useState<Set<number>>(new Set());
  const [showAllAyahs, setShowAllAyahs] = useState(false);

  // New state for individual ayah audio
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [selectedReciter, setSelectedReciter] = useState<number>(1);
  const [audioUrl, setAudioUrl] = useState<string>('');

  // Add state for info modal
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Load chapters on component mount
  useEffect(() => {
    const loadChapters = async () => {
      try {
        const chaptersData = await fetchChapters();
        setChapters(chaptersData);
        setFilteredChapters(chaptersData);
      } catch (error) {
        console.error('Error loading chapters:', error);
      }
    };
    loadChapters();
  }, []);

  // Load verses when chapter is selected
  useEffect(() => {
    if (selectedChapter) {
      loadVerses(selectedChapter.id);
      loadMemorizationData(selectedChapter.id);
    }
  }, [selectedChapter]);

  // Filter chapters based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredChapters(chapters);
    } else {
      const filtered = chapters.filter(chapter =>
        chapter.name_simple.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chapter.name_arabic.includes(searchQuery)
      );
      setFilteredChapters(filtered);
    }
  }, [searchQuery, chapters]);

  // Load verses for a specific chapter
  const loadVerses = async (chapterId: number) => {
    setLoading(true);
    try {
      const versesData = await fetchVersesByChapter(chapterId);
      setVerses(versesData);
      setCurrentVerse(1);
      // Initialize all ayahs as hidden by default
      setVisibleAyahs(new Set());
      setShowAllAyahs(false);
    } catch (error) {
      console.error('Error loading verses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle chapter selection
  const handleChapterSelect = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setCurrentVerse(1);
    setIsMuted(false); // Reset mute state when chapter changes
    setPlayingAyah(null); // Reset playing ayah when chapter changes
    setAudioUrl(''); // Clear audio URL
  };

  // Navigate to previous/next verse
  const goToVerse = (verseNumber: number) => {
    if (verseNumber >= 1 && verseNumber <= verses.length) {
      setCurrentVerse(verseNumber);
    }
  };

  // Toggle ayah visibility
  const toggleAyahVisibility = (verseId: number) => {
    const newVisibleAyahs = new Set(visibleAyahs);
    if (newVisibleAyahs.has(verseId)) {
      newVisibleAyahs.delete(verseId);
    } else {
      newVisibleAyahs.add(verseId);
    }
    setVisibleAyahs(newVisibleAyahs);
  };

  // Toggle all ayahs visibility
  const toggleAllAyahs = () => {
    if (showAllAyahs) {
      setVisibleAyahs(new Set());
      setShowAllAyahs(false);
    } else {
      const allVerseIds = new Set(verses.map(verse => verse.id));
      setVisibleAyahs(allVerseIds);
      setShowAllAyahs(true);
    }
  };

  // Toggle memorization status
  const toggleMemorization = async (verseId: number) => {
    if (!user || !selectedChapter) return;

    try {
      await toggleMemorizedAyah(user.uid, selectedChapter.id, verseId);
      const newMemoSet = new Set(memoSet);
      if (newMemoSet.has(verseId)) {
        newMemoSet.delete(verseId);
      } else {
        newMemoSet.add(verseId);
      }
      setMemoSet(newMemoSet);
    } catch (error) {
      console.error('Error toggling memorization:', error);
    }
  };

  // Toggle ayah audio
  const toggleAyahAudio = async (verseId: number) => {
    if (!selectedChapter) return;

    if (playingAyah === verseId) {
      // Pause current ayah (don't stop completely)
      const audioElement = document.getElementById('quran-audio') as HTMLAudioElement;
      if (audioElement) {
        audioElement.pause();
      }
      setPlayingAyah(null); // Clear playing state to show play button
      setAudioUrl(''); // Clear audio URL when pausing
    } else {
      try {
        // If we already have audio URL for this verse, just resume
        if (audioUrl && audioUrl.trim() !== '') {
          const audioElement = document.getElementById('quran-audio') as HTMLAudioElement;
          if (audioElement) {
            audioElement.play().catch(error => {
              console.error('Resume play failed:', error);
            });
            setPlayingAyah(verseId);
            return;
          }
        }

        // Load new audio for this verse
        const audioData = await fetchAudioByChapter(selectedReciter, selectedChapter.id);
        const currentVerseAudio = audioData.find(audio => 
          audio.verse_key === `${selectedChapter.id}:${verseId}`
        );
        
        if (currentVerseAudio && currentVerseAudio.url && currentVerseAudio.url.trim() !== '') {
          setAudioUrl(currentVerseAudio.url);
          setPlayingAyah(verseId);
          // Auto-play the audio
          setTimeout(() => {
            const audioElement = document.getElementById('quran-audio') as HTMLAudioElement;
            if (audioElement) {
              audioElement.play().catch(error => {
                console.error('Auto-play failed:', error);
              });
            }
          }, 100);
        }
      } catch (error) {
        console.error('Error loading audio:', error);
      }
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Load existing memorization data for the selected chapter
  const loadMemorizationData = async (chapterId: number) => {
    if (!user) return;

    try {
      const memorizedAyahs = await getMemorizedAyahs(user.uid, chapterId);
      setMemoSet(new Set(memorizedAyahs));
    } catch (error) {
      console.error('Error loading memorization data:', error);
    }
  };

  // Get current verse data
  const currentVerseData = useMemo(() => {
    return verses.find(verse => verse.id === currentVerse);
  }, [verses, currentVerse]);

  // Calculate progress
  const progress = useMemo(() => {
    if (!verses.length) return 0;
    return (currentVerse / verses.length) * 100;
  }, [currentVerse, verses.length]);

  // Add this useEffect to check font loading
  useEffect(() => {
    if ('fonts' in document) {
      // Check if Indopak font is loaded
      document.fonts.load('1em QCF_BSML').then(() => {
        console.log('Indopak font (QCF_BSML) loaded successfully');
      }).catch((error) => {
        console.warn('Indopak font failed to load:', error);
      });
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (fontFamily === 'indopak') {
      root.style.setProperty('--quran-font-family', 'QCF_BSML');
    } else {
      root.style.setProperty('--quran-font-family', 'Uthman Taha');
    }
  }, [fontFamily]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-black mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600">
            Please log in to access the Quran reading feature.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6EFD2] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Responsive Grid Layout - Chapter selection moved to top */}
        <div className="space-y-4 sm:space-y-6">
          {/* Chapter Selection - Now at the top */}
          <div className="bg-white rounded-2xl shadow-lg border border-[#E2DDB4] overflow-hidden">
            {/* Mobile-friendly header */}
            <div className="p-4 sm:p-6 border-b border-[#E2DDB4] bg-[#F6EFD2]">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-black mb-2">
                    {t('quran')}
                  </h1>
                  <p className="text-sm sm:text-base text-black">
                    {t('selectChapterDescription')}
                  </p>
                </div>
                
                {/* Guide Button - Clear purpose for all users */}
                <button
                  onClick={() => setShowInfoModal(true)}
                  className="flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-md"
                  title={language === 'en' ? 'How to Use & Information' : 'Cara Guna & Maklumat'}
                >
                  <span className="mr-2 text-lg">📚</span>
                  <span className="font-medium text-sm sm:text-base">
                    {language === 'en' ? 'Guide' : 'Panduan'}
                  </span>
                </button>
              </div>
            </div>

            {/* Search Bar - Mobile optimized */}
            <div className="p-4 sm:p-6 border-b border-[#E2DDB4]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('searchChapters')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Chapters List - Scrollable and mobile-friendly */}
            <div className="max-h-64 sm:max-h-80 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                {filteredChapters.map((chapter) => (
                  <button
                    key={chapter.id}
                    onClick={() => handleChapterSelect(chapter)}
                    className={`p-3 sm:p-4 text-left transition-all duration-200 hover:bg-gray-50 rounded-lg ${
                      selectedChapter?.id === chapter.id
                        ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                        : 'hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col items-center text-center space-y-2">
                      <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 text-blue-600 text-sm sm:text-base font-bold flex items-center justify-center">
                        {chapter.id}
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold text-black text-sm sm:text-base truncate">
                          {chapter.name_simple}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 truncate">
                          {chapter.name_arabic}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {chapter.verses_count} {t('ayahs')}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Now below chapter selection */}
          <div className="w-full">
            {!selectedChapter ? (
              <div className="bg-white rounded-2xl p-6 sm:p-8 lg:p-12 text-center shadow-lg border border-[#E2DDB4]">
                <BookOpen className="h-16 w-16 sm:h-24 sm:w-24 text-blue-400 mx-auto mb-4 sm:mb-6" />
                <h2 className="text-2xl sm:text-3xl font-bold text-black mb-3 sm:mb-4">
                  {t('selectChapter')}
                </h2>
                <p className="text-base sm:text-lg text-gray-600 max-w-md mx-auto">
                  {t('selectChapterDescription')}
                </p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Chapter Header - Mobile responsive */}
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-[#E2DDB4]">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
                    <div className="flex-1">
                      <h2 className="text-2xl sm:text-3xl font-bold text-black">
                        {selectedChapter.name_simple}
                      </h2>
                      <p className="text-base sm:text-lg text-gray-600">
                        {selectedChapter.name_arabic}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl sm:text-4xl font-bold text-blue-600">
                        {selectedChapter.name_arabic}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        {selectedChapter.verses_count} {t('ayahs')}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-[#F6EFD2] rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-2">
                    {t('verse')} {currentVerse} {t('of')} {verses.length}
                  </div>
                </div>

                {/* Font Controls - Mobile responsive */}
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-[#E2DDB4]">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
                    <h3 className="text-base sm:text-lg font-semibold text-black">{t('displaySettings')}</h3>
                    <button
                      onClick={toggleAllAyahs}
                      className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm sm:text-base"
                    >
                      {showAllAyahs ? (
                        <>
                          <EyeOff className="h-4 w-4" />
                          <span>{t('hideAll')}</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          <span>{t('showAll')}</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Font controls in responsive grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="flex flex-col space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-gray-700">
                        {t('fontStyle')}:
                      </label>
                      <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value as 'uthmani' | 'indopak')}
                        className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="uthmani">{t('uthmaniQPC')}</option>
                        <option value="indopak">{t('indopak')}</option>
                      </select>
                    </div>
                    
                    <div className="flex flex-col space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-gray-700">
                        {t('size')}:
                      </label>
                      <select
                        value={fontSize}
                        onChange={(e) => setFontSize(e.target.value as any)}
                        className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="text-lg sm:text-xl">{t('small')}</option>
                        <option value="text-xl sm:text-2xl">{t('medium')}</option>
                        <option value="text-2xl sm:text-3xl">{t('large')}</option>
                        <option value="text-3xl sm:text-4xl">{t('extraLarge')}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Verses Display - Mobile responsive */}
                {loading ? (
                  <div className="bg-white rounded-2xl p-8 sm:p-12 text-center shadow-lg border border-[#E2DDB4]">
                    <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 text-sm sm:text-base">{t('loadingVerses')}</p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {verses.map((verse) => (
                      <div key={verse.id} className="bg-white rounded-2xl shadow-lg border border-[#E2DDB4] overflow-hidden">
                        {/* Ayah Header - Mobile responsive */}
                        <div className="bg-[#F6EFD2] px-3 sm:px-6 py-3 sm:py-4 border-b border-[#E2DDB4]">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                            <div className="flex items-center space-x-2 sm:space-x-4">
                              <span className="text-xs sm:text-sm font-medium text-gray-600">
                                {t('ayah')} {verse.id}
                              </span>
                              <span className="text-xs sm:text-sm font-medium text-gray-600">
                                {t('verse')} {verse.verse_key}
                              </span>
                            </div>
                            
                            {/* Controls - Responsive grid */}
                            <div className="grid grid-cols-4 gap-1 sm:gap-2">
                              {/* Reciter Selection */}
                              <select
                                value={selectedReciter}
                                onChange={(e) => setSelectedReciter(Number(e.target.value))}
                                className="px-1 sm:px-2 py-1 text-xs border border-gray-300 rounded bg-white text-black focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value={1}>Abdul Basit</option>
                                <option value={3}>Abdur-Rahman As-Sudais</option>
                                <option value={7}>Mishary Alafasy</option>
                                <option value={9}>Muhammad Siddiq al-Minshawi</option>
                              </select>

                              {/* Play/Pause Button */}
                              <button
                                onClick={() => toggleAyahAudio(verse.id)}
                                className={`p-1 sm:p-2 rounded-lg transition-colors ${
                                  playingAyah === verse.id
                                    ? 'bg-red-100 text-red-600'
                                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                }`}
                                title={playingAyah === verse.id ? t('stopAudio') : t('playAudio')}
                              >
                                {playingAyah === verse.id ? (
                                  <Pause className="h-3 w-3 sm:h-4 sm:w-4" />
                                ) : (
                                  <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                                )}
                              </button>
                              
                              {/* Show/Hide Button */}
                              <button
                                onClick={() => toggleAyahVisibility(verse.id)}
                                className={`p-1 sm:p-2 rounded-lg transition-colors ${
                                  visibleAyahs.has(verse.id)
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                                title={visibleAyahs.has(verse.id) ? t('hideAyah') : t('showAyah')}
                              >
                                {visibleAyahs.has(verse.id) ? (
                                  <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
                                ) : (
                                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                )}
                              </button>
                              
                              {/* Memorization Button */}
                              <button
                                onClick={() => toggleMemorization(verse.id)}
                                className={`p-1 sm:p-2 rounded-lg transition-colors ${
                                  memoSet.has(verse.id)
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                                title={memoSet.has(verse.id) ? t('markAsNotMemorized') : t('markAsMemorized')}
                              >
                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Ayah Content - Mobile responsive */}
                        {visibleAyahs.has(verse.id) && (
                          <div className="p-3 sm:p-6">
                            {/* Arabic Text */}
                            <div className="quran-ayah-bg mb-3 sm:mb-4">
                              <p
                                dir="rtl"
                                lang="ar"
                                className={`quran-text-${fontFamily} quran-text-enhanced ${fontSize} text-black leading-relaxed`}
                              >
                                {fontFamily === 'uthmani' ? verse.text_uthmani : verse.text_indopak}
                              </p>
                            </div>

                            {/* Translation Tab */}
                            {verse.translations && verse.translations.length > 0 && (
                              <div className="mt-3 sm:mt-4">
                                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                  <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                                    <BookOpen className="h-4 w-4 text-blue-600" />
                                    <span className="text-xs sm:text-sm font-medium text-gray-700">
                                      {t('translation')} - {language === 'en' ? 'Sahih International' : 'Basmeih'}
                                    </span>
                                  </div>
                                  
                                  {/* Get translation based on current language */}
                                  {(() => {
                                    const translation = language === 'en' 
                                      ? verse.translations.find(t => t.language_name === 'English')
                                      : verse.translations.find(t => t.language_name === 'Malay');
                                    
                                    return translation ? (
                                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                                        {translation.text}
                                      </p>
                                    ) : (
                                      <p className="text-gray-500 italic text-sm sm:text-base">
                                        {t('noTranslationAvailable')}
                                      </p>
                                    );
                                  })()}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Hidden Audio Element - Only render when audioUrl exists */}
        {audioUrl && audioUrl.trim() !== '' && (
          <audio
            id="quran-audio"
            src={audioUrl}
            onEnded={() => setPlayingAyah(null)}
            onError={() => setPlayingAyah(null)}
            muted={isMuted}
            className="hidden"
          />
        )}

        {/* Info Modal */}
        {showInfoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowInfoModal(false)}
            />
            
            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {language === 'en' ? 'Information & Help' : 'Maklumat & Bantuan'}
                </h2>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Tajweed Symbols Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                    <span className="text-2xl mr-2">📖</span>
                    {language === 'en' ? 'Tajweed Symbols' : 'Simbol Tajwid'}
                  </h3>
                  <div className="text-blue-800 space-y-2">
                    <p>
                      <strong>{language === 'en' ? 'Small Meem (م):' : 'Meem Kecil (م):'}</strong>
                    </p>
                    <p>
                      {language === 'en' 
                        ? 'This symbol indicates "nun saakinah and tanwin" for tajweed rules "ikhfa and idgham". It helps with proper Quranic pronunciation and tajweed application.'
                        : 'Simbol ini menunjukkan "nun sakinah dan tanwin" untuk hukum tajwid "ikhfa dan idgham". Ia membantu dengan sebutan al-Quran dan aplikasi tajwid yang betul.'
                      }
                    </p>
                    <div className="mt-3 p-3 bg-white rounded border border-blue-300">
                      <p className="text-sm font-medium text-blue-900">
                        {language === 'en' 
                          ? '💡 Tip: These symbols help you apply proper tajweed rules while reading or memorizing.'
                          : '💡 Petua: Simbol-simbol ini membantu anda mengaplikasikan hukum tajwid yang betul semasa membaca atau menghafal.'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* App Updates Section */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                    <span className="text-2xl mr-2">🚀</span>
                    {language === 'en' ? 'App Updates & Improvements' : 'Kemaskini & Penambahbaikan Aplikasi'}
                  </h3>
                  <div className="text-green-800 space-y-2">
                    <p>
                      {language === 'en'
                        ? 'MyHafiz is continuously being upgraded with new features, better performance, and enhanced user experience. We are committed to making Quran memorization easier and more effective for everyone.'
                        : 'MyHafiz sentiasa dinaik taraf dengan ciri-ciri baharu, prestasi yang lebih baik, dan pengalaman pengguna yang lebih baik. Kami komited untuk menjadikan hafazan al-Quran lebih mudah dan berkesan untuk semua orang.'
                      }
                    </p>
                    <div className="mt-3 p-3 bg-white rounded border border-green-300">
                      <p className="text-sm font-medium text-green-900">
                        {language === 'en'
                          ? '✨ New features and improvements are added regularly based on user feedback and Islamic technology advancements.'
                          : '✨ Ciri-ciri baharu dan penambahbaikan ditambah secara berkala berdasarkan maklum balas pengguna dan kemajuan teknologi Islam.'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Tips */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
                    <span className="text-2xl mr-2">💡</span>
                    {language === 'en' ? 'Quick Tips' : 'Petua Pantas'}
                  </h3>
                  <ul className="text-purple-800 space-y-3 text-sm">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <div className="flex items-center">
                        <Settings className="w-4 h-4 mr-2 text-purple-600" />
                        <span>
                          {language === 'en' 
                            ? 'Use the font controls to adjust text size for better readability'
                            : 'Gunakan kawalan fon untuk menyesuaikan saiz teks untuk kebolehbacaan yang lebih baik'
                          }
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <div className="flex items-center">
                        <Volume2 className="w-4 h-4 mr-2 text-purple-600" />
                        <span>
                          {language === 'en'
                            ? 'Audio recitation helps with proper pronunciation and memorization'
                            : 'Bacaan audio membantu dengan sebutan dan hafalan yang betul'
                          }
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-purple-600" />
                        <span>
                          {language === 'en'
                            ? 'Mark verses as memorized to track your progress'
                            : 'Tandakan ayat sebagai dihafal untuk menjejaki kemajuan anda'
                          }
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <div className="text-center text-sm text-gray-600">
                  {language === 'en'
                    ? 'For more help, visit the FAQ section or contact support.'
                    : 'Untuk bantuan lanjut, lawati bahagian FAQ atau hubungi sokongan.'
                  }
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
