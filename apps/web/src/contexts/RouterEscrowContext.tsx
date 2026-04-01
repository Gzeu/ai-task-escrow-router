import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Mock implementations to fix import errors
interface Task {
  taskId: string;
  creator: string;
  assignedAgent?: string;
  paymentToken: string;
  paymentAmount: string;
  state: string;
  metadataUri: string;
  resultUri?: string;
  createdAt: number;
  deadline?: number;
  reviewTimeout?: number;
}

interface RouterEscrowClientConfig {
  contractAddress: string;
  network: string;
  apiTimeout?: number;
}

// Mock RouterEscrowClient
class MockRouterEscrowClient {
  private config: RouterEscrowClientConfig;

  constructor(config: RouterEscrowClientConfig) {
    this.config = config;
  }

  async createTask(params: any): Promise<any> {
    return { success: true, taskId: 'mock-task-id' };
  }

  async getTask(taskId: string): Promise<Task> {
    return {
      taskId,
      creator: 'erd1mockcreator',
      paymentToken: 'EGLD',
      paymentAmount: '1000000000000000000',
      state: 'Open',
      metadataUri: 'ipfs://mock-metadata',
      createdAt: Date.now() / 1000
    };
  }

  async getTasks(params?: any): Promise<Task[]> {
    return [];
  }

  async submitResult(params: any): Promise<any> {
    return { success: true };
  }

  async submitTask(taskId: string, resultUri: string): Promise<any> {
    return { success: true };
  }

  async claimPayment(params: any): Promise<any> {
    return { success: true };
  }

  async acceptTask(taskId: string): Promise<any> {
    return { success: true };
  }

  async approveTask(taskId: string): Promise<any> {
    return { success: true };
  }

  async cancelTask(taskId: string): Promise<any> {
    return { success: true };
  }

  async openDispute(taskId: string): Promise<any> {
    return { success: true };
  }

  async disputeTask(taskId: string, disputeUri: string): Promise<any> {
    return { success: true };
  }
}

interface RouterEscrowContextType {
  client: MockRouterEscrowClient | null;
  isConnected: boolean;
  address: string | null;
  config: RouterEscrowClientConfig | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  createTask: (params: any) => Promise<any>;
  getTask: (taskId: string) => Promise<Task>;
  getTasks: (params?: any) => Promise<Task[]>;
  submitResult: (params: any) => Promise<any>;
  claimPayment: (params: any) => Promise<any>;
}

const RouterEscrowContext = createContext<RouterEscrowContextType | undefined>(undefined);

interface RouterEscrowProviderProps {
  children: ReactNode;
}

export function RouterEscrowProvider({ children }: RouterEscrowProviderProps) {
  const [client, setClient] = useState<MockRouterEscrowClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [config, setConfig] = useState<RouterEscrowClientConfig | null>(null);

  const connectWallet = async () => {
    // Mock wallet connection
    setIsConnected(true);
    setAddress('erd1mockaddress');
    
    if (!config) return;
    
    const mockClient = new MockRouterEscrowClient(config);
    setClient(mockClient);
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress(null);
    setClient(null);
  };

  const createTask = async (params: any) => {
    if (!client) throw new Error('Client not initialized');
    return client.createTask(params);
  };

  const getTask = async (taskId: string) => {
    if (!client) throw new Error('Client not initialized');
    return client.getTask(taskId);
  };

  const getTasks = async (params?: any) => {
    if (!client) throw new Error('Client not initialized');
    return client.getTasks(params);
  };

  const submitResult = async (params: any) => {
    if (!client) throw new Error('Client not initialized');
    return client.submitResult(params);
  };

  const claimPayment = async (params: any) => {
    if (!client) throw new Error('Client not initialized');
    return client.claimPayment(params);
  };

  useEffect(() => {
    const mockConfig: RouterEscrowClientConfig = {
      contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'erd1mockcontract',
      network: process.env.NEXT_PUBLIC_NETWORK || 'devnet',
      apiTimeout: 6000
    };
    setConfig(mockConfig);
  }, []);

  const value: RouterEscrowContextType = {
    client,
    isConnected,
    address,
    config,
    connectWallet,
    disconnectWallet,
    createTask,
    getTask,
    getTasks,
    submitResult,
    claimPayment
  };

  return (
    <RouterEscrowContext.Provider value={value}>
      {children}
    </RouterEscrowContext.Provider>
  );
}

export function useRouterEscrow(): RouterEscrowContextType {
  const context = useContext(RouterEscrowContext);
  if (context === undefined) {
    throw new Error('useRouterEscrow must be used within a RouterEscrowProvider');
  }
  return context;
}
