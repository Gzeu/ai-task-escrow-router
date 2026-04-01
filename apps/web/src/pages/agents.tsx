import React from 'react';
import Link from 'next/link';
import { useRouterEscrow } from '@/contexts/RouterEscrowContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Star, 
  Clock, 
  TrendingUp, 
  Award, 
  Filter,
  Search,
  MapPin,
  CheckCircle,
  DollarSign
} from 'lucide-react';

interface Agent {
  address: string;
  reputationScore: number;
  averageRating: number;
  totalTasks: number;
  completedTasks: number;
  cancelledTasks: number;
  totalEarned: string;
  successRate: number;
  averageCompletionTime: number;
  lastActive: number;
  createdAt: number;
  specialization: string[];
  verificationStatus: 'Verified' | 'Pending' | 'Unverified' | 'Suspended';
  performanceMetrics: {
    averageCompletionTime: number;
    successRate: number;
    disputeRate: number;
    totalEarnedLast30d: string;
    tasksCompletedLast30d: number;
  };
}

interface AgentFilter {
  search?: string;
  specialization?: string;
  verificationStatus?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export default function AgentsPage() {
  const { client, isConnected, address } = useRouterEscrow();
  const [agents, setAgents] = React.useState<Agent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<AgentFilter>({});
  const [selectedAgent, setSelectedAgent] = React.useState<Agent | null>(null);

  React.useEffect(() => {
    const loadAgents = async () => {
      try {
        if (client) {
          // Mock data for demonstration
          const mockAgents: Agent[] = [
            {
              address: 'erd1agent1',
              reputationScore: 950,
              averageRating: 4.8,
              totalTasks: 150,
              completedTasks: 142,
              cancelledTasks: 5,
              totalEarned: '5000000000000000000000', // 5000 EGLD
              successRate: 94.7,
              averageCompletionTime: 72,
              lastActive: Date.now() / 1000 - 86400,
              createdAt: Date.now() / 1000 - 7776000,
              specialization: ['AI Development', 'Machine Learning', 'Data Science'],
              verificationStatus: 'Verified',
              performanceMetrics: {
                averageCompletionTime: 72000,
                successRate: 9467,
                disputeRate: 200,
                totalEarnedLast30d: '500000000000000000000', // 500 EGLD
                tasksCompletedLast30d: 25
              }
            },
            {
              address: 'erd1agent2',
              reputationScore: 880,
              averageRating: 4.6,
              totalTasks: 89,
              completedTasks: 85,
              cancelledTasks: 2,
              totalEarned: '3200000000000000000', // 3200 EGLD
              successRate: 95.5,
              averageCompletionTime: 54000,
              lastActive: Date.now() / 1000 - 172800,
              createdAt: Date.now() / 1000 - 5184000,
              specialization: ['Web Development', 'Frontend', 'React'],
              verificationStatus: 'Verified',
              performanceMetrics: {
                averageCompletionTime: 54000,
                successRate: 9551,
                disputeRate: 225,
                totalEarnedLast30d: '450000000000000000', // 450 EGLD
                tasksCompletedLast30d: 18
              }
            },
            {
              address: 'erd1agent3',
              reputationScore: 750,
              averageRating: 4.2,
              totalTasks: 45,
              completedTasks: 40,
              cancelledTasks: 3,
              totalEarned: '1200000000000000000', // 1200 EGLD
              successRate: 88.9,
              averageCompletionTime: 108000,
              lastActive: Date.now() / 1000 - 259200,
              createdAt: Date.now() / 1000 - 2592000,
              specialization: ['Content Writing', 'Technical Writing'],
              verificationStatus: 'Pending',
              performanceMetrics: {
                averageCompletionTime: 108000,
                successRate: 8889,
                disputeRate: 444,
                totalEarnedLast30d: '200000000000000000', // 200 EGLD
                tasksCompletedLast30d: 8
              }
            }
          ];

          setAgents(mockAgents);
        }
      } catch (error) {
        console.error('Failed to load agents:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAgents();
  }, [client]);

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'Verified': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Unverified': return 'bg-gray-100 text-gray-800';
      case 'Suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'Verified': return <CheckCircle className="w-4 h-4" />;
      case 'Pending': return <Clock className="w-4 h-4" />;
      case 'Unverified': return <Users className="w-4 h-4" />;
      case 'Suspended': return <Award className="w-4 h-4" />;
      default: return null;
    }
  };

  const formatAmount = (amount: string): string => {
    const value = parseInt(amount) / 1000000000000000000;
    return `${value} EGLD`;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const filteredAgents = agents.filter(agent => {
    if (filter.verificationStatus && agent.verificationStatus !== filter.verificationStatus) return false;
    if (filter.specialization && !agent.specialization.includes(filter.specialization)) return false;
    if (filter.search && !agent.address.toLowerCase().includes(filter.search?.toLowerCase() || '') && 
        !agent.specialization.some(spec => spec.toLowerCase().includes(filter.search?.toLowerCase() || ''))) return false;
    return true;
  });

  const sortedAgents = [...filteredAgents].sort((a, b) => {
    let comparison = 0;
    
    switch (filter.sortBy) {
      case 'reputation':
        comparison = b.reputationScore - a.reputationScore;
        break;
      case 'tasks':
        comparison = b.totalTasks - a.totalTasks;
        break;
      case 'successRate':
        comparison = b.successRate - a.successRate;
        break;
      case 'earned':
        comparison = parseInt(b.totalEarned) - parseInt(a.totalEarned);
        break;
      default:
        comparison = 0;
    }
    
    return filter.sortOrder === 'desc' ? comparison : -comparison;
  });

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Connect Wallet</h1>
          <p className="text-gray-600 mb-6">Please connect your wallet to view and manage agents</p>
          <button 
            onClick={() => {}}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Connect Wallet
          </button>
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
            <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Dashboard
              </Link>
              <Link href="/tasks" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Tasks
              </Link>
              <Link href="/agents" className="text-gray-900 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors border-b-2 border-blue-600">
                Agents
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm">
        <div className="container-wide py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={filter.search || ''}
                  onChange={(e) => setFilter({...filter, search: e.target.value})}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                />
              </div>
            </div>

            <div>
              <select
                value={filter.verificationStatus || ''}
                onChange={(e) => setFilter({...filter, verificationStatus: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="Verified">Verified</option>
                <option value="Pending">Pending</option>
                <option value="Unverified">Unverified</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            <div>
              <select
                value={filter.sortBy || ''}
                onChange={(e) => setFilter({...filter, sortBy: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sort by</option>
                <option value="reputation">Reputation Score</option>
                <option value="tasks">Total Tasks</option>
                <option value="successRate">Success Rate</option>
                <option value="earned">Total Earned</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container-wide py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{agents.length}</div>
              <p className="text-xs text-gray-500 mt-1">Registered agents</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Verified Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {agents.filter(a => a.verificationStatus === 'Verified').length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Verified agents</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Average Reputation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {agents.length > 0 ? Math.round(agents.reduce((sum, agent) => sum + agent.reputationScore, 0) / agents.length) : 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Across all agents</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Tasks Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {agents.reduce((sum, agent) => sum + agent.completedTasks, 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Across all agents</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="container-wide">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAgents.map((agent) => (
            <Card key={agent.address} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {agent.address.slice(0, 8)}...{agent.address.slice(-4)}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getVerificationColor(agent.verificationStatus)}>
                        <div className="flex items-center space-x-1">
                          {getVerificationIcon(agent.verificationStatus)}
                          <span>{agent.verificationStatus}</span>
                        </div>
                      </Badge>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm text-gray-600">{agent.averageRating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-1" />
                      <span>Tasks:</span>
                    </div>
                    <div className="font-semibold">{agent.totalTasks}</div>
                  </div>
                  
                  <div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span>Completed:</span>
                    </div>
                    <div className="font-semibold">{agent.completedTasks}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="flex items-center text-sm text-gray-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>Reputation:</span>
                    </div>
                    <div className="font-semibold">{agent.reputationScore}</div>
                  </div>
                  
                  <div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>Last Active:</span>
                    </div>
                    <div className="font-semibold">{formatDate(agent.lastActive)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-1" />
                      <span>Total Earned:</span>
                    </div>
                    <div className="font-semibold">{formatAmount(agent.totalEarned)}</div>
                  </div>
                  
                  <div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Award className="w-4 h-4 mr-1" />
                      <span>Success Rate:</span>
                    </div>
                    <div className="font-semibold">{(agent.successRate / 100).toFixed(1)}%</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {agent.specialization.map((spec, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div>
                    <div className="text-xs text-gray-600">Joined</div>
                    <div className="font-semibold">{formatDate(agent.createdAt)}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-600">Performance</div>
                    <div className="font-semibold">
                      <div className="flex justify-between mb-1">
                        <span>Avg Completion:</span>
                        <span>{(agent.performanceMetrics.averageCompletionTime / 3600).toFixed(1)}h</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>Success Rate:</span>
                        <span>{(agent.performanceMetrics.successRate / 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-4">
                  <Button className="text-sm">
                    View Profile
                  </Button>
                  <Button className="text-sm bg-blue-600 text-white hover:bg-blue-700">
                    Hire Agent
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Agent Profile</h2>
              <button 
                onClick={() => setSelectedAgent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-700">Address</div>
                  <div className="font-mono text-sm text-gray-900">{selectedAgent.address}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700">Reputation Score</div>
                  <div className="font-semibold">{selectedAgent.reputationScore}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700">Average Rating</div>
                  <div className="font-semibold">{selectedAgent.averageRating.toFixed(1)}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700">Total Tasks</div>
                  <div className="font-semibold">{selectedAgent.totalTasks}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700">Success Rate</div>
                  <div className="font-semibold">{(selectedAgent.successRate / 100).toFixed(1)}%</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700">Total Earned</div>
                  <div className="font-semibold">{formatAmount(selectedAgent.totalEarned)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-700">Performance Metrics</div>
                </div>
                <div className="text-sm text-gray-900">
                  <div className="flex justify-between mb-1">
                    <span>Avg Completion Time:</span>
                    <span>{(selectedAgent.performanceMetrics.averageCompletionTime / 3600).toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Success Rate:</span>
                    <span>{(selectedAgent.performanceMetrics.successRate / 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Dispute Rate:</span>
                    <span>{(selectedAgent.performanceMetrics.disputeRate / 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-700">30-Day Performance</div>
                </div>
                <div className="text-sm text-gray-900">
                  <div className="flex justify-between mb-1">
                    <span>Tasks Completed:</span>
                    <span>{selectedAgent.performanceMetrics.tasksCompletedLast30d}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Amount Earned:</span>
                    <span>{formatAmount(selectedAgent.performanceMetrics.totalEarnedLast30d)}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700">Specialization</div>
                <div className="flex flex-wrap gap-1">
                  {selectedAgent.specialization.map((spec, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button 
                onClick={() => setSelectedAgent(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
