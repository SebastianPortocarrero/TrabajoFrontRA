import driveConfig from '../config/drive';
import { Readable } from 'stream';
import { drive_v3 } from 'googleapis';

interface FileUploadResult {
  fileId: string;
  name: string;
  url?: string;
}

interface DriveStats {
  initialized: boolean;
  rootFolderId: string | null;
}

class DriveService {
  private folderCache: Map<string, string> = new Map();

  async ensureInitialized(): Promise<void> {
    if (!driveConfig.isInitialized()) {
      await driveConfig.initialize();
    }
  }

  async createFolder(name: string, parentId: string | null = null): Promise<string> {
    await this.ensureInitialized();
    const drive = driveConfig.getDrive();
    
    const parentFolderId = parentId || driveConfig.getRootFolderId();
    
    try {
      const response = await drive.files.create({
        requestBody: {
          name: name,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentFolderId!]
        },
      });
      
      console.log(`📁 Created folder: ${name} (${response.data.id})`);
      return response.data.id!;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  }

  async findFolder(name: string, parentId: string | null = null): Promise<string | null> {
    await this.ensureInitialized();
    const drive = driveConfig.getDrive();
    
    const parentFolderId = parentId || driveConfig.getRootFolderId();
    
    try {
      const response = await drive.files.list({
        q: `name='${name}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
      });
      
      return response.data.files && response.data.files.length > 0 ? response.data.files[0].id! : null;
    } catch (error) {
      console.error('Error finding folder:', error);
      throw error;
    }
  }

  async ensureFolder(name: string, parentId: string | null = null): Promise<string> {
    const existingFolderId = await this.findFolder(name, parentId);
    if (existingFolderId) {
      return existingFolderId;
    }
    return await this.createFolder(name, parentId);
  }

  async createJsonFile(data: any, fileName: string, parentFolderId: string): Promise<string> {
    await this.ensureInitialized();
    const drive = driveConfig.getDrive();
    
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const buffer = Buffer.from(jsonString, 'utf8');
      const stream = Readable.from(buffer);

      const response = await drive.files.create({
        requestBody: {
          name: fileName,
          parents: [parentFolderId]
        },
        media: {
          mimeType: 'application/json',
          body: stream
        },
        fields: 'id'
      });

      return response.data.id!;
    } catch (error) {
      console.error('Error creating JSON file:', error);
      throw error;
    }
  }

  async readJsonFile(fileId: string): Promise<any> {
    await this.ensureInitialized();
    const drive = driveConfig.getDrive();
    
    try {
      const response = await drive.files.get({
        fileId: fileId,
        alt: 'media'
      });

      return JSON.parse(response.data as string);
    } catch (error) {
      console.error('Error reading JSON file:', error);
      throw error;
    }
  }

  async updateJsonFile(fileId: string, data: any): Promise<boolean> {
    await this.ensureInitialized();
    const drive = driveConfig.getDrive();
    
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const buffer = Buffer.from(jsonString, 'utf8');
      const stream = Readable.from(buffer);

      await drive.files.update({
        fileId: fileId,
        media: {
          mimeType: 'application/json',
          body: stream
        }
      });

      return true;
    } catch (error) {
      console.error('Error updating JSON file:', error);
      throw error;
    }
  }

  async uploadFile(buffer: Buffer, fileName: string, mimeType: string, parentFolderId: string): Promise<FileUploadResult> {
    await this.ensureInitialized();
    const drive = driveConfig.getDrive();
    
    try {
      const stream = Readable.from(buffer);

      const response = await drive.files.create({
        requestBody: {
          name: fileName,
          parents: [parentFolderId]
        },
        media: {
          mimeType: mimeType,
          body: stream
        },
        fields: 'id, name, webViewLink'
      });

      return {
        fileId: response.data.id!,
        name: response.data.name!,
        url: response.data.webViewLink || undefined
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async listFiles(folderId: string): Promise<drive_v3.Schema$File[]> {
    await this.ensureInitialized();
    const drive = driveConfig.getDrive();
    
    try {
      const response = await drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id, name, mimeType, size, createdTime, modifiedTime, thumbnailLink)',
      });

      return response.data.files || [];
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }

  async findFile(name: string, parentId: string): Promise<drive_v3.Schema$File | null> {
    await this.ensureInitialized();
    const drive = driveConfig.getDrive();
    
    try {
      const response = await drive.files.list({
        q: `name='${name}' and '${parentId}' in parents and trashed=false`,
        fields: 'files(id, name)',
      });
      
      return response.data.files && response.data.files.length > 0 ? response.data.files[0] : null;
    } catch (error) {
      console.error('Error finding file:', error);
      throw error;
    }
  }

  getStats(): DriveStats {
    return driveConfig.getStats();
  }
}

export default new DriveService();