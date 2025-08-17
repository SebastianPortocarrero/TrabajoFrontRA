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
declare class DriveService {
    private folderCache;
    ensureInitialized(): Promise<void>;
    createFolder(name: string, parentId?: string | null): Promise<string>;
    findFolder(name: string, parentId?: string | null): Promise<string | null>;
    ensureFolder(name: string, parentId?: string | null): Promise<string>;
    createJsonFile(data: any, fileName: string, parentFolderId: string): Promise<string>;
    readJsonFile(fileId: string): Promise<any>;
    updateJsonFile(fileId: string, data: any): Promise<boolean>;
    uploadFile(buffer: Buffer, fileName: string, mimeType: string, parentFolderId: string): Promise<FileUploadResult>;
    listFiles(folderId: string): Promise<drive_v3.Schema$File[]>;
    findFile(name: string, parentId: string): Promise<drive_v3.Schema$File | null>;
    getStats(): DriveStats;
}
declare const _default: DriveService;
export default _default;
//# sourceMappingURL=driveService.d.ts.map