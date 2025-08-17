// Temporary stub for unityService while googleapis issue is resolved

interface MarkerObject {
  id?: string;
  name?: string;
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
  type?: string;
  prefabPath?: string;
  assetPath?: string;
}

interface ExportOptions {
  includeMarkers?: boolean;
  includeImages?: boolean;
  exportFormat?: 'unitypackage' | 'zip';
  compressionLevel?: number;
}

interface ExportResult {
  exportId: string;
  fileName: string;
  downloadUrl?: string;
  fileSize?: number;
  id?: string;
  name?: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: number;
}

class UnityServiceStub {
  async exportProject(userId: string, className: string, options: ExportOptions = {}): Promise<ExportResult> {
    throw new Error('Unity service temporarily disabled - googleapis import issue');
  }

  async getExportStatus(exportId: string): Promise<{ status: string; progress?: number; downloadUrl?: string }> {
    throw new Error('Unity service temporarily disabled - googleapis import issue');
  }

  async uploadMarkerImages(userId: string, className: string, images: Express.Multer.File[]): Promise<{ uploadedImages: string[] }> {
    throw new Error('Unity service temporarily disabled - googleapis import issue');
  }

  async updateMarkerObjects(userId: string, className: string, markerObjects: MarkerObject[]): Promise<void> {
    throw new Error('Unity service temporarily disabled - googleapis import issue');
  }

  async getMarkerObjects(userId: string, className: string): Promise<MarkerObject[]> {
    throw new Error('Unity service temporarily disabled - googleapis import issue');
  }

  async generateUnityScript(userId: string, className: string): Promise<{ scriptContent: string; fileName: string }> {
    throw new Error('Unity service temporarily disabled - googleapis import issue');
  }

  async validateExportData(userId: string, className: string): Promise<{ isValid: boolean; missingAssets?: string[] }> {
    throw new Error('Unity service temporarily disabled - googleapis import issue');
  }

  async exportProjectForUnity(userId: string, className: string, options: ExportOptions = {}): Promise<ExportResult> {
    throw new Error('Unity service temporarily disabled - googleapis import issue');
  }

  async getUnityExport(exportId: string): Promise<ExportResult> {
    throw new Error('Unity service temporarily disabled - googleapis import issue');
  }

  async listUnityExports(userId: string, className: string): Promise<ExportResult[]> {
    throw new Error('Unity service temporarily disabled - googleapis import issue');
  }

  async getUnityIntegrationStatus(): Promise<{ status: string; integrationData?: any }> {
    throw new Error('Unity service temporarily disabled - googleapis import issue');
  }
}

export default new UnityServiceStub();