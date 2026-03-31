import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouterEscrow } from '@/contexts/RouterEscrowContext';
import { 
  Shield, 
  Users, 
  TrendingUp,
  DollarSign,
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
  ThumbsUp,
  ThumbsDown,
  Award,
  Target,
  Zap,
  Lock,
  Unlock,
  RefreshCw,
  Filter,
  Search,
  Calendar,
  Hash,
  Cpu,
  Database,
  Globe,
  BookOpen
} from 'lucide-react';

// Production types
interface DaoProposal {
  proposalId: number;
  title: string;
  description: string;
  proposer: string;
  proposalType: ProposalType;
  targetAddress: string;
  payload: string;
  votingStart: number;
  votingEnd: number;
  quorumRequired: number;
  yesVotes: string;
  noVotes: string;
  totalVotingPower: string;
  status: ProposalStatus;
  executionHash: string;
  createdAt: number;
}

enum ProposalType {
  ProtocolUpgrade = "ProtocolUpgrade",
  ParameterChange = "ParameterChange",
  TreasuryAllocation = "TreasuryAllocation",
  IncentiveProgram = "IncentiveProgram",
  GrantProgram = "GrantProgram",
  PartnershipAgreement = "PartnershipAgreement",
  EmergencyAction = "EmergencyAction",
}

enum ProposalStatus {
  Pending = "Pending",
  Active = "Active",
  Passed = "Passed",
  Rejected = "Rejected",
  Executed = "Executed",
  Cancelled = "Cancelled",
  Expired = "Expired",
}

interface TreasuryAllocation {
  allocationId: number;
  recipient: string;
  amount: string;
  token: string;
  purpose: string;
  vestingStart: number;
  vestingEnd: number;
  vestingCliff: number;
  totalInstallments: number;
  releasedInstallments: number;
  createdAt: number;
  isActive: boolean;
}

interface GrantProgram {
  programId: number;
  name: string;
  description: string;
  totalBudget: string;
  token: string;
  applicationStart: number;
  applicationEnd: number;
  reviewPeriod: number;
  maxGrantAmount: string;
  minGrantAmount: string;
  criteria: string;
  reviewerPanel: string[];
  status: GrantProgramStatus;
  createdAt: number;
  manager: string;
}

enum GrantProgramStatus {
  Draft = "Draft",
  Active = "Active",
  UnderReview = "UnderReview",
  Completed = "Completed",
  Cancelled = "Cancelled",
}

interface GrantApplication {
  applicationId: number;
  programId: number;
  applicant: string;
  projectTitle: string;
  projectDescription: string;
  requestedAmount: string;
  milestoneCount: number;
  deliverables: string[];
  teamInfo: string;
  submissionDate: number;
  status: ApplicationStatus;
  reviewScores: ReviewScore[];
  finalScore: number;
  allocatedAmount: string;
  milestoneProgress: number;
}

enum ApplicationStatus {
  Submitted = "Submitted",
  UnderReview = "UnderReview",
  Approved = "Approved",
  Rejected = "Rejected",
  InProgress = "InProgress",
  Completed = "Completed",
  Cancelled = "Cancelled",
}

interface ReviewScore {
  reviewer: string;
  score: number;
  comments: string;
  reviewedAt: number;
}

interface EconomicModel {
  protocolFeeRate: number;
  treasuryAllocationRate: number;
  stakingRewardRate: number;
  deflationaryBurnRate: number;
  liquidityMiningRate: number;
  maxSupply: string;
  currentSupply: string;
  circulatingSupply: string;
  stakedAmount: string;
  totalBurned: string;
  lastUpdated: number;
}

interface StressTestConfig {
  testId: number;
  testName: string;
  concurrentUsers: number;
  transactionsPerSecond: number;
  durationSeconds: number;
  taskCreationRate: number;
  disputeRate: number;
  gasLimitPerTx: number;
  maxMemoryUsage: number;
  status: TestStatus;
  startedAt: number;
  completedAt: number;
  results: TestResults;
}

interface TestResults {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  averageGasUsed: number;
  peakGasUsed: number;
  averageResponseTime: number;
  peakResponseTime: number;
  throughput: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
}

enum TestStatus {
  Pending = "Pending",
  Running = "Running",
  Completed = "Completed",
  Failed = "Failed",
  Cancelled = "Cancelled",
}

interface SecurityAudit {
  auditId: number;
  auditor: string;
  auditType: AuditType;
  contractVersion: string;
  findings: SecurityFinding[];
  overallScore: number;
  recommendations: string[];
  auditDate: number;
  status: AuditStatus;
}

interface SecurityFinding {
  findingId: number;
  severity: Severity;
  category: FindingCategory;
  title: string;
  description: string;
  affectedContract: string;
  lineNumber: number;
  remediation: string;
  status: FindingStatus;
}

enum AuditType {
  FormalVerification = "FormalVerification",
  PenetrationTest = "PenetrationTest",
  CodeReview = "CodeReview",
  EconomicModel = "EconomicModel",
  SmartContractAudit = "SmartContractAudit",
}

enum Severity {
  Critical = "Critical",
  High = "High",
  Medium = "Medium",
  Low = "Low",
  Informational = "Informational",
}

enum FindingStatus {
  Open = "Open",
  InProgress = "InProgress",
  Fixed = "Fixed",
  Verified = "Verified",
  Ignored = "Ignored",
}

enum AuditStatus {
  InProgress = "InProgress",
  Completed = "Completed",
  Failed = "Failed",
  Cancelled = "Cancelled",
}

enum FindingCategory {
  AccessControl = "AccessControl",
  Reentrancy = "Reentrancy",
  IntegerOverflow = "IntegerOverflow",
  LogicError = "LogicError",
  GasOptimization = "GasOptimization",
  BestPractice = "BestPractice",
}

export default function ProductionDashboard() {
  const { client, isConnected } = useRouterEscrow();
  const [activeTab, setActiveTab] = useState<'overview' | 'governance' | 'treasury' | 'grants' | 'economics' | 'testing' | 'security'>('overview');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const mockProposals: DaoProposal[] = [
    {
      proposalId: 1,
      title: "Protocol Upgrade v1.1.0",
      description: "Upgrade protocol to include enhanced governance features",
      proposer: "erd1...",
      proposalType: ProposalType.ProtocolUpgrade,
      targetAddress: "erd1...",
      payload: "upgrade_data_123",
      votingStart: Date.now() - 86400000 * 7,
      votingEnd: Date.now() + 86400000,
      quorumRequired: 5000, // 50%
      yesVotes: "500000000000000000000",
      noVotes: "200000000000000000000",
      totalVotingPower: "800000000000000000000",
      status: ProposalStatus.Active,
      executionHash: "",
      createdAt: Date.now() - 86400000 * 8
    },
    {
      proposalId: 2,
      title: "Treasury Allocation for Q4 2026",
      description: "Allocate treasury funds for ecosystem development",
      proposer: "erd2...",
      proposalType: ProposalType.TreasuryAllocation,
      targetAddress: "erd1...",
      payload: "allocation_data_456",
      votingStart: Date.now() - 86400000 * 3,
      votingEnd: Date.now() - 86400000,
      quorumRequired: 3000, // 30%
      yesVotes: "300000000000000000000",
      noVotes: "100000000000000000000",
      totalVotingPower: "500000000000000000000",
      status: ProposalStatus.Passed,
      executionHash: "0x1234...",
      createdAt: Date.now() - 86400000 * 4
    }
  ];

  const mockTreasuryAllocations: TreasuryAllocation[] = [
    {
      allocationId: 1,
      recipient: "erd1...",
      amount: "100000000000000000000", // 100 EGLD
      token: "EGLD",
      purpose: "Core Development Fund",
      vestingStart: Date.now() - 86400000 * 30,
      vestingEnd: Date.now() + 86400000 * 330,
      vestingCliff: Date.now() + 86400000 * 30,
      totalInstallments: 12,
      releasedInstallments: 3,
      createdAt: Date.now() - 86400000 * 60,
      isActive: true
    },
    {
      allocationId: 2,
      recipient: "erd2...",
      amount: "50000000000000000000", // 50 EGLD
      token: "EGLD",
      purpose: "Marketing Campaign",
      vestingStart: Date.now() - 86400000 * 15,
      vestingEnd: Date.now() + 86400000 * 165,
      vestingCliff: Date.now() + 86400000 * 15,
      totalInstallments: 6,
      releasedInstallments: 2,
      createdAt: Date.now() - 86400000 * 45,
      isActive: true
    }
  ];

  const mockGrantPrograms: GrantProgram[] = [
    {
      programId: 1,
      name: "AI Innovation Grant 2026",
      description: "Funding for innovative AI projects on MultiversX",
      totalBudget: "1000000000000000000000", // 1000 EGLD
      token: "EGLD",
      applicationStart: Date.now() - 86400000 * 30,
      applicationEnd: Date.now() + 86400000 * 60,
      reviewPeriod: 86400000 * 14,
      maxGrantAmount: "100000000000000000000", // 100 EGLD
      minGrantAmount: "10000000000000000000", // 10 EGLD
      criteria: "Innovation, Technical feasibility, Team experience",
      reviewerPanel: ["erd1...", "erd2...", "erd3..."],
      status: GrantProgramStatus.Active,
      createdAt: Date.now() - 86400000 * 60,
      manager: "erd1..."
    },
    {
      programId: 2,
      name: "Developer Education Grant",
      description: "Educational content and tutorials for developers",
      totalBudget: "200000000000000000000", // 200 EGLD
      token: "EGLD",
      applicationStart: Date.now() - 86400000 * 15,
      applicationEnd: Date.now() + 86400000 * 30,
      reviewPeriod: 86400000 * 7,
      maxGrantAmount: "20000000000000000000", // 20 EGLD
      minGrantAmount: "5000000000000000000", // 5 EGLD
      criteria: "Educational value, Content quality, Reach",
      reviewerPanel: ["erd1...", "erd2..."],
      status: GrantProgramStatus.Completed,
      createdAt: Date.now() - 86400000 * 45,
      manager: "erd2..."
    }
  ];

  const mockEconomicModel: EconomicModel = {
    protocolFeeRate: 300, // 3%
    treasuryAllocationRate: 500, // 50%
    stakingRewardRate: 200, // 2%
    deflationaryBurnRate: 100, // 1%
    liquidityMiningRate: 50, // 0.5%
    maxSupply: "1000000000000000000000000", // 1B EGLD
    currentSupply: "500000000000000000000000", // 500M EGLD
    circulatingSupply: "450000000000000000000000", // 450M EGLD
    stakedAmount: "150000000000000000000000", // 150M EGLD
    totalBurned: "50000000000000000000000", // 50M EGLD
    lastUpdated: Date.now()
  };

  const mockStressTests: StressTestConfig[] = [
    {
      testId: 1,
      testName: "High Volume Stress Test",
      concurrentUsers: 10000,
      transactionsPerSecond: 1000,
      durationSeconds: 3600,
      taskCreationRate: 500,
      disputeRate: 50, // 5%
      gasLimitPerTx: 5000000,
      maxMemoryUsage: 0,
      status: TestStatus.Completed,
      startedAt: Date.now() - 86400000 * 2,
      completedAt: Date.now() - 86400000 * 2 + 3600,
      results: {
        totalTransactions: 3600000,
        successfulTransactions: 3546000,
        failedTransactions: 54000,
        averageGasUsed: 2500000,
        peakGasUsed: 4800000,
        averageResponseTime: 150,
        peakResponseTime: 1200,
        throughput: 1000,
        errorRate: 150, // 1.5%
        memoryUsage: 75, // 75%
        cpuUsage: 85 // 85%
      }
    },
    {
      testId: 2,
      testName: "Dispute Resolution Stress Test",
      concurrentUsers: 5000,
      transactionsPerSecond: 500,
      durationSeconds: 1800,
      taskCreationRate: 200,
      disputeRate: 200, // 20%
      gasLimitPerTx: 7000000,
      maxMemoryUsage: 0,
      status: TestStatus.Running,
      startedAt: Date.now() - 3600000,
      completedAt: 0,
      results: {
        totalTransactions: 0,
        successfulTransactions: 0,
        failedTransactions: 0,
        averageGasUsed: 0,
        peakGasUsed: 0,
        averageResponseTime: 0,
        peakResponseTime: 0,
        throughput: 0,
        errorRate: 0,
        memoryUsage: 0,
        cpuUsage: 0
      }
    }
  ];

  const mockSecurityAudits: SecurityAudit[] = [
    {
      auditId: 1,
      auditor: "SecureAudit Labs",
      auditType: AuditType.SmartContractAudit,
      contractVersion: "v1.0.0",
      findings: [
        {
          findingId: 1,
          severity: Severity.Medium,
          category: FindingCategory.BestPractice,
          title: "Gas optimization opportunity",
          description: "Loop can be optimized to reduce gas costs",
          affectedContract: "RouterEscrow",
          lineNumber: 156,
          remediation: "Use storage mapping instead of array iteration",
          status: FindingStatus.Open
        },
        {
          findingId: 2,
          severity: Severity.Low,
          category: FindingCategory.BestPractice,
          title: "Missing input validation",
          description: "Some functions lack proper input validation",
          affectedContract: "RouterEscrow",
          lineNumber: 234,
          remediation: "Add input validation checks",
          status: FindingStatus.InProgress
        }
      ],
      overallScore: 85,
      recommendations: ["Implement gas optimizations", "Add comprehensive input validation"],
      auditDate: Date.now() - 86400000 * 7,
      status: AuditStatus.Completed
    },
    {
      auditId: 2,
      auditor: "CryptoVerify",
      auditType: AuditType.FormalVerification,
      contractVersion: "v1.0.0",
      findings: [],
      overallScore: 92,
      recommendations: ["Continue regular security reviews"],
      auditDate: Date.now() - 86400000 * 14,
      status: AuditStatus.Completed
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

  const getProposalStatusColor = (status: ProposalStatus): string => {
    switch (status) {
      case ProposalStatus.Pending: return 'text-gray-600 bg-gray-50';
      case ProposalStatus.Active: return 'text-blue-600 bg-blue-50';
      case ProposalStatus.Passed: return 'text-green-600 bg-green-50';
      case ProposalStatus.Rejected: return 'text-red-600 bg-red-50';
      case ProposalStatus.Executed: return 'text-purple-600 bg-purple-50';
      case ProposalStatus.Cancelled: return 'text-orange-600 bg-orange-50';
      case ProposalStatus.Expired: return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityColor = (severity: Severity): string => {
    switch (severity) {
      case Severity.Critical: return 'text-red-600 bg-red-50';
      case Severity.High: return 'text-orange-600 bg-orange-50';
      case Severity.Medium: return 'text-yellow-600 bg-yellow-50';
      case Severity.Low: return 'text-blue-600 bg-blue-50';
      case Severity.Informational: return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTestStatusColor = (status: TestStatus): string => {
    switch (status) {
      case TestStatus.Pending: return 'text-gray-600 bg-gray-50';
      case TestStatus.Running: return 'text-blue-600 bg-blue-50';
      case TestStatus.Completed: return 'text-green-600 bg-green-50';
      case TestStatus.Failed: return 'text-red-600 bg-red-50';
      case TestStatus.Cancelled: return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const calculateVotingResults = (yesVotes: string, noVotes: string) => {
    const yes = parseFloat(yesVotes) / 1e18;
    const no = parseFloat(noVotes) / 1e18;
    const total = yes + no;
    
    if (total === 0) return { yesPercentage: 0, noPercentage: 0 };
    
    return {
      yesPercentage: (yes / total) * 100,
      noPercentage: (no / total) * 100
    };
  };

  const getAuditScoreGrade = (score: number): { grade: string; color: string } => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-600' };
    if (score >= 80) return { grade: 'A', color: 'text-green-600' };
    if (score >= 70) return { grade: 'B', color: 'text-yellow-600' };
    if (score >= 60) return { grade: 'C', color: 'text-orange-600' };
    if (score >= 50) return { grade: 'D', color: 'text-red-600' };
    return { grade: 'F', color: 'text-red-600' };
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to view the production dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Production Dashboard - AI Task Escrow Router</title>
        <meta name="description" content="Production-ready governance and management dashboard" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="container-wide py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Production Dashboard</h1>
              <p className="text-gray-600 mt-2">Production-ready governance and management</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search proposals, grants, audits..."
                  className="input pl-10 w-80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <button className="btn btn-primary flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                New Proposal
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'governance', label: 'Governance', icon: Shield },
                { id: 'treasury', label: 'Treasury', icon: DollarSign },
                { id: 'grants', label: 'Grants', icon: Award },
                { id: 'economics', label: 'Economics', icon: TrendingUp },
                { id: 'testing', label: 'Testing', icon: Zap },
                { id: 'security', label: 'Security', icon: Lock },
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
                  {/* Production Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="card">
                      <div className="card-body">
                        <div className="flex items-center">
                          <div className="p-3 bg-blue-100 rounded-full">
                            <Shield className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-2xl font-bold text-gray-900">{mockProposals.length}</p>
                            <p className="text-sm text-gray-600">DAO Proposals</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-body">
                        <div className="flex items-center">
                          <div className="p-3 bg-green-100 rounded-full">
                            <DollarSign className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-2xl font-bold text-gray-900">{mockTreasuryAllocations.length}</p>
                            <p className="text-sm text-gray-600">Treasury Allocations</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-body">
                        <div className="flex items-center">
                          <div className="p-3 bg-purple-100 rounded-full">
                            <Award className="h-6 w-6 text-purple-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-2xl font-bold text-gray-900">{mockGrantPrograms.length}</p>
                            <p className="text-sm text-gray-600">Grant Programs</p>
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
                            <p className="text-2xl font-bold text-gray-900">{mockStressTests.length}</p>
                            <p className="text-sm text-gray-600">Stress Tests</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Economic Model Overview */}
                  <div className="card">
                    <div className="card-body">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Economic Model</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Fee Structure</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Protocol Fee</span>
                              <span className="font-medium">{(mockEconomicModel.protocolFeeRate / 100).toFixed(2)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Treasury Allocation</span>
                              <span className="font-medium">{(mockEconomicModel.treasuryAllocationRate / 100).toFixed(2)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Staking Rewards</span>
                              <span className="font-medium">{(mockEconomicModel.stakingRewardRate / 100).toFixed(2)}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Tokenomics</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Supply</span>
                              <span className="font-medium">{formatAmount(mockEconomicModel.maxSupply)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Circulating Supply</span>
                              <span className="font-medium">{formatAmount(mockEconomicModel.circulatingSupply)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Staked Amount</span>
                              <span className="font-medium">{formatAmount(mockEconomicModel.stakedAmount)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Deflation</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Burn Rate</span>
                              <span className="font-medium">{(mockEconomicModel.deflationaryBurnRate / 100).toFixed(2)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Burned</span>
                              <span className="font-medium">{formatAmount(mockEconomicModel.totalBurned)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Liquidity Mining</span>
                              <span className="font-medium">{(mockEconomicModel.liquidityMiningRate / 100).toFixed(2)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Security Audits */}
                  <div className="card">
                    <div className="card-body">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Security Audits</h3>
                      <div className="space-y-4">
                        {mockSecurityAudits.map((audit) => {
                          const { grade, color } = getAuditScoreGrade(audit.overallScore);
                          return (
                            <div key={audit.auditId} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-full">
                                  <Shield className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                  <p className="font-medium text-gray-900">{audit.auditType}</p>
                                  <p className="text-sm text-gray-600">{audit.auditor}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
                                  Grade {grade}
                                </span>
                                <span className="text-sm text-gray-900">{audit.overallScore}/100</span>
                                <span className="text-sm text-gray-600">{formatDate(audit.auditDate)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Governance Tab */}
              {activeTab === 'governance' && (
                <div className="card">
                  <div className="card-body">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">DAO Governance</h3>
                      <button className="btn btn-primary flex items-center">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Proposal
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4">Proposal</th>
                            <th className="text-left py-3 px-4">Type</th>
                            <th className="text-left py-3 px-4">Proposer</th>
                            <th className="text-left py-3 px-4">Quorum</th>
                            <th className="text-left py-3 px-4">Voting Results</th>
                            <th className="text-left py-3 px-4">Status</th>
                            <th className="text-left py-3 px-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockProposals.map((proposal) => {
                          const votingResults = calculateVotingResults(proposal.yesVotes, proposal.noVotes);
                          return (
                            <tr key={proposal.proposalId} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div>
                                  <p className="font-medium text-gray-900">{proposal.title}</p>
                                  <p className="text-sm text-gray-600">#{proposal.proposalId}</p>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-gray-600">{proposal.proposalType}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-gray-600">{proposal.proposer.slice(0, 10)}...</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-gray-900">{(proposal.quorumRequired / 100).toFixed(1)}%</span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="space-y-1">
                                  <div className="flex items-center">
                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-green-500 h-2 rounded-full" 
                                        style={{ width: `${votingResults.yesPercentage}%` }}
                                      ></div>
                                    </div>
                                    <span className="ml-2 text-sm text-gray-900">{votingResults.yesPercentage.toFixed(1)}%</span>
                                  </div>
                                  <div className="flex items-center">
                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-red-500 h-2 rounded-full" 
                                        style={{ width: `${votingResults.noPercentage}%` }}
                                      ></div>
                                    </div>
                                    <span className="ml-2 text-sm text-gray-900">{votingResults.noPercentage.toFixed(1)}%</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getProposalStatusColor(proposal.status)}`}>
                                  {proposal.status}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex gap-2">
                                  <button className="text-blue-600 hover:text-blue-800">
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  {proposal.status === ProposalStatus.Active && (
                                    <button className="text-green-600 hover:text-green-800">
                                      <ThumbsUp className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Treasury Tab */}
              {activeTab === 'treasury' && (
                <div className="card">
                  <div className="card-body">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Treasury Management</h3>
                      <button className="btn btn-primary flex items-center">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Allocation
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4">Recipient</th>
                            <th className="text-left py-3 px-4">Amount</th>
                            <th className="text-left py-3 px-4">Purpose</th>
                            <th className="text-left py-3 px-4">Vesting Progress</th>
                            <th className="text-left py-3 px-4">Created</th>
                            <th className="text-left py-3 px-4">Status</th>
                            <th className="text-left py-3 px-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockTreasuryAllocations.map((allocation) => {
                            const progress = (allocation.releasedInstallments / allocation.totalInstallments) * 100;
                            return (
                              <tr key={allocation.allocationId} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4">
                                  <span className="text-sm text-gray-900">{allocation.recipient.slice(0, 10)}...</span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="font-medium text-gray-900">{formatAmount(allocation.amount)}</span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="text-sm text-gray-600">{allocation.purpose}</span>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="space-y-1">
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-blue-500 h-2 rounded-full" 
                                        style={{ width: `${progress}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm text-gray-600">
                                      {allocation.releasedInstallments}/{allocation.totalInstallments} installments
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="text-sm text-gray-600">{formatDate(allocation.createdAt)}</span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    allocation.isActive ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50'
                                  }`}>
                                    {allocation.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex gap-2">
                                    <button className="text-blue-600 hover:text-blue-800">
                                      <Eye className="h-4 w-4" />
                                    </button>
                                    {allocation.isActive && (
                                      <button className="text-green-600 hover:text-green-800">
                                        <DollarSign className="h-4 w-4" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Grants Tab */}
              {activeTab === 'grants' && (
                <div className="space-y-6">
                  {/* Grant Programs */}
                  <div className="card">
                    <div className="card-body">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Grant Programs</h3>
                        <button className="btn btn-primary flex items-center">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Program
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {mockGrantPrograms.map((program) => (
                          <div key={program.programId} className="border rounded-lg p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="font-medium text-gray-900">{program.name}</h4>
                                <p className="text-sm text-gray-600 mt-1">{program.description}</p>
                              </div>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                program.status === GrantProgramStatus.Active ? 'text-green-600 bg-green-50' : 
                                program.status === GrantProgramStatus.Completed ? 'text-gray-600 bg-gray-50' : 
                                'text-yellow-600 bg-yellow-50'
                              }`}>
                                {program.status}
                              </span>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Total Budget:</span>
                                <span className="font-medium">{formatAmount(program.totalBudget)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Grant Range:</span>
                                <span className="font-medium">
                                  {formatAmount(program.minGrantAmount)} - {formatAmount(program.maxGrantAmount)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Application Period:</span>
                                <span className="font-medium">
                                  {formatDate(program.applicationStart)} - {formatDate(program.applicationEnd)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Reviewers:</span>
                                <span className="font-medium">{program.reviewerPanel.length}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recent Applications */}
                  <div className="card">
                    <div className="card-body">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Applications</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-full">
                              <BookOpen className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <p className="font-medium text-gray-900">AI Innovation Project</p>
                              <p className="text-sm text-gray-600">Submitted to AI Innovation Grant 2026</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-blue-600 bg-blue-50">
                              Under Review
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-full">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="ml-4">
                              <p className="font-medium text-gray-900">Developer Tutorial Series</p>
                              <p className="text-sm text-gray-600">Approved for 15 EGLD</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-50">
                              Approved
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Economics Tab */}
              {activeTab === 'economics' && (
                <div className="space-y-6">
                  {/* Economic Model Details */}
                  <div className="card">
                    <div className="card-body">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">Economic Model Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-4">Fee Distribution</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 border rounded">
                              <span className="text-gray-600">Protocol Fee</span>
                              <div className="text-right">
                                <span className="font-medium">{(mockEconomicModel.protocolFeeRate / 100).toFixed(2)}%</span>
                                <span className="text-sm text-gray-500">of all transactions</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center p-3 border rounded">
                              <span className="text-gray-600">Treasury Allocation</span>
                              <div className="text-right">
                                <span className="font-medium">{(mockEconomicModel.treasuryAllocationRate / 100).toFixed(2)}%</span>
                                <span className="text-sm text-gray-500">of protocol fees</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center p-3 border rounded">
                              <span className="text-gray-600">Staking Rewards</span>
                              <div className="text-right">
                                <span className="font-medium">{(mockEconomicModel.stakingRewardRate / 100).toFixed(2)}%</span>
                                <span className="text-sm text-gray-500">of treasury</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center p-3 border rounded">
                              <span className="text-gray-600">Deflationary Burn</span>
                              <div className="text-right">
                                <span className="font-medium">{(mockEconomicModel.deflationaryBurnRate / 100).toFixed(2)}%</span>
                                <span className="text-sm text-gray-500">of protocol fees</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-700 mb-4">Token Supply</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 border rounded">
                              <span className="text-gray-600">Max Supply</span>
                              <span className="font-medium">{formatAmount(mockEconomicModel.maxSupply)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 border rounded">
                              <span className="text-gray-600">Current Supply</span>
                              <span className="font-medium">{formatAmount(mockEconomicModel.currentSupply)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 border rounded">
                              <span className="text-gray-600">Circulating Supply</span>
                              <span className="font-medium">{formatAmount(mockEconomicModel.circulatingSupply)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 border rounded">
                              <span className="text-gray-600">Staked Amount</span>
                              <span className="font-medium">{formatAmount(mockEconomicModel.stakedAmount)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 border rounded">
                              <span className="text-gray-600">Total Burned</span>
                              <span className="font-medium">{formatAmount(mockEconomicModel.totalBurned)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Token Metrics */}
                  <div className="card">
                    <div className="card-body">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Metrics</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-6 border rounded-lg">
                          <div className="text-4xl font-bold text-gray-900 mb-2">
                            {((parseFloat(mockEconomicModel.stakedAmount) / parseFloat(mockEconomicModel.circulatingSupply)) * 100).toFixed(1)}%
                          </div>
                          <p className="text-sm text-gray-600">Staking Ratio</p>
                        </div>
                        <div className="text-center p-6 border rounded-lg">
                          <div className="text-4xl font-bold text-gray-900 mb-2">
                            {((parseFloat(mockEconomicModel.totalBurned) / parseFloat(mockEconomicModel.maxSupply)) * 100).toFixed(2)}%
                          </div>
                          <p className="text-sm text-gray-600">Burn Percentage</p>
                        </div>
                        <div className="text-center p-6 border rounded-lg">
                          <div className="text-4xl font-bold text-gray-900 mb-2">
                            {((parseFloat(mockEconomicModel.circulatingSupply) / parseFloat(mockEconomicModel.currentSupply)) * 100).toFixed(1)}%
                          </div>
                          <p className="text-sm text-gray-600">Circulation Rate</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Testing Tab */}
              {activeTab === 'testing' && (
                <div className="space-y-6">
                  {/* Stress Tests */}
                  <div className="card">
                    <div className="card-body">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Stress Tests</h3>
                        <button className="btn btn-primary flex items-center">
                          <Plus className="h-4 w-4 mr-2" />
                          Start Test
                        </button>
                      </div>

                      <div className="space-y-4">
                        {mockStressTests.map((test) => (
                          <div key={test.testId} className="border rounded-lg p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="font-medium text-gray-900">{test.testName}</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {test.concurrentUsers.toLocaleString()} users, {test.transactionsPerSecond} tx/s
                                </p>
                              </div>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTestStatusColor(test.status)}`}>
                                {test.status}
                              </span>
                            </div>
                            
                            {test.status === TestStatus.Completed && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h5 className="font-medium text-gray-700 mb-2">Performance Metrics</h5>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Total Transactions:</span>
                                    <span className="font-medium">{test.results.totalTransactions.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Success Rate:</span>
                                    <span className="font-medium text-green-600">
                                      {((test.results.successfulTransactions / test.results.totalTransactions) * 100).toFixed(2)}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Throughput:</span>
                                    <span className="font-medium">{test.results.throughput} tx/s</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Avg Response Time:</span>
                                    <span className="font-medium">{(test.results.averageResponseTime / 1000).toFixed(2)}s</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h5 className="font-medium text-gray-700 mb-2">Resource Usage</h5>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Average Gas Used:</span>
                                    <span className="font-medium">{test.results.averageGasUsed.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Peak Gas Used:</span>
                                    <span className="font-medium">{test.results.peakGasUsed.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Memory Usage:</span>
                                    <span className="font-medium">{test.results.memoryUsage}%</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">CPU Usage:</span>
                                    <span className="font-medium">{test.results.cpuUsage}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            )}
                            
                            <div className="flex justify-between items-center mt-4">
                              <div className="text-sm text-gray-600">
                                Duration: {test.durationSeconds}s | 
                                Started: {formatDate(test.startedAt)}
                              </div>
                              <div className="flex gap-2">
                                <button className="text-blue-600 hover:text-blue-800">
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button className="text-gray-600 hover:text-gray-800">
                                  <RefreshCw className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  {/* Security Audits */}
                  <div className="card">
                    <div className="card-body">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Security Audits</h3>
                        <button className="btn btn-primary flex items-center">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Audit
                        </button>
                      </div>

                      <div className="space-y-4">
                        {mockSecurityAudits.map((audit) => {
                          const { grade, color } = getAuditScoreGrade(audit.overallScore);
                          return (
                            <div key={audit.auditId} className="border rounded-lg p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h4 className="font-medium text-gray-900">{audit.auditType}</h4>
                                  <p className="text-sm text-gray-600 mt-1">{audit.auditor}</p>
                                  <p className="text-sm text-gray-600">Version: {audit.contractVersion}</p>
                                </div>
                                <div className="text-right">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color}`}>
                                    Grade {grade}
                                  </span>
                                  <div className="text-sm text-gray-900 mt-1">{audit.overallScore}/100</div>
                                </div>
                              </div>
                              
                              <div className="mb-4">
                                <h5 className="font-medium text-gray-700 mb-2">Findings ({audit.findings.length})</h5>
                                <div className="space-y-2">
                                  {audit.findings.map((finding) => (
                                    <div key={finding.findingId} className="flex items-center justify-between p-3 border rounded">
                                      <div className="flex items-center">
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getSeverityColor(finding.severity)}`}>
                                          {finding.severity}
                                        </span>
                                        <div className="ml-3">
                                          <p className="text-sm font-medium text-gray-900">{finding.title}</p>
                                          <p className="text-xs text-gray-600">{finding.affectedContract}:{finding.lineNumber}</p>
                                        </div>
                                      </div>
                                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                        finding.status === FindingStatus.Open ? 'text-red-600 bg-red-50' :
                                        finding.status === FindingStatus.InProgress ? 'text-yellow-600 bg-yellow-50' :
                                        finding.status === FindingStatus.Fixed ? 'text-green-600 bg-green-50' :
                                        'text-gray-600 bg-gray-50'
                                      }`}>
                                        {finding.status}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-600">
                                  Audit Date: {formatDate(audit.auditDate)} | 
                                  Status: {audit.status}
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
                          );
                        })}
                      </div>
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
