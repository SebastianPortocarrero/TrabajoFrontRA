export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    details?: any;
}
export interface PaginatedResponse<T = any> extends ApiResponse<T> {
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface UserProfile {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateUserData {
    email: string;
    name?: string;
    image?: string;
    role?: string;
}
export interface UpdateUserData {
    name?: string;
    image?: string;
    role?: string;
}
export interface ProjectData {
    userId: string;
    className: string;
    createdAt: string;
    lastModified: string;
    markerObjects: MarkerObject[];
    settings: ProjectSettings;
}
export interface MarkerObject {
    id: string;
    name: string;
    type: 'image' | 'object' | 'location';
    imageId?: string;
    modelId?: string;
    position: {
        x: number;
        y: number;
        z: number;
    };
    rotation: {
        x: number;
        y: number;
        z: number;
    };
    scale: {
        x: number;
        y: number;
        z: number;
    };
    properties: Record<string, any>;
}
export interface ProjectSettings {
    arEnabled: boolean;
    trackingMode: 'image' | 'location' | 'plane';
    exportFormat: 'unity' | 'ar-foundation' | 'vuforia';
    quality: 'low' | 'medium' | 'high';
    optimizations: {
        compression: boolean;
        levelOfDetail: boolean;
        batching: boolean;
    };
}
export interface ProjectInfo {
    id: string;
    name: string;
    createdTime?: string;
    modifiedTime?: string;
    size?: number;
    markerCount?: number;
}
export interface FileUpload {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
}
export interface FileUploadResult {
    fileId: string;
    name: string;
    url?: string;
    size: number;
    mimeType: string;
}
export interface UnityExportRequest {
    projectId: string;
    format: 'package' | 'scene' | 'assets';
    options: {
        includeModels: boolean;
        includeTextures: boolean;
        includeScripts: boolean;
        optimizeForMobile: boolean;
    };
}
export interface UnityExportResult {
    downloadUrl: string;
    fileSize: number;
    expiresAt: string;
    format: string;
}
export interface SessionData {
    id: string;
    userId: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
}
export interface AuthUser {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: string;
    emailVerified: boolean;
}
export interface ServiceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    code?: string;
}
export interface DatabaseStats {
    connected: boolean;
    tablesCount?: number;
    lastBackup?: string;
}
export interface DriveStats {
    initialized: boolean;
    rootFolderId: string | null;
    totalFiles?: number;
    totalSize?: number;
}
export interface SystemStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: {
        database: DatabaseStats;
        drive: DriveStats;
        auth: {
            enabled: boolean;
            provider: string;
        };
    };
    version: string;
    uptime: number;
    timestamp: string;
}
export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}
export interface CustomError extends Error {
    code?: string;
    statusCode?: number;
    details?: any;
}
export interface AuthenticatedRequest extends Express.Request {
    user: AuthUser;
    session: SessionData;
}
export interface DatabaseConfig {
    url: string;
    ssl: boolean;
    poolSize?: number;
}
export interface AuthConfig {
    secret: string;
    baseURL: string;
    sessionDuration: number;
    trustedOrigins: string[];
}
export interface DriveConfig {
    rootFolderId: string;
    keyFilePath: string;
    scopes: string[];
}
export interface AppConfig {
    port: number;
    environment: 'development' | 'production' | 'test';
    database: DatabaseConfig;
    auth: AuthConfig;
    drive: DriveConfig;
    frontendUrl: string;
}
//# sourceMappingURL=index.d.ts.map