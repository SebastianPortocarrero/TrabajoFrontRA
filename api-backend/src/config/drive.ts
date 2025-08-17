import { google } from 'googleapis';
import { drive_v3 } from 'googleapis';
import path from 'path';

class DriveConfig {
  private drive: drive_v3.Drive | null = null;
  private rootFolderId: string | null = null;
  private initialized: boolean = false;

  async initialize(): Promise<void> {
    try {
      console.log('🔄 Initializing Google Drive connection...');
      
      // Check if credentials file exists
      const keyFilePath = path.join(__dirname, '../../google-drive-key.json');
      console.log(`📂 Looking for credentials at: ${keyFilePath}`);

      const auth = new google.auth.GoogleAuth({
        keyFile: keyFilePath,
        scopes: ['https://www.googleapis.com/auth/drive'],
      });

      console.log('🔐 Getting auth client...');
      const authClient = await auth.getClient();
      
      console.log('🚗 Creating drive instance...');
      this.drive = google.drive({ version: 'v3', auth: authClient as any });
      
      // Set root folder ID from environment or use default
      this.rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER || '11NtPDoJZ8-v8dnpN-79rgqGJefV_PXoY';
      
      this.initialized = true;
      console.log('✅ Google Drive initialized');
      console.log(`📁 Root folder ID: ${this.rootFolderId}`);
      
    } catch (error) {
      console.error('❌ Error initializing Google Drive:', error);
      throw error;
    }
  }

  getDrive(): drive_v3.Drive {
    if (!this.initialized || !this.drive) {
      throw new Error('Drive not initialized. Call initialize() first.');
    }
    return this.drive;
  }

  getRootFolderId(): string | null {
    return this.rootFolderId;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getStats(): { initialized: boolean; rootFolderId: string | null } {
    return {
      initialized: this.initialized,
      rootFolderId: this.rootFolderId
    };
  }
}

export default new DriveConfig();