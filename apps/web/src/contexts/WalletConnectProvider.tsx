import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { DappProvider } from '@multiversx/sdk-dapp';
import { EnvironmentsEnum } from '@multiversx/sdk-dapp/types';

interface WalletConnectContextValue {
  isConnected: boolean;
  address?: string;
  projectId: string;
  isWalletConnectEnabled: boolean;
}

const WalletConnectContext = createContext<WalletConnectContextValue | null>(null);

export function WalletConnectProvider({ children }: { children: ReactNode }) {
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';
  const isWalletConnectEnabled = process.env.NEXT_PUBLIC_ENABLE_WALLETCONNECT === 'true';
  const isMockWallet = process.env.NEXT_PUBLIC_MOCK_WALLET === 'true';

  // WalletConnect metadata
  const metadata = {
    name: process.env.NEXT_PUBLIC_WALLETCONNECT_METADATA_NAME || 'AI Task Escrow Router',
    url: process.env.NEXT_PUBLIC_WALLETCONNECT_METADATA_URL || window.location.origin,
    icons: [process.env.NEXT_PUBLIC_WALLETCONNECT_METADATA_ICON || '/favicon.ico'],
  };

  // Environment configuration
  const environment = process.env.NEXT_PUBLIC_NETWORK === 'mainnet' 
    ? EnvironmentsEnum.mainnet 
    : EnvironmentsEnum.devnet;

  // DappProvider configuration
  const dappConfig = {
    environment,
    walletConnectV2ProjectId: isWalletConnectEnabled && !isMockWallet ? projectId : undefined,
    walletConnectV2Relay: 'wss://relay.walletconnect.com',
    walletConnectV2Metadata: isWalletConnectEnabled && !isMockWallet ? metadata : undefined,
    apiTimeout: parseInt(process.env.NEXT_PUBLIC_SDK_TIMEOUT || '6000'),
    shouldUseWebViewProvider: true,
  };

  const contextValue: WalletConnectContextValue = {
    isConnected: false, // This would be managed by actual wallet state
    projectId,
    isWalletConnectEnabled: isWalletConnectEnabled && !isMockWallet,
  };

  // Log WalletConnect status
  useEffect(() => {
    console.log('🔗 WalletConnect Configuration:', {
      projectId: projectId ? 'SET' : 'NOT_SET',
      isWalletConnectEnabled,
      isMockWallet,
      environment,
      metadata: metadata.name,
    });

    if (isWalletConnectEnabled && !projectId) {
      console.warn('⚠️ WalletConnect is enabled but PROJECT_ID is not set');
      console.log('📝 Please set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in your .env.local');
    }

    if (isMockWallet) {
      console.log('🧪 Mock wallet mode is enabled - WalletConnect is disabled');
    }
  }, [projectId, isWalletConnectEnabled, isMockWallet, environment, metadata.name]);

  return (
    <WalletConnectContext.Provider value={contextValue}>
      <DappProvider {...dappConfig}>
        {children}
      </DappProvider>
    </WalletConnectContext.Provider>
  );
}

export const useWalletConnect = () => {
  const context = useContext(WalletConnectContext);
  if (!context) {
    throw new Error('useWalletConnect must be used within WalletConnectProvider');
  }
  return context;
};
