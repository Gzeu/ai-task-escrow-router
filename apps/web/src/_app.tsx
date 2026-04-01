// import { DappProvider } from '@multiversx/sdk-dapp';
// import { EnvironmentsEnum } from '@multiversx/sdk-dapp/types';
// import { TransactionsToastList } from '@multiversx/sdk-dapp/UI/TransactionsToastList';
// import { NotificationModal } from '@multiversx/sdk-dapp/UI/NotificationModal';
// import { SignTransactionsModals } from '@multiversx/sdk-dapp/UI/SignTransactionsModals';
import { Toaster } from 'react-hot-toast';
import type { AppProps } from 'next/app';

import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div>
      <Toaster position="top-right" />
      <Component {...pageProps} />
    </div>
  );
}
