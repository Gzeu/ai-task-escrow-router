import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouterEscrow } from '@/contexts/RouterEscrowContext';
import { 
  TrendingUp, 
  Users, 
  Activity, 
  Award,
  Shield,
  Zap,
  Clock,
  DollarSign,
  BarChart3,
  Star,
  CheckCircle,
  AlertTriangle,
  Settings,
  RefreshCw
} from 'lucide-react';

interface DashboardStats {
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  totalVolume: string;
  protocolFees: string;
  gasSavings: string;
  topAgents: AgentMetric[];
  reputationDistribution: ReputationLevel[];
}

interface AgentMetric {
  address: string;
  reputationScore: number;
  completedTasks: number;
  totalEarned: string;
  successRate: number;
}

interface ReputationLevel {
  level: string;
  count: number;
  percentage: number;
  color: string;
}

export default function EnhancedDashboard() {
  const { client, isConnected } = useRouterEscrow();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  useEffect(() => {
    if (client && isConnected) {
      loadDashboardData();
    }
  }, [client, isConnected, selectedTimeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API calls
      const mockStats: DashboardStats = {
        totalTasks: 1247,
        activeTasks: 89,
        completedTasks: 1158,
        totalVolume: '12,450.5 EGLD',
        protocolFees: '247.1 EGLD',
        gasSavings: '15.3%',
        topAgents: [
          {
            address: 'erd1...agent1',
            reputationScore: 950,
            completedTasks: 142,
            totalEarned: '8,520.0 EGLD',
            successRate: 98.5
          },
          {
            address: 'erd1...agent2', 
            reputationScore: 875,
            completedTasks: 98,
            totalEarned: '5,890.0 EGLD',
            successRate: 96.2
          },
          {
            address: 'erd1...agent3',
            reputationScore: 750,
            completedTasks: 67,
            totalEarned: '3,945.0 EGLD',
            successRate: 94.0
          }
        ],
        reputationDistribution: [
          { level: 'Beginner', count: 45, percentage: 12.5, color: 'bg-gray-500' },
          { level: 'Intermediate', count: 89, percentage: 24.7, color: 'bg-blue-500' },
          { level: 'Advanced', count: 156, percentage: 43.2, color: 'bg-purple-500' },
          { level: 'Expert', count: 62, percentage: 17.2, color: 'bg-orange-500' },
          { level: 'Legendary', count: 10, percentage: 2.8, color: 'bg-yellow-500' }
        ]
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getReputationColor = (score: number): string => {
    if (score >= 1000) return 'text-yellow-600';
    if (score >= 751) return 'text-orange-600';
    if (score >= 501) return 'text-purple-600';
    if (score >= 251) return 'text-blue-600';
    return 'text-gray-600';
  };

  const getReputationLevel = (score: number): string => {
    if (score >= 1000) return 'Legendary';
    if (score >= 751) return 'Expert';
    if (score >= 501) return 'Advanced';
    if (score >= 251) return 'Intermediate';
    return 'Beginner';
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to view the enhanced dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Enhanced Dashboard - AI Task Escrow Router</title>
        <meta name="description" content="Advanced analytics and governance dashboard" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="container-wide py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Enhanced Dashboard</h1>
              <p className="text-gray-600 mt-2">v0.2.0 - Advanced Analytics & Governance</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select 
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="input"
              >
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              
              <button 
                onClick={loadDashboardData}
                className="btn btn-secondary flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : stats && (
            <div className="space-y-8">
              {/* Main Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card">
                  <div className="card-body">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <Activity className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-2xl font-bold text-gray-900">{stats.totalTasks.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Total Tasks</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body">
                    <div className="flex items-center">
                      <div className="p-3 bg-green-100 rounded-full">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-2xl font-bold text-gray-900">{stats.activeTasks.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Active Tasks</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body">
                    <div className="flex items-center">
                      <div className="p-3 bg-purple-100 rounded-full">
                        <DollarSign className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-2xl font-bold text-gray-900">{stats.totalVolume}</p>
                        <p className="text-sm text-gray-600">Total Volume</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body">
                    <div className="flex items-center">
                      <div className="p-3 bg-orange-100 rounded-full">
                        <Zap className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-2xl font-bold text-gray-900">{stats.gasSavings}</p>
                        <p className="text-sm text-gray-600">Gas Savings</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Protocol Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                  <div className="card-body">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Protocol Performance</h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Completion Rate</span>
                        <span className="font-semibold text-green-600">
                          {((stats.completedTasks / stats.totalTasks) * 100).toFixed(1)}%
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Protocol Fees</span>
                        <span className="font-semibold text-orange-600">{stats.protocolFees}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Avg Task Value</span>
                        <span className="font-semibold text-blue-600">
                          {(parseFloat(stats.totalVolume) / stats.completedTasks).toFixed(2)} EGLD
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reputation Distribution */}
                <div className="card">
                  <div className="card-body">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Reputation Distribution</h3>
                    
                    <div className="space-y-3">
                      {stats.reputationDistribution.map((level) => (
                        <div key={level.level} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full ${level.color}`}></div>
                            <span className="ml-3 text-gray-700">{level.level}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-900 font-semibold">{level.count}</span>
                            <span className="text-gray-600 ml-2">({level.percentage}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Agents */}
              <div className="card">
                <div className="card-body">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Agents</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Agent
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reputation
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
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {stats.topAgents.map((agent, index) => (
                          <tr key={agent.address} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8">
                                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                    <Users className="h-4 w-4 text-gray-600" />
                                  </div>
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">
                                    {formatAddress(agent.address)}
                                  </div>
                                  <div className={`text-xs ${getReputationColor(agent.reputationScore)}`}>
                                    {getReputationLevel(agent.reputationScore)}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="text-sm font-semibold text-gray-900">
                                  {agent.reputationScore}
                                </span>
                                <Star className="h-4 w-4 text-yellow-400 ml-2" />
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {agent.completedTasks}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className={`text-sm font-semibold ${
                                  agent.successRate >= 95 ? 'text-green-600' : 
                                  agent.successRate >= 90 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {agent.successRate.toFixed(1)}%
                                </span>
                                {agent.successRate >= 95 && (
                                  <Award className="h-4 w-4 text-green-500 ml-2" />
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                              {agent.totalEarned}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card">
                <div className="card-body">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button className="btn btn-primary flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Analytics
                    </button>
                    
                    <button className="btn btn-secondary flex items-center justify-center">
                      <Users className="h-4 w-4 mr-2" />
                      Agents
                    </button>
                    
                    <button className="btn btn-secondary flex items-center justify-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Governance
                    </button>
                    
                    <button className="btn btn-secondary flex items-center justify-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
