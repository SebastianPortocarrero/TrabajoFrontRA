import 'dotenv/config';
import App from './app';

const PORT = process.env.PORT || 3002;

async function startServer() {
  try {
    // Create and configure the application
    const appInstance = new App();
    const app = appInstance.getApp();

    // Graceful shutdown handlers
    const shutdown = async (signal: string) => {
      console.log(`🛑 ${signal} received. Shutting down gracefully...`);
      try {
        await appInstance.close();
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      console.error('💥 Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`🚀 AR Education Platform API running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️ Storage: Google Drive + PostgreSQL (Neon)`);
      console.log(`🔐 Authentication: Better Auth (TypeScript)`);
      console.log(`✅ Server started - Ready to initialize services`);
      console.log(`🔗 Endpoints:`);
      console.log(`   GET  http://localhost:${PORT}/`);
      console.log(`   GET  http://localhost:${PORT}/health`);
      console.log(`   POST http://localhost:${PORT}/api/system/initialize`);
    });

    return { app, server, appInstance };
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer().catch((error) => {
  console.error('❌ Server startup failed:', error);
  process.exit(1);
});