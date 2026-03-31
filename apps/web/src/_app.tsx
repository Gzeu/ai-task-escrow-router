import { DappProvider } from '@multiversx/sdk-dapp/UI';
import { EnvironmentsEnum } from '@multiversx/sdk-dapp/types';
import { TransactionsToastList } from '@multiversx/sdk-dapp/UI/TransactionsToastList';
import { NotificationModal } from '@multiversx/sdk-dapp/UI/NotificationModal';
import { SignTransactionsModals } from '@multiversx/sdk-dapp/UI/SignTransactionsModals';
import { Toaster } from 'react-hot-toast';
import type { AppProps } from 'next/app';

import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <DappProvider
      environment={EnvironmentsEnum.devnet}
      customNetworkConfig={{
        name: 'devnet',
        apiTimeout: 6000,
        walletConnectV2ProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
      }}
    >
      <TransactionsToastList />
      <NotificationModal />
      <SignTransactionsModals />
      <Toaster position="top-right" />
      <Component {...pageProps} />
    </DappProvider>
  );
}
