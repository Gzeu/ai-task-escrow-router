import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouterEscrow } from '@/contexts/RouterEscrowContext';

// Local implementations
enum TaskState {
  Open = "Open",
  Accepted = "Accepted",
  Submitted = "Submitted",
  Approved = "Approved",
  Cancelled = "Cancelled",
  Disputed = "Disputed",
  Refunded = "Refunded"
}

const formatAmount = (amount: string): string => {
  const num = parseFloat(amount) / 1e18;
  return num.toFixed(4) + ' EGLD';
};
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Users, 
  DollarSign,
  ArrowRight,
  Wallet,
  Shield,
  Zap
} from 'lucide-react';

interface DashboardStats {
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  totalVolume: string;
  protocolFees: string;
}

export default function HomePage() {
  const { client, isConnected, address, config, connectWallet, isLoading } = useRouterEscrow();
  const [stats, setStats] = React.useState<DashboardStats>({
    totalTasks: 0,
    activeTasks: 0,
    completedTasks: 0,
    totalVolume: '0',
    protocolFees: '0',
  });

  React.useEffect(() => {
    if (client) {
      loadStats();
    }
  }, [client]);

  const loadStats = async () => {
    try {
      // In a real implementation, you would fetch these from an indexer
      // For now, we'll use mock data
      setStats({
        totalTasks: 1247,
        activeTasks: 89,
        completedTasks: 1158,
        totalVolume: '1250000000000000000000', // 1250 EGLD
        protocolFees: '12500000000000000000', // 12.5 EGLD
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>AI Task Escrow Router - Decentralized Task Management</title>
        <meta name="description" content="Secure escrow and settlement protocol for AI-mediated task execution on MultiversX" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="container-wide py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-8 w-8 text-primary-600" />
                  <h1 className="text-2xl font-bold text-gray-900">AI Task Escrow Router</h1>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {isConnected ? (
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600">
                      Connected: <span className="font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                    </div>
                    <Link href="/dashboard" className="btn btn-primary">
                      Dashboard
                    </Link>
                  </div>
                ) : (
                  <button onClick={connectWallet} className="btn btn-primary">
                    <Wallet className="h-4 w-4 mr-2" />
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-50 to-indigo-100 py-20">
          <div className="container-wide">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Secure Escrow for AI-Powered Tasks
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                A decentralized protocol for creating, managing, and settling AI-mediated tasks with 
                on-chain escrow protection and automated dispute resolution.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isConnected ? (
                  <>
                    <Link href="/tasks/create" className="btn btn-primary text-lg px-8 py-3">
                      Create Task
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                    <Link href="/tasks" className="btn btn-secondary text-lg px-8 py-3">
                      Browse Tasks
                    </Link>
                  </>
                ) : (
                  <button onClick={connectWallet} className="btn btn-primary text-lg px-8 py-3">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="container-wide">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card">
                <div className="card-body">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TrendingUp className="h-8 w-8 text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalTasks.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Clock className="h-8 w-8 text-warning-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.activeTasks.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-8 w-8 text-success-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.completedTasks.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <DollarSign className="h-8 w-8 text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Volume</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatAmount(stats.totalVolume)} EGLD
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="container-wide">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose AI Task Escrow Router?</h3>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Built for the MultiversX ecosystem with sub-second finality and agentic commerce integration.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Shield className="h-12 w-12 text-primary-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Secure Escrow</h4>
                <p className="text-gray-600">
                  Funds are locked in smart contracts until task completion, protecting both creators and agents.
                </p>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Zap className="h-12 w-12 text-primary-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Fast Settlement</h4>
                <p className="text-gray-600">
                  Leveraging MultiversX's sub-second finality for instant task completion and payment.
                </p>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Users className="h-12 w-12 text-primary-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Agent Marketplace</h4>
                <p className="text-gray-600">
                  Connect with AI agents and human operators through a decentralized reputation system.
                </p>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <AlertCircle className="h-12 w-12 text-primary-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Dispute Resolution</h4>
                <p className="text-gray-600">
                  Automated and manual dispute resolution mechanisms to ensure fair outcomes.
                </p>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <TrendingUp className="h-12 w-12 text-primary-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Protocol Revenue</h4>
                <p className="text-gray-600">
                  Sustainable fee model supporting protocol development and ecosystem growth.
                </p>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <DollarSign className="h-12 w-12 text-primary-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Low Fees</h4>
                <p className="text-gray-600">
                  Efficient protocol design with minimal fees, typically 1-5% of task value.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Protocol Info */}
        {config && (
          <section className="py-16 bg-white">
            <div className="container-wide">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-xl font-semibold text-gray-900">Protocol Information</h3>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <p className="text-sm text-gray-600">Protocol Fee</p>
                      <p className="text-lg font-semibold text-gray-900">{config.feeBps / 100}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Treasury</p>
                      <p className="text-sm font-mono text-gray-900">
                        {config.treasury.slice(0, 10)}...{config.treasury.slice(-8)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="text-lg font-semibold">
                        <span className={`badge ${config.paused ? 'badge-error' : 'badge-success'}`}>
                          {config.paused ? 'Paused' : 'Active'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Resolver</p>
                      <p className="text-sm font-mono text-gray-900">
                        {config.resolver 
                          ? `${config.resolver.slice(0, 10)}...${config.resolver.slice(-8)}`
                          : 'Not set'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="container-wide">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Shield className="h-6 w-6" />
                  <span className="text-lg font-semibold">AI Task Escrow Router</span>
                </div>
                <p className="text-gray-400">
                  Secure escrow and settlement protocol for AI-mediated task execution.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Protocol</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/docs" className="hover:text-white">Documentation</Link></li>
                  <li><Link href="/api" className="hover:text-white">API Reference</Link></li>
                  <li><Link href="/contracts" className="hover:text-white">Smart Contracts</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Developers</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/sdk" className="hover:text-white">SDK</Link></li>
                  <li><Link href="/examples" className="hover:text-white">Examples</Link></li>
                  <li><Link href="https://github.com/ai-task-escrow/router" className="hover:text-white">GitHub</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Community</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/discord" className="hover:text-white">Discord</Link></li>
                  <li><Link href="/twitter" className="hover:text-white">Twitter</Link></li>
                  <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2026 AI Task Escrow Router. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
