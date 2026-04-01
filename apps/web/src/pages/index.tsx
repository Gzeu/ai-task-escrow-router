import React from 'react';
import Link from 'next/link';
import { useRouterEscrow } from '@/contexts/RouterEscrowContext';
import { 
  Shield, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Activity,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import Head from 'next/head';

interface DashboardStats {
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  totalVolume: string;
  protocolFees: string;
  successRate: number;
  averageCompletionTime: number;
  activeAgents: number;
}

export default function HomePage() {
  const { client, isConnected, address, config, connectWallet } = useRouterEscrow();
  const [stats, setStats] = React.useState<DashboardStats>({
    totalTasks: 0,
    activeTasks: 0,
    completedTasks: 0,
    totalVolume: '0',
    protocolFees: '0',
    successRate: 0,
    averageCompletionTime: 0,
    activeAgents: 0
  });

  React.useEffect(() => {
    if (client) {
      const mockStats: DashboardStats = {
        totalTasks: 274,
        activeTasks: 89,
        completedTasks: 1158,
        totalVolume: '1250000000000000000000', // 1250 EGLD
        protocolFees: '12500000000000000000', // 12.5 EGLD
        successRate: 94.5,
        averageCompletionTime: 72, // hours
        activeAgents: 45
      };
      setStats(mockStats);
    }
  }, [client]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Connect Wallet</h1>
          <p className="text-gray-600 mb-6">Please connect your wallet to access the dashboard</p>
          <button 
            onClick={connectWallet}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>AI Task Escrow Router - Decentralized Task Management</title>
        <meta name="description" content="Secure escrow and settlement protocol for AI-mediated task execution on MultiversX" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="container-wide">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-xl font-bold text-gray-900">
                AI Task Escrow
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Dashboard
                </Link>
                <Link href="/tasks" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Tasks
                </Link>
                <Link href="/agents" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Agents
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isConnected ? (
                <>
                  <span className="text-sm text-gray-600">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                  <button className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Disconnect
                  </button>
                </>
              ) : (
                <button 
                  onClick={connectWallet}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container-wide">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Secure Escrow for AI-Powered Tasks
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              A decentralized protocol for creating, managing, and settling AI-mediated tasks with 
              on-chain escrow protection and automated dispute resolution.
            </p>
            <div className="flex justify-center mb-4">
              {isConnected ? (
                <Link 
                  href="/tasks/create" 
                  className="btn btn-primary text-lg px-8 py-3"
                >
                  Create Task
                </Link>
              ) : (
                <button 
                  onClick={connectWallet}
                  className="btn btn-primary text-lg px-8 py-3"
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="py-16 bg-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
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
                    <Activity className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.activeTasks.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completedTasks.toLocaleString()}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{(parseInt(stats.totalVolume) / 1000000000000000000).toLocaleString()} EGLD</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Shield className="h-12 w-12 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Secure Escrow</h4>
              <p className="text-gray-600">
                Funds are locked in smart contracts until task completion, protecting both creators and agents.
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Clock className="h-12 w-12 text-yellow-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Fast Settlement</h4>
              <p className="text-gray-600">
                Leveraging MultiversX's sub-second finality for instant task completion and payment.
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Zap className="h-12 w-12 text-primary-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered</h4>
              <p className="text-gray-600">
                Advanced AI agents can execute complex tasks with higher efficiency and accuracy.
              </p>
            </div>
          </div>
        </div>
      </section>

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
            <p>© 2026 AI Task Escrow Router. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
