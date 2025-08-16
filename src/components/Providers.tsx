'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/hooks/useAuth';
import { LanguageProvider } from '@/hooks/useLanguage';

interface ProvidersProps {
  children: ReactNode;
}

// Use both named and default export to avoid issues
export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </AuthProvider>
  );
}

// Also export as default
export default Providers;
