import { useGetAccountInfo, useGetLoginInfo } from '@multiversx/sdk-dapp/hooks';
import { useGetNetworkConfig } from '@multiversx/sdk-dapp/hooks';
import { useGetIsLoggedIn } from '@multiversx/sdk-dapp/hooks/auth/useGetIsLoggedIn';
import { useGetLoginInfo } from '@multiversx/sdk-dapp/hooks/auth/useGetLoginInfo';
import { useGetAccount } from '@multiversx/sdk-dapp/hooks/account/useGetAccount';
import { useGetLoginInfo } from '@multiversx/sdk-dapp/hooks/auth/useGetLoginInfo';
import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks/account/useGetAccountInfo';
import { useGetAccount } from '@multiversx/sdk-dapp/hooks/account/useGetAccount';
import { useGetLoginInfo } from '@multiversx/sdk-dapp/hooks/auth/useGetLoginInfo';
import { useGetIsLoggedIn } from '@multiversx/sdk-dapp/hooks/auth/useGetIsLoggedIn';
import { useGetNetworkConfig } from '@multiversx/sdk-dapp/hooks';
import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks/account/useGetAccountInfo';
import { useGetLoginInfo } from '@multiversx/sdk-dapp/hooks/auth/useGetLoginInfo';

export function WalletConnect() {
  const { loginMethod } = useGetLoginInfo();

  return (
    <div className="flex space-x-2">
      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
        Connect Wallet
      </button>
    </div>
  );
}
