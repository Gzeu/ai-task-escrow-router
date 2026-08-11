import winston from 'winston';
import { LoggingConfig } from './types';

export class Logger {
  private logger: winston.Logger;
  private config: LoggingConfig;

  constructor(config: LoggingConfig) {
    this.config = config;
    const transports: winston.transport[] = [];

    // Ensure logs directory exists
    import('fs').then(fs => {
      if (!fs.existsSync('logs')) {
        fs.mkdirSync('logs', { recursive: true });
      }
    }).catch(() => {
      // Directory creation failed, console only
    });

    transports.push(
      new winston.transports.File({ 
        filename: 'logs/error.log', 
        level: 'error',
        maxsize: 10485760, // 10MB
        maxFiles: 5,
      })
    );

    transports.push(
      new winston.transports.File({ 
        filename: 'logs/combined.log',
        maxsize: 10485760,
        maxFiles: 10,
      })
    );

    transports.push(
      new winston.transports.Console({
        format: config.format === 'json'
          ? winston.format.combine(
              winston.format.timestamp(),
              winston.format.errors({ stack: true }),
              winston.format.json()
            )
          : winston.format.combine(
              winston.format.colorize(),
              winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
              winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
                const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
                return `${timestamp} [${service}] ${level}: ${message} ${metaStr}`;
              })
            ),
      })
    );

    this.logger = winston.createLogger({
      level: config.level,
      transports,
      defaultMeta: { service: 'ai-task-escrow-indexer' },
      exitOnError: false,
    });
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  error(message: string, error?: Error | any): void {
    this.logger.error(message, error);
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  child(context: Record<string, any>): winston.Logger {
    return this.logger.child(context);
  }
}
