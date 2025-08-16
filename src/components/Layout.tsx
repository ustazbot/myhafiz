'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { 
  BookOpen, 
  BarChart3, 
  Heart, 
  Globe, 
  Menu, 
  X, 
  User,
  Bell
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { translations } from '@/utils/translations';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [pendingConnectionRequests, setPendingConnectionRequests] = useState(0);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      // Add proper null checks for user and user.uid
      if (user && user.uid) {
        try {
          // Load pending teacher connection requests
          const teacherRequestsQuery = query(
            collection(db, 'teacherConnections'),
            where('studentId', '==', user.uid),
            where('status', '==', 'pending')
          );
          const teacherSnapshot = await getDocs(teacherRequestsQuery);
          
          // Load pending parent connection requests
          const parentRequestsQuery = query(
            collection(db, 'parentConnections'),
            where('studentId', '==', user.uid),
            where('status', '==', 'pending')
          );
          const parentSnapshot = await getDocs(parentRequestsQuery);
          
          setPendingConnectionRequests(teacherSnapshot.size + parentSnapshot.size);
        } catch (error) {
          console.error('Error fetching pending requests:', error);
          // Set to 0 on error to prevent undefined issues
          setPendingConnectionRequests(0);
        }
      } else {
        // Reset to 0 when no user or user.uid
        setPendingConnectionRequests(0);
      }
    };

    // Only fetch if user is fully loaded
    if (user && user.uid) {
      fetchPendingRequests();
      const interval = setInterval(fetchPendingRequests, 60000); // Poll every minute
      return () => clearInterval(interval);
    }
  }, [user]);

  const navigation = [
    { name: t('quran'), href: '/quran', icon: BookOpen },
    ...(user && (user.role === 'Teacher' || user.role === 'Parent') 
      ? [{ name: t('dashboard'), href: '/dashboard', icon: User }] 
      : []),
    { name: t('progress'), href: '/progress', icon: BarChart3 },
    { name: t('infaq'), href: '/infaq', icon: Heart },
    ...(user && user.role === 'Student' 
      ? [{ name: t('notifications'), href: '/notifications', icon: Bell, count: pendingConnectionRequests }]
      : []
    ),
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ms' : 'en');
  };

  return (
    <div className="min-h-screen bg-white transition-colors duration-300">
      {/* Clean Header */}
      <header className="sticky top-0 z-50 bg-white backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-20">
            {/* Enhanced Logo with SVG */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-12 h-12 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                  <img 
                    src="/logo.svg" 
                    alt="MyHafiz Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-gray-900">
                    MyHafiz
                  </span>
                  <span className="text-sm text-gray-600 font-medium">
                    {t('quranMemorization')}
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-2">
              {/* User Info */}
              {user && (
                <div className="flex items-center space-x-3 px-4 py-3 bg-gray-100 rounded-xl border border-gray-200 shadow-sm">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-sm font-bold">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">
                      {user.name || user.email}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-blue-800">
                      {t(user.role?.toLowerCase() as keyof typeof translations.en) || user.role || 'Student'}
                    </span>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 ${
                      isActive
                        ? 'text-blue-700 bg-blue-50 border-2 border-blue-300 shadow-md'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50 hover:shadow-sm'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : ''}`} />
                    <span>{item.name}</span>
                    {item.count && (
                      <span className="ml-2 px-3 py-1 bg-yellow-400 text-gray-900 rounded-full text-xs font-bold shadow-sm">
                        {item.count}
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* Control Buttons */}
              <div className="flex items-center space-x-3 ml-4">
                {/* Language Toggle */}
                <button
                  onClick={toggleLanguage}
                  className="px-4 py-3 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
                  title={language === 'en' ? t('switchToMalay') : t('switchToEnglish')}
                >
                  {language === 'en' ? 'EN' : 'MY'}
                </button>

                {/* Auth Section */}
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
                  >
                    <User className="h-5 w-5" />
                    <span className="font-medium">{t('logout')}</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link 
                      href="/login" 
                      className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
                    >
                      {t('login')}
                    </Link>
                    <Link 
                      href="/register" 
                      className="inline-flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                      {t('register')}
                    </Link>
                  </div>
                )}
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-3 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Right-side floating menu */}
        <div 
          className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${
            isMobileMenuOpen ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'
          }`}
        >
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
              isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu Panel - Right side floating with enhanced background */}
          <div 
            className={`absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-gradient-to-b from-white via-gray-50 to-gray-100 shadow-2xl transform transition-transform duration-300 ${
              isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex flex-col h-full">
              {/* Header with enhanced background */}
              <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <img 
                      src="/logo.svg" 
                      alt="MyHafiz Logo" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">{t('navigation')}</h2>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-xl transition-all duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Navigation Content with enhanced background */}
              <div className="flex-1 p-4 bg-gradient-to-b from-gray-50 to-white">
                {/* User Info with enhanced background */}
                {user && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 mb-4 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                        <span className="text-white text-sm font-bold">
                          {user.name?.charAt(1).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 text-sm font-bold">{user.name || user.email}</p>
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-white/80 text-blue-800 border border-blue-200">
                          {t(user.role?.toLowerCase() as keyof typeof translations.en) || user.role || 'Student'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Navigation Items with enhanced backgrounds */}
                <div className="space-y-2 mb-6">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 shadow-sm ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-300 shadow-md'
                            : 'bg-white/80 text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
                          isActive 
                            ? 'bg-gradient-to-br from-blue-100 to-indigo-100' 
                            : 'bg-gradient-to-br from-gray-100 to-gray-200'
                        }`}>
                          <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold text-sm">{item.name}</span>
                          {item.count && item.count > 0 && (
                            <span className="ml-2 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full text-xs font-bold shadow-sm">
                              {item.count}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Language Toggle with enhanced background */}
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <button
                    onClick={() => setLanguage(language === 'en' ? 'ms' : 'en')}
                    className="w-full flex items-center justify-center space-x-2 p-3 rounded-xl text-sm font-semibold text-gray-700 hover:text-blue-600 bg-white/80 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <Globe className="h-4 w-4" />
                    <span>{language === 'en' ? 'Switch to Malay' : 'Tukar ke English'}</span>
                  </button>
                </div>

                {/* Auth Section with enhanced backgrounds */}
                <div className="border-t border-gray-200 pt-4">
                  {user ? (
                    <button
                      onClick={handleLogout}
                      className="w-full text-center p-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all duration-300 border border-red-200 bg-white/80 hover:shadow-md"
                    >
                      <span className="flex items-center justify-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{t('logout')}</span>
                      </span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        href="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full text-center p-3 rounded-xl text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-all duration-300 border border-blue-200 bg-white/80 hover:shadow-md"
                      >
                        {t('login')}
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full text-center p-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        {t('register')}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen">
        {children}
      </main>

      {/* Clean Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-10 h-10 flex items-center justify-center shadow-md">
                <img 
                  src="/logo.svg" 
                  alt="MyHafiz Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-bold text-gray-900">MyHafiz</span>
            </div>
            <p className="text-gray-600 text-sm">
              © 2025 | 1447 Hijrah MyHafiz. {t('quranMemorization')} app by Syahnas@UstazBot
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
