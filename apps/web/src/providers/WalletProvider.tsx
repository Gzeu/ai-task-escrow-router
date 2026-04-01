'use client';

import {
  TransactionsToastList,
  SignTransactionsModals,
  NotificationModal,
  DappProvider,
} from '@multiversx/sdk-dapp';

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const NETWORK_CONFIG = {
    id: process.env.NEXT_PUBLIC_NETWORK || 'devnet',
    name: 'Devnet',
    egldLabel: 'xEGLD',
    decimals: '18',
    egldDenomination: '18',
    gasPerDataByte: '1500',
    walletConnectDeepLink:
      'https://maiar.page.link/?apn=com.elrond.maiar&isi=1519405832&ibi=com.elrond.maiar&link=https://xportal.com/',
    walletAddress: 'https://devnet-wallet.multiversx.com/dapp/init',
    apiAddress: process.env.NEXT_PUBLIC_API_URL || 'https://devnet-api.multiversx.com',
    explorerAddress: 'https://devnet-explorer.multiversx.com',
    apiTimeout: 6000,
  };

  return (
    <DappProvider
      environment="devnet"
      customNetworkConfig={{
        ...NETWORK_CONFIG,
        walletConnectV2ProjectId:
          process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
      }}
    >
      <TransactionsToastList />
      <NotificationModal />
      <SignTransactionsModals className="custom-class-for-modals" />
      {children}
    </DappProvider>
  );
}
