import { useGetAccountInfo, useGetIsLoggedIn } from '@multiversx/sdk-dapp/hooks';
import { useGetNetworkConfig } from '@multiversx/sdk-dapp/hooks';
import { logout } from '@multiversx/sdk-dapp/utils';
import { Button } from '@/components/ui/button';

export function WalletConnect() {
  const { address } = useGetAccountInfo();
  const { network } = useGetNetworkConfig();
  const isLoggedIn = useGetIsLoggedIn();

  return (
    <div className="flex items-center space-x-4">
      {isLoggedIn && address ? (
        <>
          <div className="text-sm">
            <span className="text-gray-600">Address:</span>
            <span className="font-mono text-gray-900">{address.slice(0, 6)}...{address.slice(-4)}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">Network:</span>
            <span className="text-gray-900">{network.id}</span>
          </div>
          <Button onClick={() => logout()}>
            Disconnect
          </Button>
        </>
      ) : (
        <Button>Connect Wallet</Button>
      )}
    </div>
  );
}
