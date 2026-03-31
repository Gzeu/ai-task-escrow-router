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
      
      const mockStats: DashboardStats = {
        totalTasks: 1247,
        activeTasks: 89,
        completedTasks: 1158,
        totalVolume: '1250000000000000000000',
        protocolFees: '12500000000000000000',
        successRate: 95.2,
        averageCompletionTime: 43200,
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome back! Here's your activity overview.</p>
            </div>
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTasks.toLocaleString()}</p>
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
                </div>
                <div className="flex-shrink-0">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Tasks</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <div key={task.taskId.toString()} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{task.metadataUri}</p>
                      <p className="text-sm text-gray-500">#{task.taskId}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{formatAmount(task.paymentAmount)}</div>
                      <div className="text-sm text-gray-500">{task.state}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
