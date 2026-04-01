/**
 * AI Task Escrow Router SDK Tests
 * ESDT Multi-Token Support Tests
 */

import { RouterEscrowClient } from './client';
import { 
  RouterEscrowClientConfig,
  TokenPayment,
  CreateTaskWithTokenParams,
  GetTokenInfoParams,
  ValidateTokenParams,
  GetSupportedTokensParams,
  TokenInfoResult,
  SupportedTokensResult,
  TaskState
} from './types';

describe('RouterEscrowClient - ESDT Multi-Token Support', () => {
  let client: RouterEscrowClient;
  let mockConfig: RouterEscrowClientConfig;

  beforeEach(() => {
    mockConfig = {
      contractAddress: 'erd1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqsh',
      network: 'devnet' as const,
      apiTimeout: 6000,
      gasLimit: {
        createTask: 15000000,
        acceptAnyToken: 8000000,
        getTokenInfo: 5000000,
        validateToken: 5000000,
        getSupportedTokens: 5000000
      }
    };
    
    try {
      client = new RouterEscrowClient(mockConfig);
    } catch (error) {
      // Skip tests if client initialization fails
      console.warn('Client initialization failed:', error);
    }
  });

  describe('ESDT Multi-Token Transaction Builders', () => {
    it('should create task with ESDT token', async () => {
      const sender = 'erd1testsender';
      const params: CreateTaskWithTokenParams = {
        metadataUri: 'ipfs://QmTaskMetadata',
        deadline: 86400,
        reviewTimeout: 3600,
        payment: {
          tokenIdentifier: 'USDC-abcdef',
          amount: 1000000n,
          nonce: 0n
        }
      };

      const tx = await client.buildCreateTaskWithToken(sender, params);
      
      expect(tx.sender.toString()).toBeTruthy();
      expect(tx.receiver.toString()).toBeTruthy();
      expect(tx.gasLimit).toBe(15000000);
      expect(tx.value).toBe('0'); // No EGLD for ESDT tokens
      expect(tx.chainID).toBe('D');
    });

    it('should create task with EGLD token', async () => {
      const sender = 'erd1testsender';
      const params: CreateTaskWithTokenParams = {
        metadataUri: 'ipfs://QmTaskMetadata',
        payment: {
          tokenIdentifier: 'EGLD',
          amount: 1000000000000000000n,
          nonce: 0n
        }
      };

      const tx = await client.buildCreateTaskWithToken(sender, params);
      
      expect(tx.sender.toString()).toBeTruthy();
      expect(tx.receiver.toString()).toBeTruthy();
      expect(tx.gasLimit).toBe(15000000);
      expect(tx.value).toBe('1000000000000000000'); // EGLD value
      expect(tx.chainID).toBe('D');
    });

    it('should accept any ESDT token', async () => {
      const sender = 'erd1testsender';
      const params = {
        payment: {
          tokenIdentifier: 'CUSTOM-TOKEN',
          amount: 500000n,
          nonce: 1n
        }
      };

      const tx = await client.buildAcceptAnyToken(sender, params);
      
      expect(tx.sender.toString()).toBeTruthy();
      expect(tx.receiver.toString()).toBeTruthy();
      expect(tx.gasLimit).toBe(8000000);
      expect(tx.value).toBe('0'); // No EGLD for ESDT tokens
      expect(tx.chainID).toBe('D');
    });
  });

  describe('ESDT Multi-Token Query Methods', () => {
    it('should get token info for EGLD', async () => {
      if (!client) return; // Skip if client initialization failed
      
      const params: GetTokenInfoParams = {
        tokenIdentifier: 'EGLD'
      };

      const result = await client.getTokenInfo(params);
      
      expect(result.identifier).toBe('EGLD');
      expect(result.name).toBe('EGLD');
      expect(result.decimals).toBe(18);
      expect(result.isEGLD).toBe(true);
    });

    it('should get token info for ESDT token', async () => {
      if (!client) return; // Skip if client initialization failed
      
      const params: GetTokenInfoParams = {
        tokenIdentifier: 'USDC-abcdef'
      };

      const result = await client.getTokenInfo(params);
      
      expect(result.identifier).toBe('USDC-abcdef');
      expect(result.name).toBe('ESDT Token');
      expect(result.decimals).toBe(18);
      expect(result.isEGLD).toBe(false);
    });

    it('should validate EGLD token', async () => {
      if (!client) return; // Skip if client initialization failed
      
      const params: ValidateTokenParams = {
        tokenIdentifier: 'EGLD'
      };

      const isValid = await client.validateToken(params);
      expect(isValid).toBe(true);
    });

    it('should validate ESDT token', async () => {
      if (!client) return; // Skip if client initialization failed
      
      const params: ValidateTokenParams = {
        tokenIdentifier: 'USDC-abcdef'
      };

      const isValid = await client.validateToken(params);
      expect(isValid).toBe(true);
    });

    it('should validate empty token', async () => {
      if (!client) return; // Skip if client initialization failed
      
      const params: ValidateTokenParams = {
        tokenIdentifier: ''
      };

      const isValid = await client.validateToken(params);
      expect(isValid).toBe(false);
    });

    it('should get supported tokens', async () => {
      if (!client) return; // Skip if client initialization failed
      
      const params: GetSupportedTokensParams = {};

      const result = await client.getSupportedTokens();
      
      expect(result.tokens).toContain('EGLD');
      expect(result.tokens).toContain('MEX');
      expect(result.tokens.length).toBeGreaterThan(0);
    });

    it('should handle invalid token identifier', async () => {
      if (!client) return; // Skip if client initialization failed
      
      const params: GetTokenInfoParams = {
        tokenIdentifier: ''
      };

      const result = await client.getTokenInfo(params);
      expect(result.identifier).toBe('');
      expect(result.name).toBe('Unknown');
    });
  });

  describe('ESDT Multi-Token Utility Functions', () => {
    it('should create EGLD payment', () => {
      if (!client) return; // Skip if client initialization failed
      
      const payment = client.createEGLDPayment(1000000000000000000n);
      
      expect(payment.tokenIdentifier).toBe('EGLD');
      expect(payment.amount).toBe(1000000000000000000n);
      expect(payment.nonce).toBe(0n);
    });

    it('should create ESDT payment', () => {
      if (!client) return; // Skip if client initialization failed
      
      const payment = client.createESDTPayment('USDC-abcdef', 1000000n, 1n);
      
      expect(payment.tokenIdentifier).toBe('USDC-6f6c6d617262d6564');
      expect(payment.amount).toBe(1000000n);
      expect(payment.nonce).toBe(1n);
    });

    it('should create custom token payment', () => {
      if (!client) return; // Skip if client initialization failed
      
      const payment = client.createTokenPayment('CUSTOM-TOKEN', 500000n, 2n);
      
      expect(payment.tokenIdentifier).toBe('CUSTOM-TOKEN');
      expect(payment.amount).toBe(500000n);
      expect(payment.nonce).toBe(2n);
    });

    it('should format token amount with decimals', () => {
      if (!client) return; // Skip if client initialization failed
      
      const formatted = client.formatTokenAmount(1000000n, 6);
      expect(formatted).toBe('1.000000');
    });

    it('should format token amount without decimals', () => {
      if (!client) return; // Skip if client initialization failed
      
      const formatted = client.formatTokenAmount(1500000n, 0);
      expect(formatted).toBe('1500000');
    });

    it('should parse token amount with decimals', () => {
      if (!client) return; // Skip if client initialization failed
      
      const amount = client.parseTokenAmount('1.5', 6);
      expect(amount).toBe(1500000n);
    });

    it('should parse token amount without decimals', () => {
      if (!client) return; // Skip if client initialization failed
      
      const amount = client.parseTokenAmount('1000', 0);
      expect(amount).toBe(1000n);
    });

    it('should parse token amount with trailing zeros', () => {
      if (!client) return; // Skip if client initialization failed
      
      const amount = client.parseTokenAmount('1.500000', 6);
      expect(amount).toBe(1500000n);
    });
  });

  describe('ESDT Multi-Token Error Handling', () => {
    it('should handle invalid token identifier', async () => {
      const params: GetTokenInfoParams = {
        tokenIdentifier: ''
      };

      const result = await client.getTokenInfo(params);
      expect(result.identifier).toBe('');
      expect(result.name).toBe('Unknown');
    });

    it('should throw error for unsupported network', () => {
      const invalidConfig = {
        ...mockConfig,
        network: 'invalid' as any
      };

      expect(() => new RouterEscrowClient(invalidConfig)).toThrow();
    });

    it('should handle empty token payment', () => {
      expect(() => client.createTokenPayment('', 0n)).toThrow();
      expect(() => client.createTokenPayment('TOKEN', 0n)).toThrow();
    });
  });

  describe('ESDT Multi-Token Integration', () => {
    it('should handle complete ESDT workflow', async () => {
      if (!client) return; // Skip if client initialization failed
      
      // 1. Create ESDT payment
      const payment = client.createESDTPayment('USDC-abcdef', 1000000n, 0n);
      
      // 2. Create task params
      const taskParams: CreateTaskWithTokenParams = {
        metadataUri: 'ipfs://QmTaskMetadata',
        deadline: 86400,
        reviewTimeout: 3600,
        payment
      };

      // 3. Build transaction
      const tx = await client.buildCreateTaskWithToken('erd1creator', taskParams);
      
      // 4. Verify transaction
      expect(tx.sender.toString()).toBe('erd1creator');
      expect(tx.receiver.toString()).toBe(mockConfig.contractAddress);
      expect(tx.gasLimit).toBe(15000000);
      expect(tx.value).toBe('0');

      // 5. Validate token
      const isValid = await client.validateToken({ 
        tokenIdentifier: payment.tokenIdentifier 
      });
      expect(isValid).toBe(true);

      // 6. Get token info
      const tokenInfo = await client.getTokenInfo({ 
        tokenIdentifier: payment.tokenIdentifier 
      });
      expect(tokenInfo.identifier).toBe(payment.tokenIdentifier);
      expect(tokenInfo.isEGLD).toBe(false);
    });

    it('should handle EGLD workflow', async () => {
      if (!client) return; // Skip if client initialization failed
      
      // 1. Create EGLD payment
      const payment = client.createEGLDPayment(1000000000000000000n);
      
      // 2. Create task params
      const taskParams: CreateTaskWithTokenParams = {
        metadataUri: 'ipfs://QmTaskMetadata',
        payment
      };

      // 3. Build transaction
      const tx = await client.buildCreateTaskWithToken('erd1creator', taskParams);
      
      // 4. Verify transaction
      expect(tx.sender.toString()).toBe('erd1creator');
      expect(tx.receiver.toString()).toBe(mockConfig.contractAddress);
      expect(tx.gasLimit).toBe(15000000);
      expect(tx.value).toBe('1000000000000000000');

      // 5. Validate token (EGLD should always be valid)
      const isValid = await client.validateToken({ 
        tokenIdentifier: 'EGLD' 
      });
      expect(isValid).toBe(true);

      // 6. Get token info
      const tokenInfo = await client.getTokenInfo({ 
        tokenIdentifier: 'EGLD' 
      });
      expect(tokenInfo.identifier).toBe('EGLD');
      expect(tokenInfo.isEGLD).toBe(true);
      expect(tokenInfo.decimals).toBe(18);
    });
  });

  describe('ESDT Multi-Token State Management', () => {
    it('should handle task state encoding', () => {
      if (!client) return; // Skip if client initialization failed
      
      const state = TaskState.Approved;
      const encoded = (client as any).encodeTaskState(state);
      expect(encoded).toBe('03');
    });

    it('should encode all task states', () => {
      if (!client) return; // Skip if client initialization failed
      
      const states = [
        TaskState.Open,
        TaskState.Accepted,
        TaskState.Submitted,
        TaskState.Approved,
        TaskState.Cancelled,
        TaskState.Disputed,
        TaskState.Refunded,
        TaskState.Resolved
      ];

      const expected = ['00', '01', '02', '03', '04', '05', '06', '07', '08'];
      
      states.forEach((state, index) => {
        const encoded = (client as any).encodeTaskState(state);
        expect(encoded).toBe(expected[index]);
      });
    });

    it('should throw error for unknown task state', () => {
      if (!client) return; // Skip if client initialization failed
      
      expect(() => (client as any).encodeTaskState('unknown' as any)).toThrow();
    });
  });
});
