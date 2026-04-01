/**
 * AI Task Escrow Router - Agents Discovery Page
 * Updated for v0.3.0 with multi-token support and reputation UI
 */

import { useState, useEffect } from 'react';
import { useGetAccountInfo, useGetIsLoggedIn } from '@multiversx/sdk-dapp/hooks';
import { Address } from '@multiversx/sdk-core/out';
import { formatAmount, calculateReputationScore, AgentReputation, TaskStatistics } from '@ai-task-escrow/sdk';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Search, Star, Clock, DollarSign, Award, TrendingUp, Users, Filter } from 'lucide-react';

interface AgentCardProps {
  agent: AgentReputation;
  onSelect: (address: string) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onSelect }) => {
  const successRate = (agent.performanceMetrics.successRate / 100).toFixed(1);
  const completionTime = Math.round(agent.performanceMetrics.averageCompletionTime / 3600);
  const earnings = formatAmount(agent.totalEarned);

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onSelect(agent.address)}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold">
              {agent.address.slice(0, 8)}...{agent.address.slice(-8)}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={agent.verificationStatus === 'Verified' ? 'default' : 'secondary'}>
                {agent.verificationStatus}
              </Badge>
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="text-sm font-medium">{agent.reputationScore}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Total Earned</div>
            <div className="font-semibold text-green-600">{earnings}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <TrendingUp className="w-4 h-4 mr-1" />
              Success Rate
            </div>
            <div className="font-semibold text-green-600">{successRate}%</div>
            <Progress value={parseFloat(successRate)} className="mt-1 h-2" />
          </div>
          <div>
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <Clock className="w-4 h-4 mr-1" />
              Avg Time
            </div>
            <div className="font-semibold">{completionTime}h</div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm text-gray-600">
            <Users className="w-4 h-4 inline mr-1" />
            {agent.totalTasks} tasks ({agent.completedTasks} completed)
          </div>
          <div className="text-sm text-gray-600">
            <Award className="w-4 h-4 inline mr-1" />
            {agent.specialization.length} specializations
          </div>
        </div>

        {agent.specialization.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {agent.specialization.slice(0, 3).map((spec, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {spec}
              </Badge>
            ))}
            {agent.specialization.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{agent.specialization.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex justify-between items-center text-sm text-gray-600">
          <div>Last active: {new Date(agent.lastActive * 1000).toLocaleDateString()}</div>
          <div>30d tasks: {agent.performanceMetrics.tasksCompletedLast30d}</div>
        </div>
      </CardContent>
    </Card>
  );
};

const AgentsPage: React.FC = () => {
  const { address } = useGetAccountInfo();
  const isLoggedIn = useGetIsLoggedIn();
  
  const [agents, setAgents] = useState<AgentReputation[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<AgentReputation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('reputation');
  const [filterSpecialization, setFilterSpecialization] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState<AgentReputation | null>(null);
  const [statistics, setStatistics] = useState<TaskStatistics | null>(null);

  // Mock data - in real implementation, fetch from API
  useEffect(() => {
    const mockAgents: AgentReputation[] = [
      {
        address: 'erd1...agent1',
        totalTasks: 150,
        completedTasks: 142,
        cancelledTasks: 5,
        disputedTasks: 3,
        totalEarned: BigInt('5000000000000000000000'), // 5000 EGLD
        reputationScore: 950,
        averageRating: 4.8,
        lastActive: Date.now() / 1000 - 86400,
        createdAt: Date.now() / 1000 - 7776000,
        specialization: ['AI Development', 'Machine Learning', 'Data Science'],
        verificationStatus: 'Verified',
        performanceMetrics: {
          averageCompletionTime: 72000, // 20 hours
          successRate: 9467, // 94.67%
          disputeRate: 200, // 2%
          totalEarnedLast30d: BigInt('500000000000000000000'), // 500 EGLD
          tasksCompletedLast30d: 25
        }
      },
      {
        address: 'erd1...agent2',
        totalTasks: 89,
        completedTasks: 85,
        cancelledTasks: 2,
        disputedTasks: 2,
        totalEarned: BigInt('3200000000000000000000'), // 3200 EGLD
        reputationScore: 880,
        averageRating: 4.6,
        lastActive: Date.now() / 1000 - 172800,
        createdAt: Date.now() / 1000 - 5184000,
        specialization: ['Web Development', 'Frontend', 'React'],
        verificationStatus: 'Verified',
        performanceMetrics: {
          averageCompletionTime: 54000, // 15 hours
          successRate: 9551, // 95.51%
          disputeRate: 225, // 2.25%
          totalEarnedLast30d: BigInt('450000000000000000000'), // 450 EGLD
          tasksCompletedLast30d: 18
        }
      },
      {
        address: 'erd1...agent3',
        totalTasks: 45,
        completedTasks: 40,
        cancelledTasks: 3,
        disputedTasks: 2,
        totalEarned: BigInt('1200000000000000000000'), // 1200 EGLD
        reputationScore: 750,
        averageRating: 4.2,
        lastActive: Date.now() / 1000 - 259200,
        createdAt: Date.now() / 1000 - 2592000,
        specialization: ['Content Writing', 'Technical Writing'],
        verificationStatus: 'Pending',
        performanceMetrics: {
          averageCompletionTime: 108000, // 30 hours
          successRate: 8889, // 88.89%
          disputeRate: 444, // 4.44%
          totalEarnedLast30d: BigInt('200000000000000000000'), // 200 EGLD
          tasksCompletedLast30d: 8
        }
      }
    ];

    setAgents(mockAgents);
    setFilteredAgents(mockAgents);
    
    const mockStats: TaskStatistics = {
      totalTasks: 284,
      completedTasks: 267,
      cancelledTasks: 10,
      disputedTasks: 7,
      totalVolume: BigInt('9400000000000000000000'), // 9400 EGLD
      averageTaskValue: BigInt('33000000000000000000'), // 33 EGLD
      mostActiveAgent: 'erd1...agent1',
      peakDailyTasks: 15
    };
    
    setStatistics(mockStats);
    setLoading(false);
  }, []);

  // Filter and sort agents
  useEffect(() => {
    let filtered = agents.filter(agent => {
      const matchesSearch = agent.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           agent.specialization.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesSpecialization = filterSpecialization === 'all' ||
                                  agent.specialization.includes(filterSpecialization);
      
      const matchesStatus = filterStatus === 'all' ||
                          agent.verificationStatus === filterStatus;
      
      return matchesSearch && matchesSpecialization && matchesStatus;
    });

    // Sort agents
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'reputation':
          return b.reputationScore - a.reputationScore;
        case 'success':
          return b.performanceMetrics.successRate - a.performanceMetrics.successRate;
        case 'earnings':
          return Number(b.totalEarned) - Number(a.totalEarned);
        case 'tasks':
          return b.totalTasks - a.totalTasks;
        case 'speed':
          return a.performanceMetrics.averageCompletionTime - b.performanceMetrics.averageCompletionTime;
        default:
          return 0;
      }
    });

    setFilteredAgents(filtered);
  }, [agents, searchTerm, sortBy, filterSpecialization, filterStatus]);

  const handleSelectAgent = (agentAddress: string) => {
    const agent = agents.find(a => a.address === agentAddress);
    if (agent) {
      setSelectedAgent(agent);
    }
  };

  const getAllSpecializations = () => {
    const specs = new Set<string>();
    agents.forEach(agent => {
      agent.specialization.forEach(spec => specs.add(spec));
    });
    return Array.from(specs).sort();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Agents Discovery</h1>
        <p className="text-gray-600">Find and connect with verified AI agents for your tasks</p>
      </div>

      {/* Statistics Overview */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Agents</p>
                  <p className="text-2xl font-bold">{agents.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-bold">{statistics.totalTasks}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold">
                    {((statistics.completedTasks / statistics.totalTasks) * 100).toFixed(1)}%
                  </p>
                </div>
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Volume</p>
                  <p className="text-2xl font-bold">{formatAmount(statistics.totalVolume)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search agents or specializations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="reputation">Reputation Score</SelectItem>
              <SelectItem value="success">Success Rate</SelectItem>
              <SelectItem value="earnings">Total Earnings</SelectItem>
              <SelectItem value="tasks">Total Tasks</SelectItem>
              <SelectItem value="speed">Completion Speed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterSpecialization} onValueChange={setFilterSpecialization}>
            <SelectTrigger>
              <SelectValue placeholder="Specialization..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specializations</SelectItem>
              {getAllSpecializations().map(spec => (
                <SelectItem key={spec} value={spec}>{spec}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Verified">Verified</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-gray-600">
          Found {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''}
        </p>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Advanced Filters
        </Button>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredAgents.map(agent => (
          <AgentCard
            key={agent.address}
            agent={agent}
            onSelect={handleSelectAgent}
          />
        ))}
      </div>

      {/* Selected Agent Details */}
      {selectedAgent && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Agent Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Performance Metrics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reputation Score:</span>
                    <span className="font-semibold">{selectedAgent.reputationScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Success Rate:</span>
                    <span className="font-semibold text-green-600">
                      {(selectedAgent.performanceMetrics.successRate / 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Completion:</span>
                    <span className="font-semibold">
                      {Math.round(selectedAgent.performanceMetrics.averageCompletionTime / 3600)} hours
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Tasks:</span>
                    <span className="font-semibold">{selectedAgent.totalTasks}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedAgent.specialization.map((spec, index) => (
                    <Badge key={index} variant="outline">{spec}</Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <Button>View Full Profile</Button>
              <Button variant="outline">Contact Agent</Button>
              <Button variant="outline">Create Task</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AgentsPage;
