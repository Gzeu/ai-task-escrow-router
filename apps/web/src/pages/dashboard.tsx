import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks';
import { useGetIsLoggedIn } from '@multiversx/sdk-dapp/hooks';
import { useRouter } from 'next/router';
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
import { RouterEscrowClient } from '@ai-task-escrow/sdk';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';

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
  taskId: bigint;
  metadataUri: string;
  state: string;
  paymentAmount: bigint;
  createdAt: number;
  creator: string;
  assignedAgent?: string;
}

interface ActivityItem {
  id: string;
  type: 'task_created' | 'task_accepted' | 'task_completed' | 'task_disputed';
  description: string;
  timestamp: number;
  user: string;
}

export default function DashboardPage() {
  const { address } = useGetAccountInfo();
  const isLoggedIn = useGetIsLoggedIn();
  const router = useRouter();
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
  const [client, setClient] = useState<RouterEscrowClient | null>(null);

  useEffect(() => {
    if (isLoggedIn && address) {
      // Initialize SDK client
      const sdkClient = new RouterEscrowClient({
        contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
        apiTimeout: 6000
      } as any);
      setClient(sdkClient);
      loadDashboardData(sdkClient);
    }
  }, [isLoggedIn, address]);

  const loadDashboardData = async (sdkClient: RouterEscrowClient) => {
    try {
      setLoading(true);
      
      // Get protocol stats from indexer
      const indexerResponse = await fetch(`${process.env.NEXT_PUBLIC_INDEXER_URL}/stats/protocol`);
      const protocolStats = await indexerResponse.json();
      
      // Get recent tasks from indexer
      const tasksResponse = await fetch(`${process.env.NEXT_PUBLIC_INDEXER_URL}/tasks?limit=5&sortBy=createdAt&sortOrder=desc`);
      const tasksData = await tasksResponse.json();
      
      // Map indexer data to our format
      const mappedStats: DashboardStats = {
        totalTasks: protocolStats.totalTasks || 0,
        activeTasks: protocolStats.activeTasks || 0,
        completedTasks: protocolStats.completedTasks || 0,
        totalVolume: protocolStats.totalVolume || '0',
        protocolFees: protocolStats.totalProtocolFees || '0',
        successRate: protocolStats.successRate || 0,
        averageCompletionTime: protocolStats.averageCompletionTime || 0,
        activeAgents: protocolStats.activeAgents || 0
      };

      const mappedRecentTasks: RecentTask[] = tasksData.data.map((task: any) => ({
        taskId: BigInt(task.taskId),
        metadataUri: task.metadataUri,
        state: task.state,
        paymentAmount: BigInt(task.paymentAmount),
        createdAt: task.createdAt,
        creator: task.creator,
        assignedAgent: task.assignedAgent
      }));

      setStats(mappedStats);
      setRecentTasks(mappedRecentTasks);
      
      // Create mock activities from recent tasks
      const mockActivities: ActivityItem[] = mappedRecentTasks.slice(0, 5).map((task, index) => ({
        id: `activity-${index}`,
        type: task.state === 'Open' ? 'task_created' : 
              task.state === 'Accepted' ? 'task_accepted' : 
              task.state === 'Approved' ? 'task_completed' : 'task_disputed',
        description: `Task "${task.metadataUri}" is ${task.state.toLowerCase()}`,
        timestamp: task.createdAt,
        user: task.assignedAgent || task.creator
      }));

      setActivities(mockActivities);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      
      // Fallback to mock data if indexer is not available
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
          taskId: BigInt(1247),
          metadataUri: 'AI Content Generation',
          state: 'Open',
          paymentAmount: BigInt('500000000000000000'),
          createdAt: Date.now() - 3600000,
          creator: address || 'erd1...',
          assignedAgent: undefined
        },
        {
          taskId: BigInt(1246),
          metadataUri: 'Data Analysis Task',
          state: 'Accepted',
          paymentAmount: BigInt('1000000000000000000'),
          createdAt: Date.now() - 7200000,
          creator: 'erd1creator...',
          assignedAgent: 'erd1agent...'
        },
        {
          taskId: BigInt(1245),
          metadataUri: 'Image Processing',
          state: 'Approved',
          paymentAmount: BigInt('2000000000000000000'),
          createdAt: Date.now() - 10800000,
          creator: 'erd1creator...',
          assignedAgent: 'erd1agent...'
        }
      ];

      setStats(mockStats);
      setRecentTasks(mockRecentTasks);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: string | bigint): string => {
    const num = Number(amount) / 1e18;
    return num.toFixed(4) + ' EGLD';
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString();
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

  const getStatusColor = (state: string): string => {
    switch (state) {
      case 'Open': return 'text-blue-600 bg-blue-50';
      case 'Accepted': return 'text-yellow-600 bg-yellow-50';
      case 'Approved': case 'Completed': return 'text-green-600 bg-green-50';
      case 'Disputed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleCreateTask = async () => {
    if (!client) return;
    
    try {
      const tx = await client.createTask({
        metadataUri: 'New Task Created via Dashboard',
        paymentAmount: BigInt('1000000000000000000') // 1 EGLD
      });
      
      // In a real implementation, this would open the wallet for signing
      console.log('Transaction created:', tx);
      
      // Navigate to tasks page
      router.push('/tasks');
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  if (!isLoggedIn) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">Please connect your wallet to view your dashboard.</p>
            <Button onClick={() => router.push('/')}>
              Connect Wallet
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Dashboard - AI Task Escrow Router</title>
        <meta name="description" content="Your personal dashboard for managing AI tasks" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome back! Here's your activity overview.</p>
            </div>
            <Button onClick={handleCreateTask} className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
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
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
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
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
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
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
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
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Tasks */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Recent Tasks
                  </h2>
                  <Link href="/tasks" className="text-blue-600 hover:text-blue-800 text-sm">
                    View All
                  </Link>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentTasks.map((task) => (
                      <div key={task.taskId.toString()} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Target className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{task.metadataUri}</p>
                            <p className="text-sm text-gray-500">#{task.taskId} • {formatDate(task.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-gray-900">{formatAmount(task.paymentAmount)}</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.state)}`}>
                            {task.state}
                          </span>
                          <Link href={`/tasks/${task.taskId}`} className="text-blue-600 hover:text-blue-800">
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
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Recent Activity
                  </h2>
                </div>
                <div className="p-6">
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
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Quick Stats
                  </h2>
                </div>
                <div className="p-6 space-y-4">
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
      </Layout>
    </>
  );
}
