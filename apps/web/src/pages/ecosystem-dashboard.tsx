import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouterEscrow } from '@/contexts/RouterEscrowContext';
import { 
  Globe, 
  Users, 
  Activity, 
  Zap, 
  Shield, 
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Settings,
  RefreshCw,
  Link,
  Database,
  CreditCard,
  Clock,
  BarChart3
} from 'lucide-react';

interface EcosystemStats {
  ucpAgents: number;
  acpMerchants: number;
  ap2Mandates: number;
  mcpTools: number;
  x402Settlements: number;
  totalIntegrations: number;
  activeConnections: number;
  protocolVolume: string;
}

interface IntegrationStatus {
  protocol: string;
  status: 'active' | 'inactive' | 'error';
  lastSync: number;
  connections: number;
  error?: string;
}

export default function EcosystemDashboard() {
  const { client, isConnected } = useRouterEscrow();
  const [stats, setStats] = useState<EcosystemStats | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProtocol, setSelectedProtocol] = useState<string>('all');

  useEffect(() => {
    if (client && isConnected) {
      loadEcosystemData();
    }
  }, [client, isConnected]);

  const loadEcosystemData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API calls
      const mockStats: EcosystemStats = {
        ucpAgents: 156,
        acpMerchants: 89,
        ap2Mandates: 234,
        mcpTools: 67,
        x402Settlements: 145,
        totalIntegrations: 691,
        activeConnections: 523,
        protocolVolume: '45,230.75 EGLD',
      };

      const mockIntegrations: IntegrationStatus[] = [
        {
          protocol: 'UCP',
          status: 'active',
          lastSync: Date.now() - 300000, // 5 minutes ago
          connections: 156,
        },
        {
          protocol: 'ACP',
          status: 'active',
          lastSync: Date.now() - 600000, // 10 minutes ago
          connections: 89,
        },
        {
          protocol: 'AP2',
          status: 'active',
          lastSync: Date.now() - 900000, // 15 minutes ago
          connections: 234,
        },
        {
          protocol: 'MCP',
          status: 'active',
          lastSync: Date.now() - 120000, // 2 minutes ago
          connections: 67,
        },
        {
          protocol: 'x402',
          status: 'inactive',
          lastSync: Date.now() - 3600000, // 1 hour ago
          connections: 0,
        },
      ];
      
      setStats(mockStats);
      setIntegrations(mockIntegrations);
    } catch (error) {
      console.error('Failed to load ecosystem data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-gray-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'inactive': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const formatLastSync = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${Math.floor(hours / 24)}d ago`;
    }
  };

  const filteredIntegrations = selectedProtocol === 'all' 
    ? integrations 
    : integrations.filter(integration => integration.protocol === selectedProtocol);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to view the ecosystem dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Ecosystem Dashboard - AI Task Escrow Router</title>
        <meta name="description" content="Universal Agentic Commerce Stack integration dashboard" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="container-wide py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ecosystem Dashboard</h1>
              <p className="text-gray-600 mt-2">Universal Agentic Commerce Stack (UACP)</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select 
                value={selectedProtocol}
                onChange={(e) => setSelectedProtocol(e.target.value)}
                className="input"
              >
                <option value="all">All Protocols</option>
                <option value="UCP">UCP</option>
                <option value="ACP">ACP</option>
                <option value="AP2">AP2</option>
                <option value="MCP">MCP</option>
                <option value="x402">x402</option>
              </select>
              
              <button 
                onClick={loadEcosystemData}
                className="btn btn-secondary flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : stats && (
            <div className="space-y-8">
              {/* Main Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="card">
                  <div className="card-body">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <Globe className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.ucpAgents)}</p>
                        <p className="text-sm text-gray-600">UCP Agents</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body">
                    <div className="flex items-center">
                      <div className="p-3 bg-green-100 rounded-full">
                        <Database className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.acpMerchants)}</p>
                        <p className="text-sm text-gray-600">ACP Merchants</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body">
                    <div className="flex items-center">
                      <div className="p-3 bg-purple-100 rounded-full">
                        <Shield className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.ap2Mandates)}</p>
                        <p className="text-sm text-gray-600">AP2 Mandates</p>
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
                        <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.mcpTools)}</p>
                        <p className="text-sm text-gray-600">MCP Tools</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body">
                    <div className="flex items-center">
                      <div className="p-3 bg-red-100 rounded-full">
                        <CreditCard className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.x402Settlements)}</p>
                        <p className="text-sm text-gray-600">x402 Settlements</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body">
                    <div className="flex items-center">
                      <div className="p-3 bg-indigo-100 rounded-full">
                        <Activity className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalIntegrations)}</p>
                        <p className="text-sm text-gray-600">Total Integrations</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body">
                    <div className="flex items-center">
                      <div className="p-3 bg-yellow-100 rounded-full">
                        <TrendingUp className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.activeConnections)}</p>
                        <p className="text-sm text-gray-600">Active Connections</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body">
                    <div className="flex items-center">
                      <div className="p-3 bg-teal-100 rounded-full">
                        <BarChart3 className="h-6 w-6 text-teal-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-2xl font-bold text-gray-900">{stats.protocolVolume}</p>
                        <p className="text-sm text-gray-600">Protocol Volume</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Integration Status */}
              <div className="card">
                <div className="card-body">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Status</h3>
                  
                  <div className="space-y-4">
                    {filteredIntegrations.map((integration) => (
                      <div key={integration.protocol} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full ${
                              integration.status === 'active' ? 'bg-green-500' :
                              integration.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
                            }`}></div>
                            <span className="ml-3 font-medium text-gray-900">
                              {integration.protocol}
                            </span>
                            <span className={`ml-2 text-sm ${getStatusColor(integration.status)}`}>
                              {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                            </span>
                          </div>
                          
                          <div className="ml-4">
                            {getStatusIcon(integration.status)}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            {formatLastSync(integration.lastSync)}
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatNumber(integration.connections)} connections
                          </div>
                        </div>
                        
                        {integration.error && (
                          <div className="mt-2 text-xs text-red-600">
                            Error: {integration.error}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card">
                <div className="card-body">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button className="btn btn-primary flex items-center justify-center">
                      <Globe className="h-4 w-4 mr-2" />
                      UCP Registry
                    </button>
                    
                    <button className="btn btn-secondary flex items-center justify-center">
                      <Database className="h-4 w-4 mr-2" />
                      ACP Flows
                    </button>
                    
                    <button className="btn btn-secondary flex items-center justify-center">
                      <Shield className="h-4 w-4 mr-2" />
                      AP2 Mandates
                    </button>
                    
                    <button className="btn btn-secondary flex items-center justify-center">
                      <Zap className="h-4 w-4 mr-2" />
                      MCP Tools
                    </button>
                    
                    <button className="btn btn-secondary flex items-center justify-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      x402 Settlements
                    </button>
                    
                    <button className="btn btn-secondary flex items-center justify-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
