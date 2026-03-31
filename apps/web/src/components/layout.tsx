import { useGetAccountInfo, useGetNetworkConfig } from '@multiversx/sdk-dapp/hooks';
import { useGetIsLoggedIn } from '@multiversx/sdk-dapp/hooks';
import { logout } from '@multiversx/sdk-dapp/utils';
import { Button } from '@/components/ui/button';
import { WalletConnect } from '@/components/wallet-connect';
import Link from 'next/link';
import { useRouter } from 'next/router';

export function Layout({ children }: { children: React.ReactNode }) {
  const { address } = useGetAccountInfo();
  const { network } = useGetNetworkConfig();
  const { loginMethod } = useGetLoginInfo();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AE</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                AI Task Escrow
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link 
                href="/dashboard" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link 
                href="/tasks" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Tasks
              </Link>
              <Link 
                href="/analytics" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Analytics
              </Link>
              <Link 
                href="/profile" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Profile
              </Link>
            </nav>

            {/* Wallet Connection */}
            <div className="flex items-center space-x-4">
              {address ? (
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{network.alias}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-mono text-gray-900">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {loginMethod}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <WalletConnect />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                AI Task Escrow
              </h3>
              <p className="text-sm text-gray-600">
                Decentralized task execution platform powered by MultiversX blockchain.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Protocol
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="/docs" className="hover:text-gray-900">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/api" className="hover:text-gray-900">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link href="/github" className="hover:text-gray-900">
                    GitHub
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Resources
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="/faq" className="hover:text-gray-900">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="hover:text-gray-900">
                    Support
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-gray-900">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Community
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="/discord" className="hover:text-gray-900">
                    Discord
                  </Link>
                </li>
                <li>
                  <Link href="/twitter" className="hover:text-gray-900">
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link href="/telegram" className="hover:text-gray-900">
                    Telegram
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t">
            <p className="text-sm text-gray-600 text-center">
              © 2024 AI Task Escrow Router. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
