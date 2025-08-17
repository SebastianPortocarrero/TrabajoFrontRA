import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';

// Import configurations
// import driveConfig from './config/drive'; // Temporarily disabled due to googleapis import issue
import databaseConfig from './config/database';
import { initializeAuth } from './config/auth';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import unityRoutes from './routes/unity';
import fileRoutes from './routes/files';
import userRoutes from './routes/users';

interface AppStats {
  initialized: boolean;
  drive?: any;
  database?: any;
  auth?: boolean;
}

class App {
  private app: Application;
  private initialized: boolean = false;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // CORS configuration
    this.app.use(cors({
      origin: [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:3003",
        ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
      ],
      credentials: true
    }));

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      this.app.use((req: Request, res: Response, next: NextFunction) => {
        console.log(`${req.method} ${req.path}`);
        next();
      });
    }
  }

  private setupRoutes(): void {
    // Basic route
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        message: 'AR Education Platform API',
        version: '3.0.0-typescript',
        storage: 'Google Drive + PostgreSQL',
        auth: 'Better Auth (TypeScript)',
        status: 'running',
        initialized: this.initialized
      });
    });

    // Health endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      try {
        // const driveStats = driveConfig.getStats(); // Temporarily disabled
        
        res.json({
          status: 'healthy',
          services: {
            drive: false, // driveStats.initialized, // Temporarily disabled
            database: !!databaseConfig.getPool(),
            auth: true
          },
          timestamp: new Date().toISOString()
        });

      } catch (error: any) {
        res.status(500).json({
          status: 'unhealthy',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Test endpoint for debugging
    this.app.post('/test-auth', express.json(), (req: Request, res: Response) => {
      console.log('🔍 Test auth endpoint hit');
      console.log('🔍 Request body:', req.body);
      res.json({
        success: true,
        message: 'Test endpoint working',
        receivedData: req.body
      });
    });

    // Initialize system
    this.app.post('/api/system/initialize', async (req: Request, res: Response) => {
      try {
        await this.initialize();
        
        res.json({
          success: true,
          message: 'System initialized successfully',
          initialized: {
            drive: { initialized: false }, // driveConfig.getStats(), // Temporarily disabled
            database: !!databaseConfig.getPool(),
            auth: true
          }
        });

      } catch (error: any) {
        console.error('❌ Error initializing system:', error);
        res.status(500).json({
          success: false,
          error: 'Error initializing system',
          details: error.message
        });
      }
    });

    // System status
    this.app.get('/api/system/status', (req: Request, res: Response) => {
      try {
        // const driveStats = driveConfig.getStats(); // Temporarily disabled
        
        res.json({
          success: true,
          system: {
            status: 'running',
            storage: 'PostgreSQL', // Updated since Drive is temporarily disabled
            auth: 'Better Auth (TypeScript)',
            services: {
              drive: { initialized: false }, // driveStats, // Temporarily disabled
              database: { connected: !!databaseConfig.getPool() },
              auth: { enabled: true }
            },
            version: '3.0.0-typescript',
            timestamp: new Date().toISOString()
          }
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Middleware to check initialization for protected routes
    const checkInitialized = (req: Request, res: Response, next: NextFunction): void => {
      if (!this.initialized) {
        res.status(503).json({
          success: false,
          error: 'System not initialized',
          message: 'Call POST /api/system/initialize first'
        });
        return;
      }
      next();
    };

    // API Routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', checkInitialized, userRoutes);
    this.app.use('/api/projects', checkInitialized, projectRoutes);
    this.app.use('/api/unity', checkInitialized, unityRoutes);
    this.app.use('/api/files', checkInitialized, fileRoutes);

    // Legacy compatibility endpoints
    this.app.get('/test-drive', async (req: Request, res: Response) => {
      try {
        const { google } = require('googleapis');
        const path = require('path');
        
        const auth = new google.auth.GoogleAuth({
          keyFile: path.join(__dirname, '../google-drive-key.json'),
          scopes: ['https://www.googleapis.com/auth/drive'],
        });

        const authClient = await auth.getClient();
        const drive = google.drive({ version: 'v3', auth: authClient });
        
        const response = await drive.files.list({
          pageSize: 1,
          fields: 'files(id, name)',
        });
        
        res.json({
          success: true,
          message: 'Drive connection working',
          filesFound: response.data.files.length,
          timestamp: new Date().toISOString()
        });
        
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  private setupErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  public async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing AR Education Platform API (TypeScript)...');

      // Initialize database
      if (!databaseConfig.getPool()) {
        console.log('🔄 Initializing database...');
        await databaseConfig.initialize();
        console.log('✅ Database initialized');
      }

      // Initialize auth
      console.log('🔄 Initializing authentication...');
      await initializeAuth();
      console.log('✅ Authentication initialized');

      // Initialize drive - temporarily disabled due to googleapis import issue
      // if (!driveConfig.isInitialized()) {
      //   console.log('🔄 Initializing Google Drive...');
      //   await driveConfig.initialize();
      //   console.log('✅ Google Drive initialized');
      // }
      console.log('⚠️ Google Drive initialization temporarily disabled');

      this.initialized = true;
      console.log('✅ System fully initialized');

    } catch (error) {
      console.error('❌ Initialization failed:', error);
      throw error;
    }
  }

  public getApp(): Application {
    return this.app;
  }

  public async close(): Promise<void> {
    try {
      await databaseConfig.close();
      console.log('🔒 Application closed gracefully');
    } catch (error) {
      console.error('Error closing application:', error);
    }
  }
}

export default App;