import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useRouterEscrow } from '@/contexts/RouterEscrowContext';
import { 
  ArrowLeft, 
  User, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle,
  Edit,
  Eye,
  MessageSquare,
  FileText,
  Calendar,
  Shield,
  Zap,
  Play,
  Pause,
  Flag
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

export default function TaskDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { client, isConnected, address } = useRouterEscrow();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (id && client) {
      loadTask();
    }
  }, [id, client]);

  const loadTask = async () => {
    try {
      setLoading(true);
      // In a real implementation, you would fetch from the contract or indexer
      const mockTask: Task = {
        taskId: id as string,
        creator: "erd1qyu5fth97z79s6s7a8h4x0yvq2q9x0p8r7x6q3y5x2z9w8v7j6x5",
        assignedAgent: "erd1spyavw0956vq68xj8y8tenjlq4n7z3y2g7l8n6q0q2q9x0p8r7x6",
        paymentToken: "EGLD",
        paymentAmount: "2000000000000000000", // 2 EGLD
        feeBpsSnapshot: 300,
        createdAt: Date.now() - 172800000, // 2 days ago
        acceptedAt: Date.now() - 86000000, // 1 day ago
        deadline: Date.now() + 3600000, // 1 hour from now
        reviewTimeout: 3600,
        metadataUri: "ipfs://QmTaskMetadata",
        resultUri: "ipfs://QmTaskResult",
        state: TaskState.Submitted,
        agentReputationSnapshot: 850
      };
      setTask(mockTask);
    } catch (error) {
      console.error('Failed to load task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    if (!client || !task) return;

    setActionLoading(action);
    try {
      let result;
      switch (action) {
        case 'accept':
          result = await client.acceptTask(task.taskId);
          break;
        case 'submit':
          const resultUri = prompt('Enter result URI:');
          if (resultUri) {
            result = await client.submitTask(task.taskId, resultUri);
          }
          break;
        case 'approve':
          result = await client.approveTask(task.taskId);
          break;
        case 'dispute':
          const disputeUri = prompt('Enter dispute metadata URI:');
          if (disputeUri) {
            result = await client.disputeTask(task.taskId, disputeUri);
          }
          break;
        default:
          return;
      }

      if (result?.status === 'success') {
        alert(`Task ${action} successful!`);
        await loadTask(); // Reload task data
      } else {
        alert(`Failed to ${action} task: ${result?.error}`);
      }
    } catch (error) {
      console.error(`Error ${action} task:`, error);
      alert(`Error ${action} task. Please try again.`);
    } finally {
      setActionLoading(null);
    }
  };

  const formatAmount = (amount: string): string => {
    const num = parseFloat(amount) / 1e18;
    return num.toFixed(4) + ' EGLD';
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
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
      case TaskState.Submitted: return <FileText className="h-4 w-4" />;
      case TaskState.Approved: return <CheckCircle className="h-4 w-4" />;
      case TaskState.Cancelled: return <Pause className="h-4 w-4" />;
      case TaskState.Disputed: return <Flag className="h-4 w-4" />;
      case TaskState.Resolved: return <CheckCircle className="h-4 w-4" />;
      case TaskState.Refunded: return <DollarSign className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const canAccept = task?.state === TaskState.Open && address !== task?.creator;
  const canSubmit = task?.state === TaskState.Accepted && address === task?.assignedAgent;
  const canApprove = task?.state === TaskState.Submitted && address === task?.creator;
  const canDispute = (task?.state === TaskState.Submitted && address === task?.creator) ||
                   (task?.state === TaskState.Approved && address === task?.assignedAgent);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to view task details.</p>
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

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Task Not Found</h2>
          <p className="text-gray-600">The task you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Task #{task.taskId} - AI Task Escrow Router</title>
        <meta name="description" content="Task details and management" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="container-wide py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Task #{task.taskId}</h1>
                <div className="flex items-center mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.state)}`}>
                    {getStatusIcon(task.state)}
                    <span className="ml-1">{task.state}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {canAccept && (
                <button
                  onClick={() => handleAction('accept')}
                  disabled={actionLoading === 'accept'}
                  className="btn btn-primary flex items-center"
                >
                  {actionLoading === 'accept' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Accept Task
                </button>
              )}

              {canSubmit && (
                <button
                  onClick={() => handleAction('submit')}
                  disabled={actionLoading === 'submit'}
                  className="btn btn-primary flex items-center"
                >
                  {actionLoading === 'submit' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <FileText className="h-4 w-4 mr-2" />
                  )}
                  Submit Result
                </button>
              )}

              {canApprove && (
                <button
                  onClick={() => handleAction('approve')}
                  disabled={actionLoading === 'approve'}
                  className="btn btn-success flex items-center"
                >
                  {actionLoading === 'approve' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Approve
                </button>
              )}

              {canDispute && (
                <button
                  onClick={() => handleAction('dispute')}
                  disabled={actionLoading === 'dispute'}
                  className="btn btn-danger flex items-center"
                >
                  {actionLoading === 'dispute' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Flag className="h-4 w-4 mr-2" />
                  )}
                  Open Dispute
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Task Details */}
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Task Details
                  </h2>
                </div>
                <div className="card-body">
                  <div className="prose max-w-none">
                    <p className="text-gray-700">
                      This is a sample task description. In a real implementation, this would be 
                      fetched from the metadata URI stored on IPFS.
                    </p>
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Requirements:</h4>
                      <ul className="list-disc list-inside text-gray-700">
                        <li>Complete the task within the specified deadline</li>
                        <li>Follow all provided guidelines and specifications</li>
                        <li>Submit high-quality work that meets the requirements</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Result */}
              {task.resultUri && (
                <div className="card">
                  <div className="card-header">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <Eye className="h-5 w-5 mr-2" />
                      Submitted Result
                    </h2>
                  </div>
                  <div className="card-body">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Result URI:</p>
                      <p className="font-mono text-sm break-all">{task.resultUri}</p>
                      <button className="mt-3 btn btn-secondary btn-sm">
                        View Result
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Dispute */}
              {task.disputeMetadataUri && (
                <div className="card">
                  <div className="card-header">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <Flag className="h-5 w-5 mr-2" />
                      Dispute Information
                    </h2>
                  </div>
                  <div className="card-body">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-red-600 mb-2">Dispute Metadata URI:</p>
                      <p className="font-mono text-sm break-all">{task.disputeMetadataUri}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Task Information */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Information</h3>
                </div>
                <div className="card-body space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Creator</p>
                    <p className="font-mono text-sm">
                      {task.creator.slice(0, 10)}...{task.creator.slice(-8)}
                    </p>
                  </div>

                  {task.assignedAgent && (
                    <div>
                      <p className="text-sm text-gray-600">Assigned Agent</p>
                      <p className="font-mono text-sm">
                        {task.assignedAgent.slice(0, 10)}...{task.assignedAgent.slice(-8)}
                      </p>
                      {task.agentReputationSnapshot && (
                        <p className="text-xs text-gray-500 mt-1">
                          Reputation: {task.agentReputationSnapshot}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-600">Payment Amount</p>
                    <p className="font-semibold">{formatAmount(task.paymentAmount)}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Protocol Fee</p>
                    <p className="font-semibold">{task.feeBpsSnapshot / 100}%</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="text-sm">{formatDate(task.createdAt)}</p>
                  </div>

                  {task.acceptedAt && (
                    <div>
                      <p className="text-sm text-gray-600">Accepted</p>
                      <p className="text-sm">{formatDate(task.acceptedAt)}</p>
                    </div>
                  )}

                  {task.deadline && (
                    <div>
                      <p className="text-sm text-gray-600">Deadline</p>
                      <p className="text-sm">{formatDate(task.deadline)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Timeline</h3>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">Task Created</p>
                        <p className="text-xs text-gray-500">{formatDate(task.createdAt)}</p>
                      </div>
                    </div>

                    {task.acceptedAt && (
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="ml-3">
                          <p className="text-sm font-medium">Task Accepted</p>
                          <p className="text-xs text-gray-500">{formatDate(task.acceptedAt)}</p>
                        </div>
                      </div>
                    )}

                    {task.state === TaskState.Submitted && (
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <div className="ml-3">
                          <p className="text-sm font-medium">Result Submitted</p>
                          <p className="text-xs text-gray-500">Awaiting approval</p>
                        </div>
                      </div>
                    )}

                    {task.state === TaskState.Approved && (
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div className="ml-3">
                          <p className="text-sm font-medium">Task Approved</p>
                          <p className="text-xs text-gray-500">Payment released</p>
                        </div>
                      </div>
                    )}
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
