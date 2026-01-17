import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './config';
import { connectToDatabase } from './infrastructure/database/mongodb';
import { kafkaProducer } from './infrastructure/messaging/KafkaProducer';
import activityRoutes from './interfaces/http/routes/activityRoutes';
import { errorHandler } from './interfaces/http/middlewares/errorHandler';

class Server {
  private app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = config.server.port;
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security headers
    this.app.use(helmet());

    // CORS
    this.app.use(
      cors({
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true,
      })
    );

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use((req: Request, _res: Response, next: NextFunction) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  private initializeRoutes(): void {
    // Health check
    this.app.get('/health', (_req: Request, res: Response) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'event-driven-microservice',
        version: config.server.apiVersion,
        kafka: kafkaProducer.isProducerConnected()
          ? 'connected'
          : 'disconnected',
      });
    });

    // API routes
    this.app.use(
      `/api/${config.server.apiVersion}/activities`,
      activityRoutes
    );

    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Connect to MongoDB
      await connectToDatabase();
      console.log('✅ Connected to MongoDB');

      // Connect Kafka Producer (optional)
      try {
        await kafkaProducer.connect();
        console.log('✅ Kafka Producer connected');
      } catch {
        console.warn(
          '⚠️  Kafka Producer not connected (running without Kafka)'
        );
      }

      // Start HTTP server
      this.app.listen(this.port, () => {
        console.log(`🚀 Server is running on port ${this.port}`);
        console.log(`📝 Environment: ${config.server.nodeEnv}`);
        console.log(
          `🔗 Health check: http://localhost:${this.port}/health`
        );
        console.log(
          `🔗 API Base: http://localhost:${this.port}/api/${config.server.apiVersion}`
        );
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  public getApp(): Application {
    return this.app;
  }
}

// Bootstrap
const server = new Server();
server.start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: shutting down');
  await kafkaProducer.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: shutting down');
  await kafkaProducer.disconnect();
  process.exit(0);
});

export default server;
