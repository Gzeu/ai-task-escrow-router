import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useGetAccountInfo, useGetIsLoggedIn } from '@multiversx/sdk-dapp/hooks';
import { useRouter } from 'next/router';
import { 
  Plus, 
  Filter, 
  Search, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  Calendar,
  User,
  ArrowUpDown,
  ChevronDown,
  FileText
} from 'lucide-react';
import { RouterEscrowClient } from '@ai-task-escrow/sdk';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';

interface Task {
  taskId: bigint;
  metadataUri: string;
  state: string;
  paymentAmount: bigint;
  createdAt: number;
  creator: string;
  assignedAgent?: string;
  deadline?: number;
  reviewTimeout?: number;
}

interface TaskFilter {
  state?: string;
  creator?: string;
  assignedAgent?: string;
  minAmount?: string;
  maxAmount?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export default function TasksPage() {
  const { address } = useGetAccountInfo();
  const isLoggedIn = useGetIsLoggedIn();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TaskFilter>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [client, setClient] = useState<RouterEscrowClient | null>(null);

  useEffect(() => {
    if (isLoggedIn && address) {
      // Initialize SDK client
      const sdkClient = new RouterEscrowClient({
        contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
        apiTimeout: 6000
      } as any);
      setClient(sdkClient);
      loadTasks(sdkClient);
    }
  }, [isLoggedIn, address]);

  useEffect(() => {
    if (client) {
      const debouncedSearch = setTimeout(() => {
        loadTasks(client);
      }, 500);
      return () => clearTimeout(debouncedSearch);
    }
  }, [searchTerm, filter, client]);

  const loadTasks = async (sdkClient: RouterEscrowClient) => {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
      if (filter.state) params.append('state', filter.state);
      if (filter.creator) params.append('creator', filter.creator);
      if (filter.assignedAgent) params.append('assignedAgent', filter.assignedAgent);
      if (filter.minAmount) params.append('minAmount', filter.minAmount);
      if (filter.maxAmount) params.append('maxAmount', filter.maxAmount);
      if (searchTerm) params.append('search', searchTerm);
      
      params.append('sortBy', filter.sortBy || 'createdAt');
      params.append('sortOrder', filter.sortOrder || 'desc');
      params.append('limit', '20');

      // Get tasks from indexer
      const response = await fetch(`${process.env.NEXT_PUBLIC_INDEXER_URL}/tasks?${params.toString()}`);
      const data = await response.json();
      
      const mappedTasks: Task[] = data.data.map((task: any) => ({
        taskId: BigInt(task.taskId),
        metadataUri: task.metadataUri,
        state: task.state,
        paymentAmount: BigInt(task.paymentAmount),
        createdAt: task.createdAt,
        creator: task.creator,
        assignedAgent: task.assignedAgent,
        deadline: task.deadline,
        reviewTimeout: task.reviewTimeout
      }));

      setTasks(mappedTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      
      // Fallback to mock data
      const mockTasks: Task[] = [
        {
          taskId: BigInt(1247),
          metadataUri: 'AI Content Generation',
          state: 'Open',
          paymentAmount: BigInt('500000000000000000'),
          createdAt: Date.now() - 3600000,
          creator: 'erd1creator...',
          assignedAgent: undefined,
          deadline: Date.now() + 86400000, // 24 hours
          reviewTimeout: Date.now() + 172800000 // 48 hours
        },
        {
          taskId: BigInt(1246),
          metadataUri: 'Data Analysis Task',
          state: 'Accepted',
          paymentAmount: BigInt('1000000000000000000'),
          createdAt: Date.now() - 7200000,
          creator: 'erd1creator...',
          assignedAgent: 'erd1agent...',
          deadline: Date.now() + 86400000,
          reviewTimeout: Date.now() + 172800000
        },
        {
          taskId: BigInt(1245),
          metadataUri: 'Image Processing',
          state: 'Approved',
          paymentAmount: BigInt('2000000000000000000'),
          createdAt: Date.now() - 10800000,
          creator: 'erd1creator...',
          assignedAgent: 'erd1agent...',
          deadline: Date.now() + 86400000,
          reviewTimeout: Date.now() + 172800000
        }
      ];
      
      setTasks(mockTasks);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: bigint): string => {
    const num = Number(amount) / 1e18;
    return num.toFixed(4) + ' EGLD';
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getStatusColor = (state: string): string => {
    switch (state) {
      case 'Open': return 'text-blue-600 bg-blue-50';
      case 'Accepted': return 'text-yellow-600 bg-yellow-50';
      case 'Submitted': return 'text-purple-600 bg-purple-50';
      case 'Approved': case 'Completed': return 'text-green-600 bg-green-50';
      case 'Cancelled': return 'text-gray-600 bg-gray-50';
      case 'Disputed': return 'text-red-600 bg-red-50';
      case 'Resolved': return 'text-indigo-600 bg-indigo-50';
      case 'Refunded': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (state: string) => {
    switch (state) {
      case 'Open': return <Clock className="h-4 w-4" />;
      case 'Accepted': return <User className="h-4 w-4" />;
      case 'Submitted': return <AlertTriangle className="h-4 w-4" />;
      case 'Approved': case 'Completed': return <CheckCircle className="h-4 w-4" />;
      case 'Cancelled': return <AlertTriangle className="h-4 w-4" />;
      case 'Disputed': return <AlertTriangle className="h-4 w-4" />;
      case 'Resolved': return <CheckCircle className="h-4 w-4" />;
      case 'Refunded': return <DollarSign className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleFilterChange = (key: keyof TaskFilter, value: any) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilter({});
    setSearchTerm('');
  };

  const handleAcceptTask = async (taskId: bigint) => {
    if (!client || !address) return;
    
    try {
      console.log('Task accepted (mock):', taskId);
      
      // In real implementation, this would open wallet for signing
      // Refresh tasks after successful transaction
      setTimeout(() => loadTasks(client), 2000);
    } catch (error) {
      console.error('Failed to accept task:', error);
    }
  };

  const handleViewDetails = (taskId: bigint) => {
    router.push(`/tasks/${taskId.toString()}`);
  };

  if (!isLoggedIn) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">Please connect your wallet to view available tasks.</p>
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
        <title>Tasks - AI Task Escrow Router</title>
        <meta name="description" content="Browse and manage AI tasks" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
              <p className="text-gray-600 mt-2">Browse and manage available AI tasks.</p>
            </div>
            <div className="flex space-x-4">
              <Button onClick={() => setShowFilters(!showFilters)} className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Link href="/tasks/create">
                <Button className="flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </Link>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* State Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filter.state || ''}
                  onChange={(e) => handleFilterChange('state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All States</option>
                  <option value="Open">Open</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Approved">Approved</option>
                  <option value="Disputed">Disputed</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={filter.sortBy || 'createdAt'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="createdAt">Created Date</option>
                  <option value="paymentAmount">Amount</option>
                  <option value="deadline">Deadline</option>
                </select>
              </div>
            </div>

            {/* Active Filters */}
            {(filter.state || searchTerm) && (
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Active filters: {filter.state && `Status: ${filter.state}`} {searchTerm && `Search: "${searchTerm}"`}
                </span>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>

          {/* Tasks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <div key={task.taskId.toString()} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.metadataUri}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          <span>{task.creator.slice(0, 6)}...{task.creator.slice(-4)}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{formatDate(task.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.state)}`}>
                        {task.state}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Payment</span>
                      <span className="font-semibold text-gray-900">{formatAmount(task.paymentAmount)}</span>
                    </div>

                    {task.deadline && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Deadline</span>
                        <span className="text-sm text-gray-900">{formatDate(task.deadline)}</span>
                      </div>
                    )}

                    {task.assignedAgent && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Assigned Agent</span>
                        <span className="text-sm text-gray-900">{task.assignedAgent.slice(0, 6)}...{task.assignedAgent.slice(-4)}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-4 border-t border-gray-200">
                    {task.state === 'Open' && (
                      <Button 
                        onClick={() => handleAcceptTask(task.taskId)}
                        className="flex-1"
                      >
                        Accept Task
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(task.taskId)}
                      className="flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {tasks.length === 0 && !loading && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-600">
                {searchTerm || filter.state 
                  ? 'Try adjusting your search or filters.' 
                  : 'No tasks are currently available. Check back later!'}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
