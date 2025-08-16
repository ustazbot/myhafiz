'use client';

import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { BookOpen, Users, Target, TrendingUp, ArrowRight, Star, CheckCircle, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
              Welcome back, {user.name}!
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8">
              Continue your Quran memorization journey
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/dashboard"
                className="btn-primary flex items-center space-x-2"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/quran"
                className="btn-secondary flex items-center space-x-2"
              >
                <BookOpen className="h-5 w-5" />
                <span>Read Quran</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 dark:from-neutral-900 dark:to-neutral-800">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="h-4 w-4" />
            <span>Trusted by thousands of students worldwide</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 leading-tight">
            Master the Quran with{' '}
            <span className="text-primary-600 dark:text-primary-400">MyHafiz</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 mb-8 max-w-3xl mx-auto leading-relaxed">
            A comprehensive platform designed to help students, teachers, and parents 
            track Quran memorization progress with modern tools and traditional wisdom.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <Link
              href="/login"
              className="btn-primary flex items-center space-x-2 text-lg px-8 py-4"
            >
              <span>Get Started</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/register"
              className="btn-secondary flex items-center space-x-2 text-lg px-8 py-4"
            >
              <span>Create Account</span>
            </Link>
          </div>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Free to use</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Privacy focused</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Islamic values</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
            Everything you need to memorize the Quran
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Our platform combines traditional Islamic education with modern technology 
            to create the most effective memorization experience.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mb-6">
              <BookOpen className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Interactive Quran Reading
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Read the Quran with beautiful typography, multiple font options, and 
              audio recitations to enhance your memorization experience.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-accent-100 dark:bg-accent-900/30 rounded-2xl flex items-center justify-center mb-6">
              <Target className="h-8 w-8 text-accent-600 dark:text-accent-400" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Progress Tracking
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Monitor your memorization progress with detailed analytics, daily goals, 
              and achievement milestones to stay motivated.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6">
              <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Teacher & Parent Support
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Connect with teachers and parents to receive guidance, track progress, 
              and maintain accountability in your memorization journey.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6">
              <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Smart Analytics
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Get insights into your learning patterns, identify areas for improvement, 
              and optimize your memorization strategy with data-driven recommendations.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6">
              <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Multiple Scripts
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Choose between Uthmani and IndoPak scripts, just like quran.com and 
              tanzil.net, for the most authentic Quran reading experience.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mb-6">
              <CheckCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Islamic Values
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Built with Islamic principles in mind, respecting traditional teaching 
              methods while embracing modern technology for better learning outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center">
        <p className="text-neutral-600 dark:text-neutral-400">
          © 2025 | 1447 Hijrah MyHafiz. Quran Memorization app by Syahnas@UstazBot
        </p>
      </footer>
    </div>
  );
}
