#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { config } from './config.js';

// Create MCP server
const server = new Server(
  {
    name: 'AI Task Escrow Router',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize AI Task Escrow client
let client: AITaskEscrowClient;

async function initializeClient() {
  try {
    client = new AITaskEscrowClient(config);
    console.error('AI Task Escrow client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize AI Task Escrow client:', error);
    throw error;
  }
}

// Tool definitions
const SubmitResultSchema = z.object({
  taskId: z.string().describe('Task ID to submit result for'),
  resultUri: z.string().describe('IPFS hash or URI for task result'),
  agentAddress: z.string().describe('Agent wallet address'),
});

const ClaimPaymentSchema = z.object({
  taskId: z.string().describe('Task ID to claim payment for'),
  claimantAddress: z.string().describe('Claimant wallet address'),
});

const GetTasksPaginatedSchema = z.object({
  creatorAddress: z.string().optional().describe('Filter by creator address'),
  agentAddress: z.string().optional().describe('Filter by assigned agent address'),
  state: z.string().optional().describe('Filter by task state'),
  offset: z.number().optional().describe('Pagination offset'),
  limit: z.number().optional().describe('Maximum number of tasks to return'),
});

const AcceptTaskSchema = z.object({
  taskId: z.string().describe('Task ID to accept'),
  agentAddress: z.string().describe('Agent address accepting the task'),
});

const FindBestTasksSchema = z.object({
  agentAddress: z.string().describe('Agent address'),
  skills: z.array(z.string()).describe('Array of skills to match'),
  maxBudgetEGLD: z.number().optional().describe('Maximum budget in EGLD'),
  limit: z.number().optional().describe('Maximum number of tasks to return'),
});

const GetTaskLifecycleSchema = z.object({
  taskId: z.string().describe('Task ID to get lifecycle for'),
});

const RegisterAgentSkillsSchema = z.object({
  agentAddress: z.string().describe('Agent address'),
  skills: z.array(z.string()).describe('Array of skill identifiers'),
  availabilityHours: z.number().optional().describe('Weekly availability hours'),
});

const CreateTaskSchema = z.object({
  metadataUri: z.string().describe('IPFS hash or URI for task metadata'),
  deadline: z.number().optional().describe('Task deadline in seconds from now'),
  reviewTimeout: z.number().optional().describe('Review timeout in seconds'),
  ap2MandateHash: z.string().optional().describe('AP2 mandate hash if applicable'),
  priorityFee: z.string().optional().describe('Priority fee in wei'),
  paymentToken: z.string().describe('Token identifier (EGLD or ESDT token)'),
  paymentAmount: z.string().describe('Payment amount in wei'),
  paymentNonce: z.number().optional().describe('Payment nonce for ESDT tokens'),
  creatorAddress: z.string().describe('Creator wallet address'),
});

const GetTasksSchema = z.object({
  creatorAddress: z.string().optional().describe('Filter by creator address'),
  agentAddress: z.string().optional().describe('Filter by agent address'),
  state: z.string().optional().describe('Filter by task state'),
  limit: z.number().optional().describe('Maximum number of tasks to return'),
});

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_tasks',
        description: 'Get paginated list of tasks with optional filtering',
        inputSchema: {
          type: 'object',
          properties: {
            creatorAddress: {
              type: 'string',
              description: 'Filter by creator address',
            },
            agentAddress: {
              type: 'string',
              description: 'Filter by assigned agent address',
            },
            state: {
              type: 'string',
              description: 'Filter by task state',
            },
            offset: {
              type: 'number',
              description: 'Pagination offset',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of tasks to return',
            },
          },
        },
      },
      {
        name: 'submit_result',
        description: 'Submit result for an accepted task',
        inputSchema: {
          type: 'object',
          properties: {
            taskId: {
              type: 'string',
              description: 'Task ID to submit result for',
            },
            resultUri: {
              type: 'string',
              description: 'IPFS hash or URI for task result',
            },
            agentAddress: {
              type: 'string',
              description: 'Agent wallet address',
            },
          },
          required: ['taskId', 'resultUri', 'agentAddress'],
        },
      },
      {
        name: 'claim_payment',
        description: 'Claim payment for completed or approved tasks',
        inputSchema: {
          type: 'object',
          properties: {
            taskId: {
              type: 'string',
              description: 'Task ID to claim payment for',
            },
            claimantAddress: {
              type: 'string',
              description: 'Claimant wallet address',
            },
          },
          required: ['taskId', 'claimantAddress'],
        },
      },
      {
        name: 'get_task',
        description: 'Get details of a specific task',
        inputSchema: {
          type: 'object',
          properties: {
            taskId: {
              type: 'string',
              description: 'Task ID to retrieve',
            },
          },
          required: ['taskId'],
        },
      },
      {
        name: 'get_tasks',
        description: 'Get list of tasks with optional filtering',
        inputSchema: {
          type: 'object',
          properties: {
            creatorAddress: {
              type: 'string',
              description: 'Filter by creator address',
            },
            agentAddress: {
              type: 'string',
              description: 'Filter by agent address',
            },
            state: {
              type: 'string',
              description: 'Filter by task state',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of tasks to return',
            },
          },
        },
      },
      {
        name: 'get_agent_reputation',
        description: 'Get reputation score for an agent',
        inputSchema: {
          type: 'object',
          properties: {
            agentAddress: {
              type: 'string',
              description: 'Agent wallet address',
            },
          },
          required: ['agentAddress'],
        },
      },
      {
        name: 'get_supported_tokens',
        description: 'Get list of supported tokens',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Tool handlers
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'create_task': {
        const params = CreateTaskSchema.parse(args);
        
        // Build transaction
        const tx = await client.buildCreateTaskWithToken(params.creatorAddress, {
          metadataUri: params.metadataUri,
          deadline: params.deadline,
          reviewTimeout: params.reviewTimeout,
          ap2MandateHash: params.ap2MandateHash,
          priorityFee: params.priorityFee ? BigInt(params.priorityFee) : undefined,
          payment: {
            tokenIdentifier: params.paymentToken,
            amount: BigInt(params.paymentAmount),
            nonce: BigInt(params.paymentNonce || 0),
          },
        });

        return {
          content: [
            {
              type: 'text',
              text: `Task creation transaction built successfully!\n\nTransaction Details:\n- Sender: ${params.creatorAddress}\n- Contract: ${client.contractAddress}\n- Gas Limit: ${tx.gasLimit}\n- Value: ${tx.value}\n- Data: ${tx.data.toString('hex')}\n\nNext steps:\n1. Sign this transaction with your wallet\n2. Send the signed transaction to the network\n3. Wait for confirmation to get the task ID`,
            },
          ],
        };
      }

      case 'submit_result': {
        const params = SubmitResultSchema.parse(args);
        
        // Build transaction
        const tx = await client.buildSubmitResult(params.agentAddress, {
          taskId: BigInt(params.taskId),
          resultUri: params.resultUri,
        });

        return {
          content: [
            {
              type: 'text',
              text: `Result submission transaction built successfully!\n\nTransaction Details:\n- Sender: ${params.agentAddress}\n- Contract: ${client.contractAddress}\n- Gas Limit: ${tx.gasLimit}\n- Value: ${tx.value}\n- Data: ${tx.data.toString('hex')}\n\nNext steps:\n1. Sign this transaction with your wallet\n2. Send the signed transaction to the network\n3. Wait for confirmation`,
            },
          ],
        };
      }

      case 'claim_payment': {
        const params = ClaimPaymentSchema.parse(args);
        
        // Build transaction
        const tx = await client.buildClaimApproval(params.claimantAddress, BigInt(params.taskId));

        return {
          content: [
            {
              type: 'text',
              text: `Payment claim transaction built successfully!\n\nTransaction Details:\n- Sender: ${params.claimantAddress}\n- Contract: ${client.contractAddress}\n- Gas Limit: ${tx.gasLimit}\n- Value: ${tx.value}\n- Data: ${tx.data.toString('hex')}\n\nNext steps:\n1. Sign this transaction with your wallet\n2. Send the signed transaction to the network\n3. Wait for payment confirmation`,
            },
          ],
        };
      }

      case 'get_task': {
        const params = GetTaskSchema.parse(args);
        
        // Query task details
        const task = await client.getTask(BigInt(params.taskId));

        return {
          content: [
            {
              type: 'text',
              text: `Task Details:\n\nTask ID: ${task.taskId}\nCreator: ${task.creator}\nAgent: ${task.assignedAgent || 'Not assigned'}\nPayment Token: ${task.paymentToken}\nPayment Amount: ${task.paymentAmount}\nPayment Nonce: ${task.paymentNonce}\nProtocol Fee: ${task.protocolFeeBps} bps\nState: ${task.state}\nCreated: ${new Date(task.createdAt).toISOString()}\nDeadline: ${task.deadline ? new Date(task.deadline).toISOString() : 'Not set'}\nMetadata URI: ${task.metadataUri}\nResult URI: ${task.resultUri || 'Not submitted'}`,
            },
          ],
        };
      }

      case 'get_tasks': {
        const params = GetTasksPaginatedSchema.parse(args);
        
        // Query tasks from indexer API
        const response = await fetch(`${config.indexerUrl}/api/tasks?${new URLSearchParams({
          ...(params.creatorAddress && { creatorAddress: params.creatorAddress }),
          ...(params.agentAddress && { agentAddress: params.agentAddress }),
          ...(params.state && { state: params.state }),
          ...(params.offset && { offset: params.offset.toString() }),
          ...(params.limit && { limit: params.limit.toString() })
        })}`);
        
        if (!response.ok) {
          throw new McpError(ErrorCode.InternalError, 'Failed to fetch tasks from indexer');
        }
        
        const data = await response.json();
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                tasks: data.tasks || [],
                pagination: {
                  offset: params.offset || 0,
                  limit: params.limit || 50,
                  total: data.total || data.tasks?.length || 0
                },
                filters: {
                  creatorAddress: params.creatorAddress,
                  agentAddress: params.agentAddress,
                  state: params.state
                }
              }, null, 2)
            }
          ]
        };
      }

      case 'get_agent_reputation': {
        const params = { agentAddress: args.agentAddress as string };
        
        // Query agent reputation
        const reputation = await client.getAgentReputation(params.agentAddress);

        if (!reputation) {
          return {
            content: [
              {
                type: 'text',
                text: `Agent not found or no reputation data available for address: ${params.agentAddress}`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: `Agent Reputation:\n\nAddress: ${reputation.address}\nReputation Score: ${reputation.reputationScore}\nTotal Tasks: ${reputation.totalTasks}\nCompleted Tasks: ${reputation.completedTasks}\nCancelled Tasks: ${reputation.cancelledTasks}\nDisputed Tasks: ${reputation.disputedTasks}\nTotal Earned: ${reputation.totalEarned}\nAverage Rating: ${reputation.averageRating}/5\nVerification Status: ${reputation.verificationStatus}\nLast Active: ${new Date(reputation.lastActive).toISOString()}`,
            },
          ],
        };
      }

      case 'get_supported_tokens': {
        // Query supported tokens
        const tokens = await client.getSupportedTokens();
        
        return {
          content: [
            {
              type: 'text',
              text: `Supported Tokens:\n\n${tokens.tokens.join('\n')}\n\nThese tokens can be used for task payments and rewards.`,
            },
          ],
        };
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid parameters: ${error.errors.map(e => e.message).join(', ')}`
      );
    }
    throw error;
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  
  // Initialize client before starting server
  await initializeClient();
  
  await server.connect(transport);
  console.error('AI Task Escrow MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
