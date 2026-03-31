import { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Plus,
  Zap,
  Activity,
  ShoppingBag,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { LoadingSpinner, AccountGenerator } from '../components/common';
import { cn } from '../lib/utils';
import type { ActivityLog } from '../context/AppContext';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  accent?: string;
}

const StatCard = ({ title, value, icon, trend, trendUp, accent = 'text-primary' }: StatCardProps) => (
  <div className="stat-card group hover:border-border/80 transition-colors">
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
      </div>
      <div className={cn('p-2 rounded-lg bg-secondary', accent)}>
        {icon}
      </div>
    </div>
    {trend && (
      <p className={cn('text-xs font-medium', trendUp ? 'text-success' : 'text-muted-foreground')}>
        {trend}
      </p>
    )}
  </div>
);

const getActivityIcon = (type: ActivityLog['type']) => {
  switch (type) {
    case 'checkout_success':
    case 'proxy_success':
      return <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />;
    case 'checkout_failure':
    case 'proxy_failed':
      return <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />;
    case 'stock_detected':
      return <Zap className="w-4 h-4 text-warning flex-shrink-0" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />;
    default:
      return <Info className="w-4 h-4 text-primary flex-shrink-0" />;
  }
};

const ActivityItem = ({ activity }: { activity: ActivityLog }) => (
  <div className="flex items-start gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors">
    <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-foreground leading-snug">{activity.content}</p>
      {activity.details && (
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{activity.details}</p>
      )}
    </div>
    <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5 flex-shrink-0">
      {activity.timestamp}
    </span>
  </div>
);

export default function Dashboard() {
  const { stats, activities, loading } = useAppContext();
  const [showAccountGenerator, setShowAccountGenerator] = useState(false);

  if (loading.stats || loading.activities) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const dashboardStats: StatCardProps[] = [
    {
      title: 'Total Checkouts',
      value: stats?.totalCheckouts ?? 0,
      icon: <ShoppingBag className="w-5 h-5" />,
      accent: 'text-success',
      trend: 'All time',
    },
    {
      title: 'Success Rate',
      value: `${stats?.successRate ?? 0}%`,
      icon: <TrendingUp className="w-5 h-5" />,
      accent: 'text-primary',
      trend: stats?.successRate && stats.successRate > 60 ? 'Above average' : 'Session',
      trendUp: (stats?.successRate ?? 0) > 60,
    },
    {
      title: 'Active Tasks',
      value: stats?.activeTasks ?? 0,
      icon: <Activity className="w-5 h-5" />,
      accent: 'text-warning',
      trend: stats?.activeTasks && stats.activeTasks > 0 ? 'Currently running' : 'No active tasks',
    },
    {
      title: 'Failed',
      value: stats?.failedAttempts ?? 0,
      icon: <XCircle className="w-5 h-5" />,
      accent: 'text-destructive',
      trend: 'All time',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Monitor your bot performance</p>
        </div>
        <button
          onClick={() => setShowAccountGenerator(true)}
          className="btn-primary text-xs gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Generate Account
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Activity Feed */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
          </div>
          <span className="text-xs text-muted-foreground">{activities.length} events</span>
        </div>
        <div className="divide-y divide-border/50 max-h-[420px] overflow-y-auto">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))
          ) : (
            <div className="px-4 py-12 text-center">
              <Activity className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No activity yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Start a task to see activity here</p>
            </div>
          )}
        </div>
      </div>

      <AccountGenerator
        isOpen={showAccountGenerator}
        onClose={() => setShowAccountGenerator(false)}
        onSuccess={(data: any) => console.log('Account generated:', data)}
      />
    </div>
  );
}
