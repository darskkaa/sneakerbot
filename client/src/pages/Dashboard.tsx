import React, { useEffect, useState } from 'react';
import { 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useAppContext } from '../context/AppContext';
import { LoadingSpinner, AccountGenerator } from '../components/common';
import { supabase } from '../lib/supabaseClient';

// Import ActivityLog type from AppContext to avoid conflicts
import type { ActivityLog } from '../context/AppContext';

interface DashboardStats {
  totalCheckouts: number;
  activeTasks: number;
  successRate: number;
  failedAttempts: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

// StatCard component for displaying individual statistics
const StatCard = ({ title, value, icon }: StatCardProps) => (
  <div className="bg-dark-panel rounded-lg p-6 shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
      </div>
      <div className="rounded-full bg-dark-panel p-3">
        {icon}
      </div>
    </div>
  </div>
);

// ActivityItem component for displaying individual activity logs
const ActivityItem = ({ activity }: { activity: ActivityLog }) => {
  const getActivityIcon = () => {
    switch (activity.type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failure':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <InformationCircleIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="flex items-start space-x-3 p-4 hover:bg-dark-panel/50 rounded-lg transition-colors">
      <div className="flex-shrink-0 mt-0.5">
        {getActivityIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{activity.content}</p>
        {activity.details && (
          <p className="text-sm text-gray-400 mt-1">{activity.details}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { stats, activities, loading } = useAppContext();
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('day');
  const [showAccountGenerator, setShowAccountGenerator] = useState(false);
  

  
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const handleAccountGenerated = (accountData: any) => {
    console.log('Account generated successfully:', accountData);
    // You can add the account to your context or perform other actions here
  };

  // Prepare dashboard stats for display
  const dashboardStats = [
    {
      title: 'Total Checkouts',
      value: stats?.totalCheckouts || 0,
      icon: <CheckCircleIcon className="h-6 w-6 text-green-500" />
    },
    {
      title: 'Success Rate',
      value: `${stats?.successRate || 0}%`,
      icon: <InformationCircleIcon className="h-6 w-6 text-blue-500" />
    },
    {
      title: 'Active Tasks',
      value: stats?.activeTasks || 0,
      icon: <ClockIcon className="h-6 w-6 text-yellow-500" />
    },
    {
      title: 'Failed Attempts',
      value: stats?.failedAttempts || 0,
      icon: <XCircleIcon className="h-6 w-6 text-red-500" />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <button
          onClick={() => setShowAccountGenerator(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Generate Account</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Recent Activities */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">Recent Activities</h2>
        </div>
        <div className="mt-4 overflow-hidden bg-dark-panel rounded-lg shadow">
          <div className="divide-y divide-gray-700">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            ) : (
              <div className="p-6 text-center text-gray-400">
                No activities found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Generator Modal */}
      <AccountGenerator
        isOpen={showAccountGenerator}
        onClose={() => setShowAccountGenerator(false)}
        onSuccess={handleAccountGenerated}
      />
    </div>
  );
}
