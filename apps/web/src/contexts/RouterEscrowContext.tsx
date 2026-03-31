import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Mock implementations to fix import errors
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
  Refunded = "Refunded"
}

interface Config {
  owner: string;
  treasury: string;
  feeBps: number;
  minReputation: number;
  maxTaskValue: string;
  reputationDecayRate: number;
  isPaused: boolean;
  maxConcurrentTasks: number;
}

interface NetworkConfig {
  chainId: string;
  contractAddress: string;
  apiTimeout: number;
  gasLimit: number;
}

interface TransactionResult {
  hash: string;
  status: 'pending' | 'success' | 'failed';
  error?: string;
}

class RouterEscrowClient {
  private config: NetworkConfig;

  constructor(config: NetworkConfig) {
    this.config = config;
  }

  getConfig(): NetworkConfig {
    return this.config;
  }

  async getTask(taskId: string): Promise<Task> {
    return {
      taskId,
      creator: "erd1...",
      paymentToken: "EGLD",
      paymentAmount: "1000000000000000000",
      feeBpsSnapshot: 300,
      createdAt: Date.now(),
      metadataUri: "ipfs://...",
      state: TaskState.Open
    };
  }

  async getTasks(): Promise<Task[]> {
    return [];
  }

  async createTask(params: any): Promise<TransactionResult> {
    return {
      hash: "tx_hash_" + Date.now(),
      status: "success"
    };
  }
}

interface RouterEscrowContextType {
  client: RouterEscrowClient | null;
  isConnected: boolean;
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  config: Config | null;
  isLoading: boolean;
}

const RouterEscrowContext = createContext<RouterEscrowContextType | null>(null);

interface RouterEscrowProviderProps {
  children: ReactNode;
}

export function RouterEscrowProvider({ children }: RouterEscrowProviderProps) {
  const [client, setClient] = useState<RouterEscrowClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<UserSigner | null>(null);
  const [config, setConfig] = useState<Config | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeClient();
  }, []);

  const initializeClient = async () => {
    try {
      const networkConfig: NetworkConfig = {
        chainId: process.env.NEXT_PUBLIC_NETWORK || 'D',
        gasPrice: 1000000000,
        gasLimit: 10000000,
        contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
        apiTimeout: 10000,
      };

      if (!networkConfig.contractAddress) {
        console.warn('Contract address not configured');
        setIsLoading(false);
        return;
      }

      const newClient = new RouterEscrowClient(networkConfig);
      setClient(newClient);

      // Load config
      try {
        const contractConfig = await newClient.getConfig();
        setConfig(contractConfig);
      } catch (error) {
        console.error('Failed to load contract config:', error);
      }
    } catch (error) {
      console.error('Failed to initialize client:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async () => {
    try {
      // This would integrate with MultiversX wallet providers
      // For now, we'll simulate wallet connection
      
      // In a real implementation, you would:
      // 1. Use xPortal app deep linking
      // 2. Use Web Wallet
      // 3. Use Ledger
      // 4. Use Maiar App
      
      // Simulated connection - replace with actual wallet integration
      const mockAddress = 'erd1...'; // Replace with actual wallet connection
      
      setAddress(mockAddress);
      setIsConnected(true);
      
      // You would also initialize the signer here
      // const signer = await getSignerFromWallet();
      // setSigner(signer);
      
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setIsConnected(false);
    setSigner(null);
  };

  const value: RouterEscrowContextType = {
    client,
    isConnected,
    address,
    signer,
    connectWallet,
    disconnectWallet,
    config,
    isLoading,
  };

  return (
    <RouterEscrowContext.Provider value={value}>
      {children}
    </RouterEscrowContext.Provider>
  );
}

export function useRouterEscrow(): RouterEscrowContextType {
  const context = useContext(RouterEscrowContext);
  if (!context) {
    throw new Error('useRouterEscrow must be used within a RouterEscrowProvider');
  }
  return context;
}
