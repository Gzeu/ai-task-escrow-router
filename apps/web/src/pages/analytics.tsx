import React from 'react';
import Head from 'next/head';
import { useRouterEscrow } from '@/contexts/RouterEscrowContext';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  PieChart,
  Calendar
} from 'lucide-react';

interface AnalyticsData {
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  totalVolume: string;
  protocolFees: string;
  successRate: number;
  averageTaskValue: string;
  topAgents: AgentStats[];
  taskTrends: TaskTrend[];
  volumeByToken: TokenVolume[];
}

interface AgentStats {
  address: string;
  totalTasks: number;
  completedTasks: number;
  totalEarned: string;
  reputationScore: number;
}

interface TaskTrend {
  date: string;
  tasks: number;
  volume: string;
}

interface TokenVolume {
  token: string;
  volume: string;
  percentage: number;
}

export default function AnalyticsPage() {
  const { client, isConnected } = useRouterEscrow();
  const [analytics, setAnalytics] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [timeRange, setTimeRange] = React.useState('7d');

  React.useEffect(() => {
    if (client && isConnected) {
      loadAnalytics();
    }
  }, [client, isConnected, timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      const mockData: AnalyticsData = {
        totalTasks: 1247,
        activeTasks: 89,
        completedTasks: 1158,
        totalVolume: '1250000000000000000000',
        protocolFees: '12500000000000000000',
        successRate: 92.8,
        averageTaskValue: '1000000000000000000',
        topAgents: [
          {
            address: 'erd1...agent1',
            totalTasks: 45,
            completedTasks: 42,
            totalEarned: '450000000000000000000',
            reputationScore: 950
          },
          {
            address: 'erd1...agent2',
            totalTasks: 38,
            completedTasks: 35,
            totalEarned: '380000000000000000000',
            reputationScore: 920
          },
          {
            address: 'erd1...agent3',
            totalTasks: 32,
            completedTasks: 30,
            totalEarned: '320000000000000000000',
            reputationScore: 890
          }
        ],
        taskTrends: [
          { date: '2026-03-25', tasks: 45, volume: '450000000000000000000' },
          { date: '2026-03-26', tasks: 52, volume: '520000000000000000000' },
          { date: '2026-03-27', tasks: 48, volume: '480000000000000000000' },
          { date: '2026-03-28', tasks: 61, volume: '610000000000000000000' },
          { date: '2026-03-29', tasks: 58, volume: '580000000000000000000' },
          { date: '2026-03-30', tasks: 67, volume: '670000000000000000000' },
          { date: '2026-03-31', tasks: 72, volume: '720000000000000000000' },
        ],
        volumeByToken: [
          { token: 'EGLD', volume: '1000000000000000000000', percentage: 80 },
          { token: 'USDC', volume: '200000000000000000000', percentage: 16 },
          { token: 'WETH', volume: '50000000000000000000', percentage: 4 },
        ]
      };
      
      setAnalytics(mockData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: string, decimals: number = 18): string => {
    const value = BigInt(amount);
    const divisor = BigInt(10 ** decimals);
    const whole = value / divisor;
    const fraction = value % divisor;
    
    if (fraction === 0n) return whole.toString();
    
    const fractionStr = fraction.toString().padStart(decimals, '0').replace(/0+$/, '');
    return `${whole}.${fractionStr}`;
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to view analytics.</p>
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

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load analytics data.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Analytics - AI Task Escrow Router</title>
        <meta name="description" content="Protocol analytics and insights" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="container-wide py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Protocol Analytics</h1>
              <p className="text-gray-600 mt-2">Real-time insights into the AI Task Escrow Router ecosystem</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="input w-40"
              >
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              
              <button 
                onClick={loadAnalytics}
                className="btn btn-secondary"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalTasks.toLocaleString()}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Activity className="h-8 w-8 text-primary-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.activeTasks.toLocaleString()}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Clock className="h-8 w-8 text-warning-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.successRate}%</p>
                  </div>
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-8 w-8 text-success-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Volume</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatAmount(analytics.totalVolume)} EGLD
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <DollarSign className="h-8 w-8 text-primary-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Task Trends */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Task Trends</h3>
              </div>
              <div className="card-body">
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Chart visualization would go here</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Showing {analytics.taskTrends.length} days of data
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Volume by Token */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Volume by Token</h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {analytics.volumeByToken.map((token, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-primary-600"></div>
                        <span className="font-medium text-gray-900">{token.token}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {formatAmount(token.volume)}
                        </div>
                        <div className="text-sm text-gray-600">{token.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Agents */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Top Agents</h3>
            </div>
            <div className="card-body">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Agent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tasks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Success Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Earned
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reputation
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analytics.topAgents.map((agent, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {formatAddress(agent.address)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {agent.totalTasks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {((agent.completedTasks / agent.totalTasks) * 100).toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatAmount(agent.totalEarned)} EGLD
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            agent.reputationScore >= 900 ? 'bg-success-100 text-success-800' :
                            agent.reputationScore >= 700 ? 'bg-warning-100 text-warning-800' :
                            'bg-error-100 text-error-800'
                          }`}>
                            {agent.reputationScore}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Protocol Health */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="card">
              <div className="card-body">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-8 w-8 text-success-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Protocol Status</p>
                    <p className="text-lg font-semibold text-success-600">Healthy</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-8 w-8 text-primary-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                    <p className="text-lg font-semibold text-gray-900">+15.3%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center space-x-3">
                  <Users className="h-8 w-8 text-primary-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Agents</p>
                    <p className="text-lg font-semibold text-gray-900">234</p>
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
