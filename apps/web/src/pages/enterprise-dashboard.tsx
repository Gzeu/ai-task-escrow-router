import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouterEscrow } from '@/contexts/RouterEscrowContext';
import { 
  Building2, 
  Users, 
  Shield, 
  TrendingUp,
  Key,
  FileText,
  Activity,
  Settings,
  BarChart3,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Globe,
  Lock,
  Unlock,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';

// Enterprise types
interface Organization {
  orgId: string;
  orgName: string;
  owner: string;
  admins: string[];
  members: OrganizationMember[];
  createdAt: number;
  tier: OrganizationTier;
  complianceLevel: ComplianceLevel;
  isActive: boolean;
  metadataUri: string;
}

interface OrganizationMember {
  address: string;
  role: OrganizationRole;
  permissions: Permission[];
  joinedAt: number;
  lastActive: number;
  isActive: boolean;
}

enum OrganizationTier {
  Basic = "Basic",
  Business = "Business", 
  Enterprise = "Enterprise",
  Custom = "Custom"
}

enum ComplianceLevel {
  None = "None",
  Standard = "Standard",
  Enhanced = "Enhanced",
  Institutional = "Institutional"
}

enum OrganizationRole {
  Owner = "Owner",
  Admin = "Admin",
  Manager = "Manager",
  Agent = "Agent",
  Viewer = "Viewer"
}

enum Permission {
  CreateTask = "CreateTask",
  ApproveTask = "ApproveTask",
  ManageMembers = "ManageMembers",
  ManageSettings = "ManageSettings",
  ViewAnalytics = "ViewAnalytics",
  ExportData = "ExportData",
  ManageApiKeys = "ManageApiKeys",
  AuditLogs = "AuditLogs"
}

interface ApiKey {
  keyHash: string;
  orgId: string;
  name: string;
  permissions: Permission[];
  rateLimit: number;
  usageCount: number;
  createdAt: number;
  expiresAt: number;
  isActive: boolean;
  lastUsed: number;
}

interface AnalyticsMetrics {
  orgId: string;
  period: string;
  totalTasks: number;
  completedTasks: number;
  totalVolume: string;
  averageTaskValue: string;
  successRate: number;
  agentPerformance: AgentPerformance[];
  costBreakdown: CostBreakdown;
  riskMetrics: RiskMetrics;
  generatedAt: number;
}

interface AgentPerformance {
  agentAddress: string;
  tasksCompleted: number;
  totalEarned: string;
  averageRating: number;
  completionTimeAvg: number;
  successRate: number;
  specialization: string;
}

interface CostBreakdown {
  protocolFees: string;
  agentPayments: string;
  gasCosts: string;
  disputeCosts: string;
  otherCosts: string;
}

interface RiskMetrics {
  disputeRate: number;
  fraudScore: number;
  complianceScore: number;
  riskLevel: string;
  flaggedTransactions: number;
  mitigationsApplied: number;
}

interface WebhookConfig {
  webhookId: number;
  orgId: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  retryCount: number;
  lastTriggered: number;
  successRate: number;
}

export default function EnterpriseDashboard() {
  const { client, isConnected } = useRouterEscrow();
  const [activeTab, setActiveTab] = useState<'overview' | 'organizations' | 'members' | 'api-keys' | 'analytics' | 'compliance' | 'webhooks'>('overview');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const mockOrganizations: Organization[] = [
    {
      orgId: "org_1",
      orgName: "Acme Corporation",
      owner: "erd1...",
      admins: ["erd1...", "erd2..."],
      members: [
        {
          address: "erd1...",
          role: OrganizationRole.Owner,
          permissions: [Permission.CreateTask, Permission.ManageMembers],
          joinedAt: Date.now() - 86400000 * 30,
          lastActive: Date.now() - 3600000,
          isActive: true
        },
        {
          address: "erd2...",
          role: OrganizationRole.Admin,
          permissions: [Permission.ViewAnalytics, Permission.ManageSettings],
          joinedAt: Date.now() - 86400000 * 20,
          lastActive: Date.now() - 7200000,
          isActive: true
        }
      ],
      createdAt: Date.now() - 86400000 * 60,
      tier: OrganizationTier.Enterprise,
      complianceLevel: ComplianceLevel.Enhanced,
      isActive: true,
      metadataUri: "ipfs://..."
    },
    {
      orgId: "org_2",
      orgName: "Tech Startup LLC",
      owner: "erd3...",
      admins: ["erd3..."],
      members: [
        {
          address: "erd3...",
          role: OrganizationRole.Owner,
          permissions: [Permission.CreateTask],
          joinedAt: Date.now() - 86400000 * 15,
          lastActive: Date.now() - 1800000,
          isActive: true
        }
      ],
      createdAt: Date.now() - 86400000 * 20,
      tier: OrganizationTier.Business,
      complianceLevel: ComplianceLevel.Standard,
      isActive: true,
      metadataUri: "ipfs://..."
    }
  ];

  const mockApiKeys: ApiKey[] = [
    {
      keyHash: "0x1234...",
      orgId: "org_1",
      name: "Production API Key",
      permissions: [Permission.CreateTask, Permission.ViewAnalytics],
      rateLimit: 10000,
      usageCount: 15420,
      createdAt: Date.now() - 86400000 * 30,
      expiresAt: Date.now() + 86400000 * 335,
      isActive: true,
      lastUsed: Date.now() - 60000
    },
    {
      keyHash: "0x5678...",
      orgId: "org_1",
      name: "Development API Key",
      permissions: [Permission.ViewAnalytics],
      rateLimit: 1000,
      usageCount: 890,
      createdAt: Date.now() - 86400000 * 10,
      expiresAt: Date.now() + 86400000 * 355,
      isActive: true,
      lastUsed: Date.now() - 300000
    }
  ];

  const mockAnalytics: AnalyticsMetrics = {
    orgId: "org_1",
    period: "Monthly",
    totalTasks: 1250,
    completedTasks: 1187,
    totalVolume: "1250000000000000000000", // 1250 EGLD
    averageTaskValue: "1000000000000000000", // 1 EGLD
    successRate: 9500, // 95%
    agentPerformance: [
      {
        agentAddress: "erd1...",
        tasksCompleted: 156,
        totalEarned: "156000000000000000000", // 156 EGLD
        averageRating: 485, // 4.85/5
        completionTimeAvg: 7200, // 2 hours
        successRate: 9800, // 98%
        specialization: "Data Analysis"
      }
    ],
    costBreakdown: {
      protocolFees: "37500000000000000000", // 37.5 EGLD (3%)
      agentPayments: "1187000000000000000000", // 1187 EGLD
      gasCosts: "12500000000000000000", // 12.5 EGLD
      disputeCosts: "5000000000000000000", // 5 EGLD
      otherCosts: "2500000000000000000" // 2.5 EGLD
    },
    riskMetrics: {
      disputeRate: 300, // 3%
      fraudScore: 150, // 150/1000
      complianceScore: 9200, // 92%
      riskLevel: "Low",
      flaggedTransactions: 3,
      mitigationsApplied: 12
    },
    generatedAt: Date.now()
  };

  const mockWebhooks: WebhookConfig[] = [
    {
      webhookId: 1,
      orgId: "org_1",
      url: "https://api.acme.com/webhooks/tasks",
      events: ["TaskCreated", "TaskCompleted", "TaskDisputed"],
      secret: "webhook_secret_123",
      isActive: true,
      retryCount: 0,
      lastTriggered: Date.now() - 300000,
      successRate: 9850 // 98.5%
    },
    {
      webhookId: 2,
      orgId: "org_1",
      url: "https://api.acme.com/webhooks/compliance",
      events: ["ComplianceAlert", "RiskThreshold"],
      secret: "compliance_secret_456",
      isActive: true,
      retryCount: 2,
      lastTriggered: Date.now() - 86400000,
      successRate: 9600 // 96%
    }
  ];

  useEffect(() => {
    if (isConnected) {
      setLoading(false);
    }
  }, [isConnected]);

  const formatAmount = (amount: string): string => {
    const num = parseFloat(amount) / 1e18;
    return `${num.toFixed(4)} EGLD`;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getTierColor = (tier: OrganizationTier): string => {
    switch (tier) {
      case OrganizationTier.Basic: return 'text-gray-600 bg-gray-50';
      case OrganizationTier.Business: return 'text-blue-600 bg-blue-50';
      case OrganizationTier.Enterprise: return 'text-purple-600 bg-purple-50';
      case OrganizationTier.Custom: return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getComplianceColor = (level: ComplianceLevel): string => {
    switch (level) {
      case ComplianceLevel.None: return 'text-red-600 bg-red-50';
      case ComplianceLevel.Standard: return 'text-yellow-600 bg-yellow-50';
      case ComplianceLevel.Enhanced: return 'text-green-600 bg-green-50';
      case ComplianceLevel.Institutional: return 'text-teal-600 bg-teal-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRiskColor = (level: string): string => {
    switch (level) {
      case 'Low': return 'text-green-600 bg-green-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'High': return 'text-orange-600 bg-orange-50';
      case 'Critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to view the enterprise dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Enterprise Dashboard - AI Task Escrow Router</title>
        <meta name="description" content="Enterprise-grade management and analytics dashboard" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="container-wide py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Enterprise Dashboard</h1>
              <p className="text-gray-600 mt-2">Advanced management and analytics for organizations</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search organizations, members, API keys..."
                  className="input pl-10 w-80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <button className="btn btn-primary flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                New Organization
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'organizations', label: 'Organizations', icon: Building2 },
                { id: 'members', label: 'Members', icon: Users },
                { id: 'api-keys', label: 'API Keys', icon: Key },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                { id: 'compliance', label: 'Compliance', icon: Shield },
                { id: 'webhooks', label: 'Webhooks', icon: Globe },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="card">
                      <div className="card-body">
                        <div className="flex items-center">
                          <div className="p-3 bg-blue-100 rounded-full">
                            <Building2 className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-2xl font-bold text-gray-900">{mockOrganizations.length}</p>
                            <p className="text-sm text-gray-600">Organizations</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-body">
                        <div className="flex items-center">
                          <div className="p-3 bg-green-100 rounded-full">
                            <Users className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-2xl font-bold text-gray-900">
                              {mockOrganizations.reduce((sum, org) => sum + org.members.length, 0)}
                            </p>
                            <p className="text-sm text-gray-600">Total Members</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-body">
                        <div className="flex items-center">
                          <div className="p-3 bg-purple-100 rounded-full">
                            <Key className="h-6 w-6 text-purple-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-2xl font-bold text-gray-900">{mockApiKeys.length}</p>
                            <p className="text-sm text-gray-600">API Keys</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-body">
                        <div className="flex items-center">
                          <div className="p-3 bg-orange-100 rounded-full">
                            <Activity className="h-6 w-6 text-orange-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-2xl font-bold text-gray-900">{mockAnalytics.totalTasks}</p>
                            <p className="text-sm text-gray-600">Total Tasks</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="card">
                    <div className="card-body">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-full">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="ml-4">
                              <p className="font-medium text-gray-900">New organization created</p>
                              <p className="text-sm text-gray-600">Tech Startup LLC</p>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">2 hours ago</div>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-full">
                              <Key className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <p className="font-medium text-gray-900">API key created</p>
                              <p className="text-sm text-gray-600">Production API Key</p>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">5 hours ago</div>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-full">
                              <Users className="h-4 w-4 text-purple-600" />
                            </div>
                            <div className="ml-4">
                              <p className="font-medium text-gray-900">Member added</p>
                              <p className="text-sm text-gray-600">New admin joined Acme Corporation</p>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">1 day ago</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Organizations Tab */}
              {activeTab === 'organizations' && (
                <div className="card">
                  <div className="card-body">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Organizations</h3>
                      <button className="btn btn-primary flex items-center">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Organization
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4">Organization</th>
                            <th className="text-left py-3 px-4">Owner</th>
                            <th className="text-left py-3 px-4">Tier</th>
                            <th className="text-left py-3 px-4">Compliance</th>
                            <th className="text-left py-3 px-4">Members</th>
                            <th className="text-left py-3 px-4">Created</th>
                            <th className="text-left py-3 px-4">Status</th>
                            <th className="text-left py-3 px-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockOrganizations.map((org) => (
                            <tr key={org.orgId} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div>
                                  <p className="font-medium text-gray-900">{org.orgName}</p>
                                  <p className="text-sm text-gray-600">{org.orgId}</p>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-gray-600">
                                  {org.owner.slice(0, 10)}...
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTierColor(org.tier)}`}>
                                  {org.tier}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getComplianceColor(org.complianceLevel)}`}>
                                  {org.complianceLevel}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-gray-900">{org.members.length}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-gray-600">{formatDate(org.createdAt)}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  org.isActive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                                }`}>
                                  {org.isActive ? 'Active' : 'Inactive'}
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
                    </div>
                  </div>
                </div>
              )}

              {/* API Keys Tab */}
              {activeTab === 'api-keys' && (
                <div className="card">
                  <div className="card-body">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">API Keys</h3>
                      <button className="btn btn-primary flex items-center">
                        <Plus className="h-4 w-4 mr-2" />
                        Create API Key
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4">Name</th>
                            <th className="text-left py-3 px-4">Key Hash</th>
                            <th className="text-left py-3 px-4">Permissions</th>
                            <th className="text-left py-3 px-4">Rate Limit</th>
                            <th className="text-left py-3 px-4">Usage</th>
                            <th className="text-left py-3 px-4">Created</th>
                            <th className="text-left py-3 px-4">Status</th>
                            <th className="text-left py-3 px-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockApiKeys.map((apiKey) => (
                            <tr key={apiKey.keyHash} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <p className="font-medium text-gray-900">{apiKey.name}</p>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-gray-600 font-mono">
                                  {apiKey.keyHash.slice(0, 10)}...
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {apiKey.permissions.slice(0, 2).map((permission, idx) => (
                                    <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                                      {permission}
                                    </span>
                                  ))}
                                  {apiKey.permissions.length > 2 && (
                                    <span className="text-xs text-gray-500">+{apiKey.permissions.length - 2}</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-gray-900">{apiKey.rateLimit.toLocaleString()}</span>
                              </td>
                              <td className="py-3 px-4">
                                <div>
                                  <p className="text-sm text-gray-900">{apiKey.usageCount.toLocaleString()} uses</p>
                                  <p className="text-xs text-gray-500">Last: {formatDate(apiKey.lastUsed)}</p>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-gray-600">{formatDate(apiKey.createdAt)}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  apiKey.isActive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                                }`}>
                                  {apiKey.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex gap-2">
                                  <button className="text-blue-600 hover:text-blue-800">
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button className="text-red-600 hover:text-red-800">
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  {/* Analytics Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="card">
                      <div className="card-body">
                        <div className="flex items-center">
                          <div className="p-3 bg-blue-100 rounded-full">
                            <Activity className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-2xl font-bold text-gray-900">{mockAnalytics.totalTasks}</p>
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
                            <p className="text-2xl font-bold text-gray-900">{mockAnalytics.completedTasks}</p>
                            <p className="text-sm text-gray-600">Completed</p>
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
                            <p className="text-2xl font-bold text-gray-900">{formatAmount(mockAnalytics.totalVolume)}</p>
                            <p className="text-sm text-gray-600">Total Volume</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-body">
                        <div className="flex items-center">
                          <div className="p-3 bg-orange-100 rounded-full">
                            <TrendingUp className="h-6 w-6 text-orange-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-2xl font-bold text-gray-900">{(mockAnalytics.successRate / 100).toFixed(1)}%</p>
                            <p className="text-sm text-gray-600">Success Rate</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="card">
                    <div className="card-body">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Protocol Fees</span>
                          <span className="font-medium">{formatAmount(mockAnalytics.costBreakdown.protocolFees)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Agent Payments</span>
                          <span className="font-medium">{formatAmount(mockAnalytics.costBreakdown.agentPayments)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Gas Costs</span>
                          <span className="font-medium">{formatAmount(mockAnalytics.costBreakdown.gasCosts)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Dispute Costs</span>
                          <span className="font-medium">{formatAmount(mockAnalytics.costBreakdown.disputeCosts)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Other Costs</span>
                          <span className="font-medium">{formatAmount(mockAnalytics.costBreakdown.otherCosts)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Risk Metrics */}
                  <div className="card">
                    <div className="card-body">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Dispute Rate</span>
                              <span className="font-medium">{(mockAnalytics.riskMetrics.disputeRate / 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Fraud Score</span>
                              <span className="font-medium">{mockAnalytics.riskMetrics.fraudScore}/1000</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Compliance Score</span>
                              <span className="font-medium">{(mockAnalytics.riskMetrics.complianceScore / 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Risk Level</span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(mockAnalytics.riskMetrics.riskLevel)}`}>
                                {mockAnalytics.riskMetrics.riskLevel}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Flagged Transactions</span>
                              <span className="font-medium">{mockAnalytics.riskMetrics.flaggedTransactions}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Mitigations Applied</span>
                              <span className="font-medium">{mockAnalytics.riskMetrics.mitigationsApplied}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Compliance Tab */}
              {activeTab === 'compliance' && (
                <div className="card">
                  <div className="card-body">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Compliance Reports</h3>
                      <div className="flex gap-2">
                        <button className="btn btn-secondary flex items-center">
                          <Download className="h-4 w-4 mr-2" />
                          Export Report
                        </button>
                        <button className="btn btn-primary flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          Generate Report
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <div className="text-center p-6 border rounded-lg">
                        <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">92%</p>
                        <p className="text-sm text-gray-600">Compliance Score</p>
                      </div>
                      <div className="text-center p-6 border rounded-lg">
                        <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">156</p>
                        <p className="text-sm text-gray-600">Audit Logs</p>
                      </div>
                      <div className="text-center p-6 border rounded-lg">
                        <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">3</p>
                        <p className="text-sm text-gray-600">Flagged Items</p>
                      </div>
                      <div className="text-center p-6 border rounded-lg">
                        <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">12</p>
                        <p className="text-sm text-gray-600">Mitigations</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          <div className="p-2 bg-green-100 rounded-full">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="ml-4">
                            <p className="font-medium text-gray-900">User Activity Report</p>
                            <p className="text-sm text-gray-600">Generated 2 days ago</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-800">
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <p className="font-medium text-gray-900">Transaction History</p>
                            <p className="text-sm text-gray-600">Generated 1 week ago</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-800">
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          <div className="p-2 bg-orange-100 rounded-full">
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                          </div>
                          <div className="ml-4">
                            <p className="font-medium text-gray-900">Risk Assessment Report</p>
                            <p className="text-sm text-gray-600">Generated 2 weeks ago</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-800">
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Webhooks Tab */}
              {activeTab === 'webhooks' && (
                <div className="card">
                  <div className="card-body">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Webhook Configurations</h3>
                      <button className="btn btn-primary flex items-center">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Webhook
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4">URL</th>
                            <th className="text-left py-3 px-4">Events</th>
                            <th className="text-left py-3 px-4">Status</th>
                            <th className="text-left py-3 px-4">Success Rate</th>
                            <th className="text-left py-3 px-4">Last Triggered</th>
                            <th className="text-left py-3 px-4">Retries</th>
                            <th className="text-left py-3 px-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockWebhooks.map((webhook) => (
                            <tr key={webhook.webhookId} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <span className="text-sm text-gray-900">{webhook.url}</span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {webhook.events.slice(0, 2).map((event, idx) => (
                                    <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                                      {event}
                                    </span>
                                  ))}
                                  {webhook.events.length > 2 && (
                                    <span className="text-xs text-gray-500">+{webhook.events.length - 2}</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  webhook.isActive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                                }`}>
                                  {webhook.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-gray-900">{(webhook.successRate / 100).toFixed(1)}%</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-gray-600">{formatDate(webhook.lastTriggered)}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-gray-900">{webhook.retryCount}</span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex gap-2">
                                  <button className="text-blue-600 hover:text-blue-800">
                                    <RefreshCw className="h-4 w-4" />
                                  </button>
                                  <button className="text-gray-600 hover:text-gray-800">
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button className="text-red-600 hover:text-red-800">
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
