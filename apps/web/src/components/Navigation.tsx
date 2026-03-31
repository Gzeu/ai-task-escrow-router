import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useRouterEscrow } from '@/contexts/RouterEscrowContext';
import { 
  Home, 
  List, 
  Plus, 
  BarChart3, 
  User, 
  Settings, 
  Shield,
  Menu,
  X,
  Wallet,
  LogOut
} from 'lucide-react';

interface NavigationProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Navigation({ mobileMenuOpen, setMobileMenuOpen }: NavigationProps) {
  const router = useRouter();
  const { isConnected, address, connectWallet, disconnectWallet } = useRouterEscrow();

  const navigation = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      current: router.pathname === '/'
    },
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: BarChart3,
      current: router.pathname === '/dashboard'
    },
    {
      name: 'Tasks',
      href: '/tasks',
      icon: List,
      current: router.pathname.startsWith('/tasks')
    },
    {
      name: 'Create Task',
      href: '/tasks/create',
      icon: Plus,
      current: router.pathname === '/tasks/create'
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      current: router.pathname === '/profile'
    }
  ];

  const handleWalletAction = async () => {
    if (isConnected) {
      disconnectWallet();
    } else {
      try {
        await connectWallet();
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="container-wide">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link href="/" className="flex items-center space-x-2">
                    <Shield className="h-8 w-8 text-primary-600" />
                    <span className="text-xl font-bold text-gray-900">AI Task Escrow</span>
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        item.current
                          ? 'border-primary-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } transition-colors duration-200`}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {isConnected && address && (
                  <div className="hidden sm:flex sm:items-center sm:space-x-2">
                    <span className="text-sm text-gray-600">Connected:</span>
                    <span className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                  </div>
                )}
                <button
                  onClick={handleWalletAction}
                  className={`btn flex items-center ${
                    isConnected 
                      ? 'btn-secondary' 
                      : 'btn-primary'
                  }`}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  {isConnected ? 'Disconnect' : 'Connect Wallet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="container-wide">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="flex items-center space-x-2">
                  <Shield className="h-8 w-8 text-primary-600" />
                  <span className="text-xl font-bold text-gray-900">AI Task Escrow</span>
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                {isConnected && (
                  <div className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </div>
                )}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  {mobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-base font-medium rounded-md ${
                    item.current
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="px-4">
                  <button
                    onClick={handleWalletAction}
                    className={`w-full btn flex items-center justify-center ${
                      isConnected 
                        ? 'btn-secondary' 
                        : 'btn-primary'
                    }`}
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    {isConnected ? 'Disconnect Wallet' : 'Connect Wallet'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
