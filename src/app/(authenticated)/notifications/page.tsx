'use client';

import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Bell, UserPlus, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function NotificationsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Bell className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Access Denied
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Please log in to view your notifications.
          </p>
        </div>
      </div>
    );
  }

  // Mock notifications data - in a real app, this would come from your backend
  const notifications = [
    {
      id: 1,
      type: 'connection_request',
      title: 'New Teacher Connection Request',
      message: 'Ustaz Ahmad has requested to connect with you as your teacher.',
      timestamp: '2 hours ago',
      status: 'pending'
    },
    {
      id: 2,
      type: 'connection_request',
      title: 'New Parent Connection Request',
      message: 'Encik Ismail has requested to connect as your parent.',
      timestamp: '1 day ago',
      status: 'pending'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 dark:from-neutral-900 dark:to-neutral-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Bell className="h-16 w-16 text-primary-600 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            {t('notifications')}
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Stay updated with your Quran memorization journey
          </p>
        </div>

        {/* Notifications List */}
        <div className="max-w-4xl mx-auto">
          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-700"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserPlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                          {notification.title}
                        </h3>
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                          {notification.timestamp}
                        </span>
                      </div>
                      
                      <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center space-x-3">
                        <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                          <CheckCircle className="h-4 w-4" />
                          <span>Accept</span>
                        </button>
                        
                        <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                          <XCircle className="h-4 w-4" />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-12 text-center shadow-lg border border-neutral-200 dark:border-neutral-700">
              <Bell className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                No notifications yet
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                You're all caught up! Check back later for new updates.
              </p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              About Notifications
            </h3>
            <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
              <p>
                • Connection requests from teachers and parents will appear here
              </p>
              <p>
                • You can accept or decline connection requests
              </p>
              <p>
                • Notifications are automatically updated in real-time
              </p>
              <p>
                • You can manage your connections in the respective sections
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
