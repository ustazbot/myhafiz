'use client';

import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { BookOpen, Users, Target, TrendingUp, ArrowRight, Star, CheckCircle, X, Globe } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Language toggle function
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ms' : 'en');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 dark:from-neutral-900 dark:to-neutral-800">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
              {language === 'en' ? 'Welcome back' : 'Selamat datang kembali'}, {user.name}!
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8">
              {language === 'en' 
                ? 'Continue your Quran memorization journey'
                : 'Teruskan perjalanan hafazan Al-Quran anda'
              }
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/dashboard"
                className="btn-primary flex items-center space-x-2"
              >
                <span>{language === 'en' ? 'Go to Dashboard' : 'Pergi ke Dashboard'}</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/quran"
                className="btn-secondary flex items-center space-x-2"
              >
                <BookOpen className="h-5 w-5" />
                <span>{language === 'en' ? 'Read Quran' : 'Baca Al-Quran'}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 dark:from-neutral-900 dark:to-neutral-800">
      {/* Language Toggle - Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={toggleLanguage}
          className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200 hover:bg-white transition-all duration-200"
        >
          <Globe className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">
            {language === 'en' ? 'EN' : 'MS'}
          </span>
        </button>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 leading-tight">
            {language === 'en' ? 'Master the Quran with' : 'Kuasai Al-Quran dengan'}{' '}
            <span className="text-primary-600 dark:text-primary-400">MyHafiz</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 mb-8 max-w-3xl mx-auto leading-relaxed">
            {language === 'en' 
              ? 'A comprehensive platform designed to help students, teachers, and parents track Quran memorization progress with modern tools and traditional wisdom.'
              : 'Platform komprehensif yang direka untuk membantu pelajar, guru, dan ibu bapa menjejaki kemajuan hafazan Al-Quran dengan alat moden dan kebijaksanaan tradisional.'
            }
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <Link
              href="/login"
              className="btn-primary flex items-center space-x-2 text-lg px-8 py-4"
            >
              <span>{language === 'en' ? 'Get Started' : 'Mulakan'}</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/register"
              className="btn-secondary flex items-center space-x-2 text-lg px-8 py-4"
            >
              <span>{language === 'en' ? 'Create Account' : 'Cipta Akaun'}</span>
            </Link>
          </div>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>{language === 'en' ? 'Free to use' : 'Percuma'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>{language === 'en' ? 'Privacy focused' : 'Fokus privasi'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>{language === 'en' ? 'Islamic values' : 'Nilai Islam'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
            {language === 'en' 
              ? 'Everything you need to memorize the Quran'
              : 'Segala yang anda perlukan untuk menghafal Al-Quran'
            }
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            {language === 'en' 
              ? 'Our platform combines traditional Islamic education with modern technology to create the most effective memorization experience.'
              : 'Platform kami menggabungkan pendidikan Islam tradisional dengan teknologi moden untuk mencipta pengalaman hafazan yang paling berkesan.'
            }
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mb-6">
              <BookOpen className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              {language === 'en' ? 'Interactive Quran Reading' : 'Bacaan Al-Quran Interaktif'}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {language === 'en' 
                ? 'Read the Quran with beautiful typography, multiple font options, and audio recitations to enhance your memorization experience.'
                : 'Baca Al-Quran dengan tipografi yang cantik, pelbagai pilihan fon, dan bacaan audio untuk meningkatkan pengalaman hafazan anda.'
              }
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-accent-100 dark:bg-accent-900/30 rounded-2xl flex items-center justify-center mb-6">
              <Target className="h-8 w-8 text-accent-600 dark:text-accent-400" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              {language === 'en' ? 'Progress Tracking' : 'Penjejakan Kemajuan'}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {language === 'en' 
                ? 'Monitor your memorization progress with detailed analytics, daily goals, and achievement milestones to stay motivated.'
                : 'Pantau kemajuan hafazan anda dengan analitik terperinci, matlamat harian, dan pencapaian untuk kekal termotivasi.'
              }
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6">
              <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              {language === 'en' ? 'Teacher & Parent Support' : 'Sokongan Guru & Ibu Bapa'}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {language === 'en' 
                ? 'Connect with teachers and parents to receive guidance, track progress, and maintain accountability in your memorization journey.'
                : 'Berhubung dengan guru dan ibu bapa untuk menerima panduan, menjejaki kemajuan, dan mengekalkan akauntabiliti dalam perjalanan hafazan anda.'
              }
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6">
              <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              {language === 'en' ? 'Smart Analytics' : 'Analitik Pintar'}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {language === 'en' 
                ? 'Get insights into your learning patterns, identify areas for improvement, and optimize your memorization strategy with data-driven recommendations.'
                : 'Dapatkan pandangan tentang corak pembelajaran anda, kenal pasti kawasan untuk penambahbaikan, dan optimalkan strategi hafazan anda dengan cadangan berasaskan data.'
              }
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              {language === 'en' ? 'Multiple Scripts' : 'Pelbagai Skrip'}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {language === 'en' 
                ? 'Choose between Uthmani and IndoPak scripts, just like quran.com and tanzil.net, for the most authentic Quran reading experience.'
                : 'Pilih antara skrip Uthmani dan IndoPak, seperti quran.com dan tanzil.net, untuk pengalaman membaca Al-Quran yang paling autentik.'
              }
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mb-6">
              <CheckCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              {language === 'en' ? 'Islamic Values' : 'Nilai Islam'}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {language === 'en' 
                ? 'Built with Islamic principles in mind, respecting traditional teaching methods while embracing modern technology for better learning outcomes.'
                : 'Dibina dengan prinsip Islam, menghormati kaedah pengajaran tradisional sambil menerima teknologi moden untuk hasil pembelajaran yang lebih baik.'
              }
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center">
        <p className="text-neutral-600 dark:text-neutral-400">
          © 2025 | 1447 Hijrah MyHafiz. {language === 'en' ? 'Quran Memorization app by' : 'Aplikasi Hafazan Al-Quran oleh'} Syahnas@UstazBot
        </p>
      </footer>
    </div>
  );
}
