import React from 'react';
import { useGetAccountInfo, useGetLoginInfo } from '@multiversx/sdk-dapp/hooks';
import { useWalletConnect } from '@/contexts/WalletConnectProvider';

export default function WalletConnectButton() {
  const { address } = useGetAccountInfo();
  const { isLoggedIn } = useGetLoginInfo();
  const { isWalletConnectEnabled } = useWalletConnect();

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isWalletConnectEnabled) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-500">WalletConnect disabled</span>
        <button
          disabled
          className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed opacity-50"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (isLoggedIn && address) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Connected</span>
        </div>
        <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg border border-green-200">
          <span className="font-medium">{formatAddress(address)}</span>
        </div>
        <button
          onClick={() => {
            // Logout functionality would be handled by sdk-dapp
            console.log('Logout clicked');
          }}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        <span className="text-sm text-gray-600">Not connected</span>
      </div>
      <button
        onClick={() => {
          // Wallet connection would be handled by sdk-dapp's connect method
          console.log('Connect wallet clicked');
        }}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Connect Wallet
      </button>
    </div>
  );
}
