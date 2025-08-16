'use client';

import { useAuth } from '@/hooks/useAuth';
import Dashboard from '@/components/Dashboard';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 text-primary-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Access Denied
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Please log in to access the dashboard.
          </p>
        </div>
      </div>
    );
  }

  return <Dashboard />;
}
