import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouterEscrow } from '@/contexts/RouterEscrowContext';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Eye,
  Plus,
  Calendar,
  Activity,
  Target,
  Zap,
  Shield,
  BarChart3,
  PieChart,
  FileText
} from 'lucide-react';

interface DashboardStats {
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  totalVolume: string;
  protocolFees: string;
  successRate: number;
  averageCompletionTime: number;
  activeAgents: number;
}

interface RecentTask {
  id: string;
  title: string;
  status: string;
  amount: string;
  createdAt: number;
}

interface ActivityItem {
  id: string;
  type: 'task_created' | 'task_accepted' | 'task_completed' | 'task_disputed';
  description: string;
  timestamp: number;
  user: string;
}

export default function DashboardPage() {
  const { client, isConnected, address } = useRouterEscrow();
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    activeTasks: 0,
    completedTasks: 0,
    totalVolume: '0',
    protocolFees: '0',
    successRate: 0,
    averageCompletionTime: 0,
    activeAgents: 0
  });
  const [recentTasks, setRecentTasks] = useState<RecentTask[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected) {
      loadDashboardData();
    }
  }, [isConnected]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock data - în realitate ar veni de la API/indexer
      const mockStats: DashboardStats = {
        totalTasks: 1247,
        activeTasks: 89,
        completedTasks: 1158,
        totalVolume: '1250000000000000000000', // 1250 EGLD
        protocolFees: '12500000000000000000', // 12.5 EGLD
        successRate: 95.2,
        averageCompletionTime: 43200, // 12 hours
        activeAgents: 234
      };

      const mockRecentTasks: RecentTask[] = [
        {
          id: '1247',
          title: 'AI Content Generation',
          status: 'Open',
          amount: '500000000000000000', // 0.5 EGLD
          createdAt: Date.now() - 3600000
        },
        {
          id: '1246',
          title: 'Data Analysis Task',
          status: 'Accepted',
          amount: '1000000000000000000', // 1 EGLD
          createdAt: Date.now() - 7200000
        },
        {
          id: '1245',
          title: 'Image Processing',
          status: 'Completed',
          amount: '2000000000000000000', // 2 EGLD
          createdAt: Date.now() - 10800000
        }
      ];

      const mockActivities: ActivityItem[] = [
        {
          id: '1',
          type: 'task_created',
          description: 'Created new task "AI Content Generation"',
          timestamp: Date.now() - 3600000,
          user: address || 'erd1...'
        },
        {
          id: '2',
          type: 'task_accepted',
          description: 'Task "Data Analysis" was accepted by agent',
          timestamp: Date.now() - 7200000,
          user: 'erd1agent...'
        },
        {
          id: '3',
          type: 'task_completed',
          description: 'Task "Image Processing" was completed successfully',
          timestamp: Date.now() - 10800000,
          user: 'erd1agent...'
        }
      ];

      setStats(mockStats);
      setRecentTasks(mockRecentTasks);
      setActivities(mockActivities);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: string): string => {
    const num = parseFloat(amount) / 1e18;
    return num.toFixed(4) + ' EGLD';
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'task_created': return <Plus className="h-4 w-4 text-blue-500" />;
      case 'task_accepted': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'task_completed': return <CheckCircle className="h-4 w-4 text-purple-500" />;
      case 'task_disputed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'open': return 'text-blue-600 bg-blue-50';
      case 'accepted': return 'text-yellow-600 bg-yellow-50';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'disputed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to view your dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - AI Task Escrow Router</title>
        <meta name="description" content="Your personal dashboard for managing AI tasks" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="container-wide py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome back! Here's your activity overview.</p>
            </div>
            <Link href="/tasks/create" className="btn btn-primary flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card hover:shadow-lg transition-shadow">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalTasks.toLocaleString()}</p>
                    <div className="flex items-center mt-1">
                      <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-xs text-green-600">+12% from last month</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Target className="h-8 w-8 text-primary-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card hover:shadow-lg transition-shadow">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeTasks.toLocaleString()}</p>
                    <div className="flex items-center mt-1">
                      <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                      <span className="text-xs text-red-600">-5% from last week</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Clock className="h-8 w-8 text-warning-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card hover:shadow-lg transition-shadow">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Volume</p>
                    <p className="text-2xl font-bold text-gray-900">{formatAmount(stats.totalVolume)}</p>
                    <div className="flex items-center mt-1">
                      <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-xs text-green-600">+23% from last month</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <DollarSign className="h-8 w-8 text-success-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card hover:shadow-lg transition-shadow">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
                    <div className="flex items-center mt-1">
                      <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-xs text-green-600">+2.1% improvement</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Shield className="h-8 w-8 text-primary-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Tasks */}
            <div className="lg:col-span-2">
              <div className="card">
                <div className="card-header flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Recent Tasks
                  </h2>
                  <Link href="/tasks" className="text-primary-600 hover:text-primary-800 text-sm">
                    View All
                  </Link>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    {recentTasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <Target className="h-5 w-5 text-primary-600" />
                            </div>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{task.title}</p>
                            <p className="text-sm text-gray-500">#{task.id} • {formatDate(task.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-gray-900">{formatAmount(task.amount)}</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                          <Link href={`/tasks/${task.id}`} className="text-primary-600 hover:text-primary-800">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="space-y-6">
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Recent Activity
                  </h2>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Quick Stats
                  </h2>
                </div>
                <div className="card-body space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Agents</span>
                    <span className="font-semibold text-gray-900">{stats.activeAgents}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg. Completion</span>
                    <span className="font-semibold text-gray-900">
                      {Math.round(stats.averageCompletionTime / 3600)}h
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Protocol Fees</span>
                    <span className="font-semibold text-gray-900">{formatAmount(stats.protocolFees)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completed Tasks</span>
                    <span className="font-semibold text-gray-900">{stats.completedTasks.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
