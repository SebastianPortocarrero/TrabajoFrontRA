import { Pool } from 'pg';

class DatabaseConfig {
  private pool: Pool | null = null;

  async initialize(): Promise<void> {
    try {
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL || process.env.CONNECTION_STRING,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });

      this.pool.on('connect', () => {
        console.log('✅ Connected to PostgreSQL database');
      });

      this.pool.on('error', (err: Error) => {
        console.error('❌ PostgreSQL connection error:', err);
      });

      // Test connection
      await this.pool.query('SELECT NOW()');
      console.log('✅ Database connection tested successfully');
      
    } catch (error) {
      console.error('❌ Failed to connect to database:', error);
      throw error;
    }
  }

  getPool(): Pool | null {
    return this.pool;
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      console.log('🔒 Database connection closed');
    }
  }
}

export default new DatabaseConfig();