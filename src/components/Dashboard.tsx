'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { BookOpen, Users, BarChart3, Bell, TrendingUp, Award, Search } from 'lucide-react';
import StudentConnections from './StudentConnections';
import StudentProgress from './StudentProgress';
import StudentConnectionRequests from './StudentConnectionRequests';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'connections' | 'progress' | 'requests'>('connections');
  const [searchEmail, setSearchEmail] = useState('');

  const handleSearch = () => {
    // Implement search logic here
    console.log('Searching for:', searchEmail);
    // For now, just clear the search input
    setSearchEmail('');
  };

  if (!user) {
    return null;
  }

  // Different tabs based on user role
  if (user.role === 'Student') {
    const studentTabs = [
      {
        id: 'requests',
        name: t('connectionRequests'),
        icon: Bell,
        description: t('acceptRejectRequests')
      },
      {
        id: 'progress',
        name: t('myProgress'),
        icon: BarChart3,
        description: t('trackProgress')
      }
    ];

    return (
      <div className="min-h-screen bg-[#F6EFD2] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-8">
            {/* Header */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#E2DDB4]">
              <div className="flex items-center space-x-6 mb-8">
                <div className="w-16 h-16 bg-blue-600 rounded-xl p-4">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-black mb-3">
                    {t('studentDashboard')}
                  </h1>
                  <p className="text-lg text-black">
                    {t('welcomeBack')}, <span className="font-semibold text-blue-600">{user.name}</span>! 
                    {t('manageConnections')}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-lg border border-[#E2DDB4]">
              <div className="border-b border-[#E2DDB4]">
                <nav className="-mb-px flex space-x-8 px-8">
                  {studentTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as 'connections' | 'progress' | 'requests')}
                        className={`py-6 px-1 border-b-2 font-medium text-lg transition-all duration-200 ${
                          isActive
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-black hover:text-blue-600 hover:border-[#E2DDB4]'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg p-2 transition-all duration-200 ${
                            isActive 
                              ? 'bg-blue-600 bg-opacity-20' 
                              : 'bg-[#F6EFD2]'
                          }`}>
                            <Icon className={`h-6 w-6 transition-all duration-200 ${
                              isActive ? 'text-blue-600' : 'text-black'
                            }`} />
                          </div>
                          <div className="text-left">
                            <span className="block">{tab.name}</span>
                            <span className="text-sm font-normal text-black">
                              {tab.description}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-8">
                {activeTab === 'requests' && (
                  <div className="animate-fade-in-up">
                    <StudentConnectionRequests />
                  </div>
                )}
                {activeTab === 'progress' && (
                  <div className="animate-fade-in-up">
                    <StudentProgress userRole="Student" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Teacher/Parent dashboard
  if (user.role !== 'Teacher' && user.role !== 'Parent') {
    return null;
  }

  const tabs = [
    {
      id: 'connections',
      name: user.role === 'Teacher' ? t('studentConnections') : t('childConnections'),
      icon: Users,
      description: user.role === 'Teacher' 
        ? t('manageStudentConnections')
        : t('monitorChildrenJourney')
    },
    {
      id: 'progress',
      name: user.role === 'Teacher' ? t('studentProgress') : t('childProgress'),
      icon: BarChart3,
      description: user.role === 'Teacher'
        ? t('trackStudentProgress')
        : t('viewChildProgress')
    }
  ];

  return (
    <div className="min-h-screen bg-[#F6EFD2] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#E2DDB4]">
            <div className="flex items-center space-x-6 mb-8">
              <div className="w-16 h-16 bg-blue-600 rounded-xl p-4">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-black mb-3">
                  {user.role === 'Teacher' ? t('teacherDashboard') : t('parentDashboard')}
                </h1>
                <p className="text-lg text-black">
                  {t('welcomeBack')}, <span className="font-semibold text-blue-600">{user.name}</span>! 
                  {user.role === 'Teacher' ? t('manageStudents') : t('manageChildren')} {t('and')} {t('trackProgress')}.
                </p>
              </div>
            </div>
          </div>

          {/* Main Dashboard Content */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#E2DDB4]">
            {/* Tab Navigation - Changed to Buttons for Mobile */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mb-6">
              <button
                onClick={() => setActiveTab('connections')}
                className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 ${
                  activeTab === 'connections'
                    ? 'bg-blue-100 border-2 border-blue-300 text-blue-800 shadow-md'
                    : 'bg-gray-50 border-2 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                }`}
              >
                <div className="w-8 h-8 bg-blue-600 rounded-lg p-2">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-sm sm:text-base">Student Connections</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Manage your student connections</p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('progress')}
                className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 ${
                  activeTab === 'progress'
                    ? 'bg-blue-100 border-2 border-blue-300 text-blue-800 shadow-md'
                    : 'bg-gray-50 border-2 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                }`}
              >
                <div className="w-8 h-8 bg-green-600 rounded-lg p-2">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-sm sm:text-base">Student Progress</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Track detailed progress reports</p>
                </div>
              </button>
            </div>

            {/* Content Area */}
            {activeTab === 'connections' && (
              <div className="animate-fade-in-up">
                <StudentConnections userRole={user.role as 'Teacher' | 'Parent'} />
              </div>
            )}

            {activeTab === 'progress' && (
              <div className="animate-fade-in-up">
                <StudentProgress userRole={user.role as 'Teacher' | 'Parent'} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
