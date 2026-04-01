import React from 'react';
import { useRouterEscrow } from '@/contexts/RouterEscrowContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Activity
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
  status: 'Open' | 'In Progress' | 'Completed' | 'Cancelled';
  reward: string;
  deadline: number;
  createdAt: number;
}

export default function DashboardPage() {
  const { client, isConnected, address } = useRouterEscrow();

  const [stats, setStats] = React.useState<DashboardStats>({
    totalTasks: 0,
    activeTasks: 0,
    completedTasks: 0,
    totalVolume: '0',
    protocolFees: '0',
    successRate: 0,
    averageCompletionTime: 0,
    activeAgents: 0
  });

  const [recentTasks, setRecentTasks] = React.useState<RecentTask[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadDashboardData = async () => {
      try {
        if (client) {
          // Mock data for demonstration
          const mockStats: DashboardStats = {
            totalTasks: 274,
            activeTasks: 89,
            completedTasks: 185,
            totalVolume: '1250000000000000000000', // 1250 EGLD
            protocolFees: '12500000000000000000', // 12.5 EGLD
            successRate: 94.5,
            averageCompletionTime: 72, // hours
            activeAgents: 45
          };

          const mockRecentTasks: RecentTask[] = [
            {
              id: 'task-001',
              title: 'AI Model Training',
              status: 'In Progress',
              reward: '100000000000000000000', // 100 EGLD
              deadline: Date.now() / 1000 + 86400 * 3, // 3 days
              createdAt: Date.now() / 1000 - 86400 // 1 day ago
            },
            {
              id: 'task-002',
              title: 'Smart Contract Audit',
              status: 'Open',
              reward: '50000000000000000000', // 50 EGLD
              deadline: Date.now() / 1000 + 86400 * 7, // 7 days
              createdAt: Date.now() / 1000 - 86400 * 2 // 2 days ago
            },
            {
              id: 'task-003',
              title: 'Data Analysis Project',
              status: 'Completed',
              reward: '75000000000000000000', // 75 EGLD
              deadline: Date.now() / 1000 + 86400 * 5, // 5 days
              createdAt: Date.now() / 1000 - 86400 * 3 // 3 days ago
            }
          ];

          setStats(mockStats);
          setRecentTasks(mockRecentTasks);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [client]);

  const formatAmount = (amount: string): string => {
    const value = parseInt(amount) / 1000000000000000000;
    return `${value} EGLD`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open': return <Clock className="w-4 h-4" />;
      case 'In Progress': return <Activity className="w-4 h-4" />;
      case 'Completed': return <CheckCircle className="w-4 h-4" />;
      case 'Cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Connect Wallet</h1>
          <p className="text-gray-600 mb-6">Please connect your wallet to access the dashboard</p>
          <Button onClick={() => {}}>
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container-wide py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Welcome back,</span>
              <span className="text-sm font-medium text-gray-900">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-wide py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalTasks}</div>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.activeTasks}</div>
              <p className="text-xs text-gray-500 mt-1">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
              <p className="text-xs text-gray-500 mt-1">Successfully finished</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatAmount(stats.totalVolume)}</div>
              <p className="text-xs text-gray-500 mt-1">All transactions</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-xl font-bold text-gray-900">{stats.successRate}%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Task completion rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg. Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-gray-900">{stats.averageCompletionTime}h</div>
              <p className="text-xs text-gray-500 mt-1">Hours per task</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-xl font-bold text-gray-900">{stats.activeAgents}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Registered agents</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Protocol Fees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-yellow-500 mr-2" />
                <span className="text-xl font-bold text-gray-900">{formatAmount(stats.protocolFees)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Total collected</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{task.title}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Reward: {formatAmount(task.reward)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(task.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(task.status)}
                        <span>{task.status}</span>
                      </div>
                    </Badge>
                    <div className="text-xs text-gray-500">
                      {new Date(task.createdAt * 1000).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
