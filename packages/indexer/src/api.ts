import express, { Request, Response } from 'express';
import cors from 'cors';
import { DatabaseService } from './database';
import { Logger } from './logger';
import { TaskFilter, PaginationParams } from './types';

export class ApiServer {
  private app: express.Application;
  private port: number;

  constructor(
    private database: DatabaseService,
    private logger: Logger
  ) {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3001');
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use((req, res, next) => {
      this.logger.info(`${req.method} ${req.path}`);
      next();
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({ status: 'ok', timestamp: Date.now() });
    });

    // Tasks endpoints
    this.app.get('/tasks', this.getTasks.bind(this));
    this.app.get('/tasks/:id', this.getTask.bind(this));

    // Agent endpoints
    this.app.get('/agents/:address', this.getAgent.bind(this));
    this.app.get('/agents', this.getTopAgents.bind(this));

    // Creator endpoints
    this.app.get('/creators/:address', this.getCreator.bind(this));
    this.app.get('/creators', this.getTopCreators.bind(this));

    // Stats endpoints
    this.app.get('/stats', this.getStats.bind(this));
    this.app.get('/stats/protocol', this.getProtocolStats.bind(this));

    // Events endpoints
    this.app.get('/events', this.getEvents.bind(this));

    // Error handler
    this.app.use((err: Error, req: Request, res: Response, next: any) => {
      this.logger.error('API Error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });

    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({ error: 'Not found' });
    });
  }

  async start(): Promise<void> {
    this.app.listen(this.port, () => {
      this.logger.info(`API server started on port ${this.port}`);
    });
  }

  // Task endpoints
  private async getTasks(req: Request, res: Response): Promise<void> {
    try {
      const filter: TaskFilter = {
        creator: req.query.creator as string,
        assignedAgent: req.query.assignedAgent as string,
        state: req.query.state as any,
        states: req.query.states ? (req.query.states as string).split(',') : undefined,
        createdAfter: req.query.createdAfter ? parseInt(req.query.createdAfter as string) : undefined,
        createdBefore: req.query.createdBefore ? parseInt(req.query.createdBefore as string) : undefined,
        minAmount: req.query.minAmount as string,
        maxAmount: req.query.maxAmount as string
      };

      const pagination: PaginationParams = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc'
      };

      const result = await this.database.getTasks(filter, pagination);
      res.json(result);
    } catch (error) {
      this.logger.error('Error in getTasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  }

  private async getTask(req: Request, res: Response): Promise<void> {
    try {
      const taskId = parseInt(req.params.id);
      const task = await this.database.getTask(taskId);
      
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      res.json(task);
    } catch (error) {
      this.logger.error('Error in getTask:', error);
      res.status(500).json({ error: 'Failed to fetch task' });
    }
  }

  // Agent endpoints
  private async getAgent(req: Request, res: Response): Promise<void> {
    try {
      const address = req.params.address;
      const stats = await this.database.getAgentStats(address);
      
      if (!stats) {
        res.status(404).json({ error: 'Agent not found' });
        return;
      }

      const metrics = await this.database.getAgentMetrics(address);
      res.json({ ...stats, metrics });
    } catch (error) {
      this.logger.error('Error in getAgent:', error);
      res.status(500).json({ error: 'Failed to fetch agent stats' });
    }
  }

  private async getTopAgents(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const agents = await this.database.getTopAgents(limit);
      res.json(agents);
    } catch (error) {
      this.logger.error('Error in getTopAgents:', error);
      res.status(500).json({ error: 'Failed to fetch top agents' });
    }
  }

  // Creator endpoints
  private async getCreator(req: Request, res: Response): Promise<void> {
    try {
      const address = req.params.address;
      const stats = await this.database.getCreatorStats(address);
      
      if (!stats) {
        res.status(404).json({ error: 'Creator not found' });
        return;
      }

      const metrics = await this.database.getCreatorMetrics(address);
      res.json({ ...stats, metrics });
    } catch (error) {
      this.logger.error('Error in getCreator:', error);
      res.status(500).json({ error: 'Failed to fetch creator stats' });
    }
  }

  private async getTopCreators(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const creators = await this.database.getTopCreators(limit);
      res.json(creators);
    } catch (error) {
      this.logger.error('Error in getTopCreators:', error);
      res.status(500).json({ error: 'Failed to fetch top creators' });
    }
  }

  // Stats endpoints
  private async getStats(req: Request, res: Response): Promise<void> {
    try {
      const protocolStats = await this.database.getProtocolStats();
      const metrics = await this.database.getProtocolMetrics();
      
      res.json({
        protocol: protocolStats,
        metrics: metrics[0] || {}
      });
    } catch (error) {
      this.logger.error('Error in getStats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  }

  private async getProtocolStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.database.getProtocolStats();
      res.json(stats);
    } catch (error) {
      this.logger.error('Error in getProtocolStats:', error);
      res.status(500).json({ error: 'Failed to fetch protocol stats' });
    }
  }

  // Events endpoints
  private async getEvents(req: Request, res: Response): Promise<void> {
    try {
      const filter: any = {};
      
      if (req.query.eventIdentifier) {
        filter.eventIdentifier = req.query.eventIdentifier;
      }
      
      if (req.query.fromBlock) {
        filter.blockNumber = { $gte: parseInt(req.query.fromBlock as string) };
      }
      
      if (req.query.toBlock) {
        filter.blockNumber = { $lte: parseInt(req.query.toBlock as string) };
      }

      const pagination: PaginationParams = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        sortBy: req.query.sortBy as string || 'timestamp',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
      };

      const result = await this.database.getEvents(filter, pagination);
      res.json(result);
    } catch (error) {
      this.logger.error('Error in getEvents:', error);
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  }
}
