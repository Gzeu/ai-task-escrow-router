import type { AppProps } from 'next/app';
import { useState } from 'react';
import { WalletProvider } from '@/providers/WalletProvider';
import { EscrowProvider } from '@/contexts/RouterEscrowContext';
import Navigation from '@/components/Navigation';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <WalletProvider>
      <EscrowProvider>
        <div className="min-h-screen bg-gray-50">
          <Navigation 
            mobileMenuOpen={mobileMenuOpen} 
            setMobileMenuOpen={setMobileMenuOpen} 
          />
          <main>
            <Component {...pageProps} />
          </main>
        </div>
      </EscrowProvider>
    </WalletProvider>
  );
}