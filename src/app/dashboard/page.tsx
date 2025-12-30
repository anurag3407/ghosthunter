'use client';

import Link from 'next/link';
import { Card } from '@/components/ui';

// Mock data for dashboard
const stats = [
  { label: 'Total Projects', value: '12', change: '+2', trend: 'up' },
  { label: 'Active Tasks', value: '24', change: '-3', trend: 'down' },
  { label: 'Team Members', value: '8', change: '+1', trend: 'up' },
  { label: 'Completion Rate', value: '87%', change: '+5%', trend: 'up' },
];

const recentActivity = [
  { id: 1, action: 'Created new project', item: 'Website Redesign', time: '2 hours ago' },
  { id: 2, action: 'Completed task', item: 'User Authentication', time: '4 hours ago' },
  { id: 3, action: 'Added team member', item: 'Jane Smith', time: '1 day ago' },
  { id: 4, action: 'Updated settings', item: 'Notification preferences', time: '2 days ago' },
];

const quickActions = [
  { label: 'New Project', icon: '📁', href: '/dashboard/projects/new' },
  { label: 'Add Task', icon: '✅', href: '/dashboard/tasks/new' },
  { label: 'Invite Member', icon: '👥', href: '/dashboard/team/invite' },
  { label: 'View Reports', icon: '📊', href: '/dashboard/reports' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Welcome back, User! 👋
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          Here&apos;s what&apos;s happening with your projects today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} variant="bordered" padding="md">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {stat.label}
            </p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                {stat.value}
              </p>
              <span
                className={`text-sm font-medium ${
                  stat.trend === 'up'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {stat.change}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card variant="bordered" padding="md">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </Card>

      {/* Recent Activity */}
      <Card variant="bordered" padding="md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Recent Activity
          </h2>
          <Link
            href="/dashboard/activity"
            className="text-sm text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
          >
            View all
          </Link>
        </div>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  {activity.action}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {activity.item}
                </p>
              </div>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
