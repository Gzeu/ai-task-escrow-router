import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouterEscrow } from '@/contexts/RouterEscrowContext';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  User,
  Calendar,
  DollarSign,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

// Local implementations
interface Task {
  taskId: string;
  creator: string;
  assignedAgent?: string;
  paymentToken: string;
  paymentAmount: string;
  feeBpsSnapshot: number;
  createdAt: number;
  acceptedAt?: number;
  deadline?: number;
  reviewTimeout?: number;
  metadataUri: string;
  resultUri?: string;
  state: TaskState;
  disputeMetadataUri?: string;
  ap2MandateHash?: string;
  x402PaymentRef?: string;
  gasUsed?: string;
  completionTime?: number;
  priorityFee?: string;
  agentReputationSnapshot?: number;
  paymentNonce?: number;
}

enum TaskState {
  Open = "Open",
  Accepted = "Accepted",
  Submitted = "Submitted",
  Approved = "Approved",
  Cancelled = "Cancelled",
  Disputed = "Disputed",
  Refunded = "Refunded",
  Resolved = "Resolved"
}

interface TaskFilters {
  state?: TaskState[];
  creator?: string;
  assignedAgent?: string;
  dateRange?: 'today' | 'week' | 'month' | 'all';
  minAmount?: string;
  maxAmount?: string;
}

export default function TasksPage() {
  const { client, isConnected } = useRouterEscrow();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TaskFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const mockTasks: Task[] = [
    {
      taskId: "1",
      creator: "erd1...",
      assignedAgent: "erd2...",
      paymentToken: "EGLD",
      paymentAmount: "1000000000000000000",
      feeBpsSnapshot: 300,
      createdAt: Date.now() - 86400000,
      acceptedAt: Date.now() - 86000000,
      metadataUri: "ipfs://...",
      state: TaskState.Accepted
    },
    {
      taskId: "2",
      creator: "erd3...",
      paymentToken: "EGLD",
      paymentAmount: "2000000000000000000",
      feeBpsSnapshot: 300,
      createdAt: Date.now() - 172800000,
      metadataUri: "ipfs://...",
      state: TaskState.Open
    }
  ];

  useEffect(() => {
    if (isConnected) {
      setTasks(mockTasks);
      setLoading(false);
    }
  }, [isConnected]);

  const formatAmount = (amount: string): string => {
    const num = parseFloat(amount) / 1e18;
    return num.toFixed(4) + ' EGLD';
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getStatusColor = (state: TaskState): string => {
    switch (state) {
      case TaskState.Open: return 'text-blue-600 bg-blue-50';
      case TaskState.Accepted: return 'text-yellow-600 bg-yellow-50';
      case TaskState.Submitted: return 'text-purple-600 bg-purple-50';
      case TaskState.Approved: return 'text-green-600 bg-green-50';
      case TaskState.Cancelled: return 'text-gray-600 bg-gray-50';
      case TaskState.Disputed: return 'text-red-600 bg-red-50';
      case TaskState.Resolved: return 'text-indigo-600 bg-indigo-50';
      case TaskState.Refunded: return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (state: TaskState) => {
    switch (state) {
      case TaskState.Open: return <Clock className="h-4 w-4" />;
      case TaskState.Accepted: return <User className="h-4 w-4" />;
      case TaskState.Submitted: return <AlertTriangle className="h-4 w-4" />;
      case TaskState.Approved: return <CheckCircle className="h-4 w-4" />;
      case TaskState.Cancelled: return <Trash2 className="h-4 w-4" />;
      case TaskState.Disputed: return <AlertTriangle className="h-4 w-4" />;
      case TaskState.Resolved: return <CheckCircle className="h-4 w-4" />;
      case TaskState.Refunded: return <DollarSign className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to view tasks.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Tasks - AI Task Escrow Router</title>
        <meta name="description" content="Manage and monitor AI tasks" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="container-wide py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
              <p className="text-gray-600 mt-2">Manage and monitor AI tasks</p>
            </div>
            
            <button className="btn btn-primary flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </button>
          </div>

          {/* Search and Filters */}
          <div className="card mb-6">
            <div className="card-body">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      className="input pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <select 
                    className="input"
                    value={filters.state?.[0] || ''}
                    onChange={(e) => setFilters({ 
                      ...filters, 
                      state: e.target.value ? [e.target.value as TaskState] : undefined 
                    })}
                  >
                    <option value="">All States</option>
                    <option value={TaskState.Open}>Open</option>
                    <option value={TaskState.Accepted}>Accepted</option>
                    <option value={TaskState.Submitted}>Submitted</option>
                    <option value={TaskState.Approved}>Approved</option>
                    <option value={TaskState.Cancelled}>Cancelled</option>
                    <option value={TaskState.Disputed}>Disputed</option>
                    <option value={TaskState.Resolved}>Resolved</option>
                    <option value={TaskState.Refunded}>Refunded</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks Table */}
          <div className="card">
            <div className="card-body">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Task ID</th>
                        <th className="text-left py-3 px-4">Creator</th>
                        <th className="text-left py-3 px-4">Agent</th>
                        <th className="text-left py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">State</th>
                        <th className="text-left py-3 px-4">Created</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task) => (
                        <tr key={task.taskId} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <span className="font-medium">#{task.taskId}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">
                              {task.creator.slice(0, 10)}...
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {task.assignedAgent ? (
                              <span className="text-sm text-gray-600">
                                {task.assignedAgent.slice(0, 10)}...
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">Unassigned</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium">{formatAmount(task.paymentAmount)}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.state)}`}>
                              {getStatusIcon(task.state)}
                              <span className="ml-1">{task.state}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">
                              {formatDate(task.createdAt)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button className="text-blue-600 hover:text-blue-800">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="text-gray-600 hover:text-gray-800">
                                <Edit className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {tasks.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-600">No tasks found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
