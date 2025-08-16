'use client';

import { useEffect, useState } from 'react';
import { ensureFontsLoaded } from '@/utils/quranCom';

export default function FontLoader() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await ensureFontsLoaded();
        setFontsLoaded(true);
      } catch (error) {
        console.warn('Font loading failed:', error);
        setFontsLoaded(true); // Continue anyway
      } finally {
        setLoading(false);
      }
    };

    loadFonts();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-700 dark:text-neutral-300">Loading Quran fonts...</p>
        </div>
      </div>
    );
  }

  return null;
}
