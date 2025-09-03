import { useState } from 'react';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useAppContext } from '../context/AppContext';
import { LoadingSpinner, AccountGenerator } from '../components/common';

// Define ActivityLog interface locally (ideally, import from a shared types file)
interface ActivityLog {
  id: string; // or number
  type: 'checkout_success' | 'task_created' | 'proxy_failed' | 'profile_updated' | 'settings_changed' | string; // Example types
  content: string;
  timestamp: string; // ISO string or Date object
  user?: string; // Optional: if actions are user-specific
  relatedId?: string | number; // Optional: ID of related task, profile, proxy etc.
  details?: string; // Optional: additional details for the activity
}


export default function Dashboard() {
  const { stats, activities, loading } = useAppContext();
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('day');
  const [showAccountGenerator, setShowAccountGenerator] = useState(false);
  
  // Mock statistics for the dashboard
  const dashboardStats = [
    {
      title: 'Total Checkouts',
      value: stats?.totalCheckouts || 0,
      change: 12.5,
      changeType: 'positive',
      icon: <CheckCircleIcon className="h-6 w-6 text-wsb-success" />
    },
    {
      title: 'Success Rate',
      value: `${stats?.successRate || 0}%`,
      change: -2.3,
      changeType: 'negative',
      icon: <InformationCircleIcon className="h-6 w-6 text-wsb-primary" />
    },
    {
      title: 'Active Tasks',
      value: stats?.activeTasks || 0,
      changeType: 'neutral',
      icon: <ClockIcon className="h-6 w-6 text-wsb-warning" />
    },
    {
      title: 'Failed Attempts',
      value: stats?.failedAttempts || 0,
      change: -8.1,
      changeType: 'positive',
      icon: <XCircleIcon className="h-6 w-6 text-wsb-error" />
    }
  ];
  
  // Mock recent activities
  const recentActivities = activities || [
    {
      id: '1',
      type: 'success',
      message: 'Successfully checked out Nike Dunk Low "Panda"',
      timestamp: '10 min ago',
      details: 'Size: US 10, Price: $110'
    },
    {
      id: '2',
      type: 'failure',
      message: 'Failed to checkout Jordan 4 "Military Black"',
      timestamp: '25 min ago',
      details: 'Error: Payment verification failed'
    },
    {
      id: '3',
      type: 'info',
      message: 'Added 5 new proxies to "Residential" group',
      timestamp: '1 hour ago'
    },
    {
      id: '4',
      type: 'success',
      message: 'Successfully checked out Yeezy Boost 350 "Beluga"',
      timestamp: '3 hours ago',
      details: 'Size: US 9, Price: $220'
    }
  ];
  
  if (loading?.stats || loading?.activities) {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-wsb-text">Dashboard</h1>
        <button
          onClick={() => setShowAccountGenerator(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Generate Account</span>
        </button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {dashboardStats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-wsb-text-secondary text-sm">{stat.title}</p>
                <p className="text-2xl font-semibold text-wsb-text mt-1">{stat.value}</p>
                
                {stat.change !== undefined && (
                  <div className="flex items-center mt-1">
                    {stat.changeType === 'positive' ? (
                      <ArrowUpIcon className="h-3 w-3 text-wsb-success mr-1" />
                    ) : stat.changeType === 'negative' ? (
                      <ArrowDownIcon className="h-3 w-3 text-wsb-error mr-1" />
                    ) : null}
                    
                    <span 
                      className={`text-xs ${
                        stat.changeType === 'positive' 
                          ? 'text-wsb-success' 
                          : stat.changeType === 'negative' 
                            ? 'text-wsb-error' 
                            : 'text-wsb-text-secondary'
                      }`}
                    >
                      {stat.changeType !== 'neutral' && Math.abs(stat.change).toFixed(1)}%
                      {stat.changeType === 'positive' ? ' increase' : stat.changeType === 'negative' ? ' decrease' : ''}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-2 rounded-lg bg-gray-800">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Time Frame Selector */}
      <div className="flex space-x-2">
        <button
          onClick={() => setTimeframe('day')}
          className={`px-3 py-1 rounded-md text-sm ${
            timeframe === 'day'
              ? 'bg-wsb-primary text-white'
              : 'bg-gray-800 text-wsb-text-secondary hover:bg-gray-700'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setTimeframe('week')}
          className={`px-3 py-1 rounded-md text-sm ${
            timeframe === 'week'
              ? 'bg-wsb-primary text-white'
              : 'bg-gray-800 text-wsb-text-secondary hover:bg-gray-700'
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setTimeframe('month')}
          className={`px-3 py-1 rounded-md text-sm ${
            timeframe === 'month'
              ? 'bg-wsb-primary text-white'
              : 'bg-gray-800 text-wsb-text-secondary hover:bg-gray-700'
          }`}
        >
          This Month
        </button>
      </div>
      
      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-lg font-medium text-wsb-text mb-4">Recent Activity</h2>
        
        <div className="space-y-4">
          {recentActivities.map((activity: ActivityLog) => (
            <div key={activity.id} className="flex items-start space-x-3 py-2 border-b border-gray-700 last:border-0">
              <div className={`p-1.5 rounded-full ${
                activity.type === 'success' 
                  ? 'bg-wsb-success bg-opacity-20' 
                  : activity.type === 'failure'
                    ? 'bg-wsb-error bg-opacity-20'
                    : 'bg-wsb-primary bg-opacity-20'
              }`}>
                {activity.type === 'success' ? (
                  <CheckCircleIcon className="h-5 w-5 text-wsb-success" />
                ) : activity.type === 'failure' ? (
                  <XCircleIcon className="h-5 w-5 text-wsb-error" />
                ) : (
                  <InformationCircleIcon className="h-5 w-5 text-wsb-primary" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="text-wsb-text font-medium">{activity.content}</p>
                  <span className="text-xs text-wsb-text-secondary">{activity.timestamp}</span>
                </div>
                
                {activity.details && (
                  <p className="text-sm text-wsb-text-secondary mt-1">{activity.details}</p>
                )}
              </div>
            </div>
          ))}
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
