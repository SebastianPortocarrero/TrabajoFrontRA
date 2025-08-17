interface MarkerObject {
    id?: string;
    name?: string;
    position?: {
        x: number;
        y: number;
        z: number;
    };
    rotation?: {
        x: number;
        y: number;
        z: number;
    };
    scale?: {
        x: number;
        y: number;
        z: number;
    };
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
declare class UnityServiceStub {
    exportProject(userId: string, className: string, options?: ExportOptions): Promise<ExportResult>;
    getExportStatus(exportId: string): Promise<{
        status: string;
        progress?: number;
        downloadUrl?: string;
    }>;
    uploadMarkerImages(userId: string, className: string, images: Express.Multer.File[]): Promise<{
        uploadedImages: string[];
    }>;
    updateMarkerObjects(userId: string, className: string, markerObjects: MarkerObject[]): Promise<void>;
    getMarkerObjects(userId: string, className: string): Promise<MarkerObject[]>;
    generateUnityScript(userId: string, className: string): Promise<{
        scriptContent: string;
        fileName: string;
    }>;
    validateExportData(userId: string, className: string): Promise<{
        isValid: boolean;
        missingAssets?: string[];
    }>;
    exportProjectForUnity(userId: string, className: string, options?: ExportOptions): Promise<ExportResult>;
    getUnityExport(exportId: string): Promise<ExportResult>;
    listUnityExports(userId: string, className: string): Promise<ExportResult[]>;
    getUnityIntegrationStatus(): Promise<{
        status: string;
        integrationData?: any;
    }>;
}
declare const _default: UnityServiceStub;
export default _default;
//# sourceMappingURL=unityService.d.ts.map