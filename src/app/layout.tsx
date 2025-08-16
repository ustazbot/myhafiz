import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '../components/Providers';
import FontLoader from '@/components/FontLoader';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MyHafiz - Quran Memorization',
  description: 'A modern, mobile-first app designed to help you memorize the Holy Quran efficiently and track your progress.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#1D4ED8',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MyHafiz',
  },
  openGraph: {
    title: 'MyHafiz - Quran Memorization',
    description: 'A modern, mobile-first app designed to help you memorize the Holy Quran efficiently and track your progress.',
    url: 'http://localhost:3000',
    siteName: 'MyHafiz',
    images: [
      {
        url: '/logo.svg',
        width: 1200,
        height: 630,
        alt: 'MyHafiz Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyHafiz - Quran Memorization',
    description: 'A modern, mobile-first app designed to help you memorize the Holy Quran efficiently and track your progress.',
    images: ['/logo.svg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Font loading detection
              if ('fonts' in document) {
                Promise.all([
                  document.fonts.load('1em Uthman Taha'),
                  document.fonts.load('1em KFGQPC Uthman Taha'),
                  document.fonts.load('1em QCF_BSML'),
                  document.fonts.load('1em Amiri'),
                  document.fonts.load('1em Scheherazade New')
                ]).then(() => {
                  document.documentElement.classList.add('fonts-loaded');
                  console.log('All Quran fonts loaded successfully');
                }).catch((error) => {
                  console.warn('Some fonts failed to load:', error);
                });
              }
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <FontLoader />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
