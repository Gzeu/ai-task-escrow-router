import type { AppProps } from 'next/app';
import { RouterEscrowProvider } from '@/contexts/RouterEscrowContext';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <RouterEscrowProvider>
      <Component {...pageProps} />
    </RouterEscrowProvider>
  );
}