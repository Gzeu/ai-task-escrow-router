import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useGetAccountInfo, useGetIsLoggedIn } from '@multiversx/sdk-dapp/hooks';
import { useRouter } from 'next/router';
import { 
  User, 
  Shield, 
  TrendingUp, 
  Award, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Settings,
  Edit,
  Star,
  Zap,
  Target,
  BarChart3,
  Calendar,
  DollarSign,
  Activity,
  Copy,
  ExternalLink
} from 'lucide-react';
import { RouterEscrowClient } from '@ai-task-escrow/sdk';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';

interface UserProfile {
  address: string;
  username?: string;
  email?: string;
  reputation: number;
  totalTasks: number;
  completedTasks: number;
  successRate: number;
  totalEarned: string;
  joinDate: number;
  isVerified: boolean;
  specialization: string[];
  averageRating: number;
  responseTime: number;
}

interface TaskHistory {
  id: string;
  title: string;
  role: 'creator' | 'agent';
  status: string;
  amount: string;
  createdAt: number;
  completedAt?: number;
  rating?: number;
}

export default function ProfilePage() {
  const { address } = useGetAccountInfo();
  const isLoggedIn = useGetIsLoggedIn();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [taskHistory, setTaskHistory] = useState<TaskHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [client, setClient] = useState<RouterEscrowClient | null>(null);

  useEffect(() => {
    if (isLoggedIn && address) {
      loadProfileData();
    }
  }, [isLoggedIn, address]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Mock profile data
      const mockProfile: UserProfile = {
        address: address || '',
        username: 'ai_agent_001',
        email: 'agent@example.com',
        reputation: 850,
        totalTasks: 42,
        completedTasks: 38,
        successRate: 95.2,
        totalEarned: '85000000000000000000', // 85 EGLD
        joinDate: Date.now() - (90 * 24 * 60 * 60 * 1000), // 90 days ago
        isVerified: true,
        specialization: ['Content Generation', 'Data Analysis', 'Image Processing'],
        averageRating: 4.8,
        responseTime: 1800 // 30 minutes
      };

      const mockTaskHistory: TaskHistory[] = [
        {
          id: '1247',
          title: 'AI Content Generation',
          role: 'agent',
          status: 'completed',
          amount: '500000000000000000',
          createdAt: Date.now() - 86400000,
          completedAt: Date.now() - 43200000,
          rating: 5
        },
        {
          id: '1246',
          title: 'Data Analysis Task',
          role: 'creator',
          status: 'completed',
          amount: '1000000000000000000',
          createdAt: Date.now() - 172800000,
          completedAt: Date.now() - 129600000,
          rating: 4
        },
        {
          id: '1245',
          title: 'Image Processing',
          role: 'agent',
          status: 'in_progress',
          amount: '2000000000000000000',
          createdAt: Date.now() - 259200000
        }
      ];

      setProfile(mockProfile);
      setTaskHistory(mockTaskHistory);
    } catch (error) {
      console.error('Failed to load profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    if (profile?.address) {
      navigator.clipboard.writeText(profile.address);
      // Could add toast notification here
    }
  };

  const formatAmount = (amount: string): string => {
    const num = parseFloat(amount) / 1e18;
    return num.toFixed(4) + ' EGLD';
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'disputed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : i < rating 
            ? 'text-yellow-200 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (!isLoggedIn) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Wallet</h2>
            <p className="text-gray-600 mb-6">Please connect your wallet to view your profile.</p>
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
          <p className="text-gray-600">Unable to load profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Profile - AI Task Escrow Router</title>
        <meta name="description" content="Your profile and activity history" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="container-wide py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
              <p className="text-gray-600 mt-2">Manage your profile and track your performance</p>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="btn btn-secondary flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-1">
              <div className="card">
                <div className="card-body">
                  <div className="text-center">
                    <div className="mx-auto h-24 w-24 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                      <User className="h-12 w-12 text-primary-600" />
                    </div>
                    
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <h2 className="text-xl font-bold text-gray-900">{profile.username}</h2>
                      {profile.isVerified && (
                        <Shield className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <span className="text-sm text-gray-600 font-mono">
                        {profile.address.slice(0, 10)}...{profile.address.slice(-8)}
                      </span>
                      <button
                        onClick={copyAddress}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-center mb-4">
                      {renderStars(profile.averageRating)}
                      <span className="ml-2 text-sm text-gray-600">
                        ({profile.averageRating.toFixed(1)})
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 mb-4">
                      <p>Member since {formatDate(profile.joinDate)}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Reputation</span>
                        <span className="font-semibold text-gray-900">{profile.reputation}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Success Rate</span>
                        <span className="font-semibold text-gray-900">{profile.successRate}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Earned</span>
                        <span className="font-semibold text-gray-900">{formatAmount(profile.totalEarned)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specializations */}
              <div className="card mt-6">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Specializations</h3>
                </div>
                <div className="card-body">
                  <div className="flex flex-wrap gap-2">
                    {profile.specialization.map((spec, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats and History */}
            <div className="lg:col-span-2 space-y-6">
              {/* Performance Stats */}
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Performance Overview
                  </h2>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{profile.totalTasks}</div>
                      <div className="text-sm text-gray-600">Total Tasks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{profile.completedTasks}</div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">{profile.successRate}%</div>
                      <div className="text-sm text-gray-600">Success Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {Math.round(profile.responseTime / 60)}m
                      </div>
                      <div className="text-sm text-gray-600">Avg Response</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Task History */}
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Task History
                  </h2>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    {taskHistory.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                task.role === 'agent' ? 'bg-blue-100' : 'bg-green-100'
                              }`}>
                                {task.role === 'agent' ? (
                                  <User className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <Target className="h-4 w-4 text-green-600" />
                                )}
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{task.title}</p>
                              <p className="text-sm text-gray-500">
                                #{task.id} • {task.role === 'agent' ? 'Agent' : 'Creator'} • {formatDate(task.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="font-medium text-gray-900">{formatAmount(task.amount)}</div>
                            {task.rating && (
                              <div className="flex items-center">
                                {renderStars(task.rating)}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                              {task.status.replace('_', ' ')}
                            </span>
                            {task.completedAt && (
                              <span className="text-xs text-gray-500">
                                Completed {formatDate(task.completedAt)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
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
