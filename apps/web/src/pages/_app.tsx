import type { AppProps } from 'next/app';
import { useState } from 'react';
import { RouterEscrowProvider } from '@/contexts/RouterEscrowContext';
import Navigation from '@/components/Navigation';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <RouterEscrowProvider>
      <div className="min-h-screen bg-gray-50">
        <Navigation 
          mobileMenuOpen={mobileMenuOpen} 
          setMobileMenuOpen={setMobileMenuOpen} 
        />
        <main>
          <Component {...pageProps} />
        </main>
      </div>
    </RouterEscrowProvider>
  );
}