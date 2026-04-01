import React from 'react';
import Link from 'next/link';
import { useRouterEscrow } from '@/contexts/RouterEscrowContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  DollarSign, 
  Users, 
  Calendar,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  budget: string;
  status: 'Open' | 'In Progress' | 'Completed' | 'Cancelled' | 'Disputed';
  createdAt: number;
  deadline: number;
  assignedAgent?: string;
  creator: string;
  reward: string;
  category: string;
  tags: string[];
}

interface TaskFilter {
  status?: string;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export default function TasksPage() {
  const { client, isConnected, address } = useRouterEscrow();
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<TaskFilter>({});
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  React.useEffect(() => {
    const loadTasks = async () => {
      try {
        if (client) {
          // Mock data for demonstration
          const mockTasks: Task[] = [
            {
              id: 'task-001',
              title: 'AI Model Training',
              description: 'Train a machine learning model for image recognition',
              budget: '100000000000000000000', // 100 EGLD
              status: 'In Progress',
              createdAt: Date.now() / 1000 - 86400 * 2,
              deadline: Date.now() / 1000 + 86400 * 5,
              creator: 'erd1creator1',
              reward: '100000000000000000000',
              category: 'AI Development',
              tags: ['machine-learning', 'ai', 'training']
            },
            {
              id: 'task-002',
              title: 'Smart Contract Audit',
              description: 'Comprehensive security audit of DeFi protocol',
              budget: '50000000000000000000', // 50 EGLD
              status: 'Open',
              createdAt: Date.now() / 1000 - 86400,
              deadline: Date.now() / 1000 + 86400 * 7,
              creator: 'erd1creator2',
              reward: '50000000000000000000',
              category: 'Security',
              tags: ['audit', 'security', 'smart-contract']
            },
            {
              id: 'task-003',
              title: 'Data Analysis Dashboard',
              description: 'Build interactive dashboard for data visualization',
              budget: '75000000000000000000', // 75 EGLD
              status: 'Open',
              createdAt: Date.now() / 1000 - 86400 * 3,
              deadline: Date.now() / 1000 + 86400 * 10,
              creator: 'erd1creator3',
              reward: '75000000000000000000',
              category: 'Development',
              tags: ['dashboard', 'data-analysis', 'react']
            },
            {
              id: 'task-004',
              title: 'Content Creation',
              description: 'Create engaging content for marketing campaign',
              budget: '25000000000000000000', // 25 EGLD
              status: 'Completed',
              createdAt: Date.now() / 1000 - 86400 * 5,
              deadline: Date.now() / 1000 + 86400 * 4,
              creator: 'erd1creator4',
              reward: '25000000000000000000',
              assignedAgent: 'erd1agent1',
              category: 'Creative',
              tags: ['content', 'marketing', 'writing']
            },
            {
              id: 'task-005',
              title: 'Blockchain Integration',
              description: 'Integrate payment system with blockchain network',
              budget: '150000000000000000000', // 150 EGLD
              status: 'Disputed',
              createdAt: Date.now() / 1000 - 86400 * 7,
              deadline: Date.now() / 1000 + 86400 * 6,
              creator: 'erd1creator5',
              reward: '150000000000000000000',
              category: 'Development',
              tags: ['blockchain', 'integration', 'payment']
            }
          ];

          setTasks(mockTasks);
        }
      } catch (error) {
        console.error('Failed to load tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [client]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Disputed': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open': return <Clock className="w-4 h-4" />;
      case 'In Progress': return <Users className="w-4 h-4" />;
      case 'Completed': return <CheckCircle className="w-4 h-4" />;
      case 'Cancelled': return <AlertCircle className="w-4 h-4" />;
      case 'Disputed': return <AlertCircle className="w-4 h-4" />;
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

  const filteredTasks = tasks.filter(task => {
    if (filter.status && task.status !== filter.status) return false;
    if (filter.category && task.category !== filter.category) return false;
    if (filter.search && !task.title.toLowerCase().includes(filter.search?.toLowerCase() || '') && 
        !task.description.toLowerCase().includes(filter.search?.toLowerCase() || '') &&
        !task.tags.some(tag => tag.toLowerCase().includes(filter.search?.toLowerCase() || ''))) return false;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0;
    
    switch (filter.sortBy) {
      case 'deadline':
        comparison = new Date(a.deadline * 1000).getTime() - new Date(b.deadline * 1000).getTime();
        break;
      case 'budget':
        comparison = parseInt(b.budget) - parseInt(a.budget);
        break;
      case 'createdAt':
        comparison = b.createdAt - a.createdAt;
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
          <p className="text-gray-600 mb-6">Please connect your wallet to view and manage tasks</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Task
            </button>
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
                  placeholder="Search tasks..."
                  value={filter.search || ''}
                  onChange={(e) => setFilter({...filter, search: e.target.value})}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                />
              </div>
            </div>

            <div>
              <select
                value={filter.status || ''}
                onChange={(e) => setFilter({...filter, status: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Disputed">Disputed</option>
              </select>
            </div>

            <div>
              <select
                value={filter.category || ''}
                onChange={(e) => setFilter({...filter, category: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="AI Development">AI Development</option>
                <option value="Security">Security</option>
                <option value="Development">Development</option>
                <option value="Creative">Creative</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>

            <div>
              <select
                value={filter.sortBy || ''}
                onChange={(e) => setFilter({...filter, sortBy: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sort by</option>
                <option value="createdAt">Created Date</option>
                <option value="deadline">Deadline</option>
                <option value="budget">Budget</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Task Grid */}
      <div className="container-wide py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">{task.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{task.category}</p>
                  </div>
                  <Badge className={getStatusColor(task.status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(task.status)}
                      <span>{task.status}</span>
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{task.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-1" />
                      <span>Budget:</span>
                    </div>
                    <div className="font-semibold">{formatAmount(task.budget)}</div>
                  </div>
                  
                  <div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Deadline:</span>
                    </div>
                    <div className="font-semibold">{formatDate(task.deadline)}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-1" />
                      <span>Creator:</span>
                    </div>
                    <div className="font-semibold">{task.creator.slice(0, 6)}...{task.creator.slice(-4)}</div>
                  </div>
                  
                  <div>
                    <div className="flex items-center text-sm text-gray-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>Reward:</span>
                    </div>
                    <div className="font-semibold">{formatAmount(task.reward)}</div>
                  </div>
                </div>

                {task.assignedAgent && (
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-1" />
                        <span>Assigned to:</span>
                      </div>
                      <div className="font-semibold">{task.assignedAgent.slice(0, 6)}...{task.assignedAgent.slice(-4)}</div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <div className="flex space-x-2">
                    <Button className="text-sm">
                      View Details
                    </Button>
                    {task.status === 'Open' && (
                      <Button className="text-sm bg-blue-600 text-white hover:bg-blue-700">
                        Accept Task
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Create New Task</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter task description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget (EGLD)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter budget in EGLD"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="AI Development">AI Development</option>
                  <option value="Security">Security</option>
                  <option value="Development">Development</option>
                  <option value="Creative">Creative</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline (days)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter deadline in days"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button 
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Create Task
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
