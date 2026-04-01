'use client';

import { createContext, useContext, useCallback } from 'react';
import { useGetAccountInfo, useGetNetworkConfig } from '@multiversx/sdk-dapp/hooks';
import { sendTransactions } from '@multiversx/sdk-dapp/services';
import { RouterEscrowSDK } from '@ai-task-escrow/sdk';

interface CreateTaskParams {
  tokenId: string;
  amount: bigint;
  description: string;
  deadline: number;
}

interface EscrowContextValue {
  sdk: RouterEscrowSDK | null;
  address: string;
  isLoggedIn: boolean;
  createTask: (params: CreateTaskParams) => Promise<string>;
  acceptTask: (taskId: bigint) => Promise<string>;
  submitResult: (taskId: bigint, resultHash: string) => Promise<string>;
  approveResult: (taskId: bigint) => Promise<string>;
  disputeTask: (taskId: bigint, reason: string) => Promise<string>;
}

const EscrowContext = createContext<EscrowContextValue | null>(null);

export function EscrowProvider({ children }: { children: React.ReactNode }) {
  const { account } = useGetAccountInfo();
  const { network } = useGetNetworkConfig();

  const sdk = account.address
    ? new RouterEscrowSDK({
        contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
        proxyUrl: network.apiAddress,
      })
    : null;

  const sendTx = useCallback(async (txData: any) => {
    const { sessionId } = await sendTransactions({
      transactions: [txData],
      transactionsDisplayInfo: {
        processingMessage: 'Processing transaction...',
        errorMessage: 'Transaction failed',
        successMessage: 'Transaction successful',
      },
    });
    return sessionId;
  }, []);

  const createTask = useCallback(
    async ({ tokenId, amount, description, deadline }: CreateTaskParams) => {
      if (!sdk) throw new Error('Wallet not connected');
      const tx = sdk.buildCreateTaskWithToken({ tokenId, amount, description, deadline });
      return sendTx(tx);
    },
    [sdk, sendTx]
  );

  const acceptTask = useCallback(
    async (taskId: bigint) => {
      if (!sdk) throw new Error('Wallet not connected');
      const tx = sdk.buildAcceptTask(taskId);
      return sendTx(tx);
    },
    [sdk, sendTx]
  );

  const submitResult = useCallback(
    async (taskId: bigint, resultHash: string) => {
      if (!sdk) throw new Error('Wallet not connected');
      const tx = sdk.buildSubmitResult(taskId, resultHash);
      return sendTx(tx);
    },
    [sdk, sendTx]
  );

  const approveResult = useCallback(
    async (taskId: bigint) => {
      if (!sdk) throw new Error('Wallet not connected');
      const tx = sdk.buildApproveResult(taskId);
      return sendTx(tx);
    },
    [sdk, sendTx]
  );

  const disputeTask = useCallback(
    async (taskId: bigint, reason: string) => {
      if (!sdk) throw new Error('Wallet not connected');
      const tx = sdk.buildDisputeTask(taskId, reason);
      return sendTx(tx);
    },
    [sdk, sendTx]
  );

  return (
    <EscrowContext.Provider
      value={{
        sdk,
        address: account.address,
        isLoggedIn: !!account.address,
        createTask,
        acceptTask,
        submitResult,
        approveResult,
        disputeTask,
      }}
    >
      {children}
    </EscrowContext.Provider>
  );
}

export const useEscrow = () => {
  const ctx = useContext(EscrowContext);
  if (!ctx) throw new Error('useEscrow must be used within EscrowProvider');
  return ctx;
};

export const useRouterEscrow = useEscrow;
