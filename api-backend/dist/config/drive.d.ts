import { drive_v3 } from 'googleapis';
declare class DriveConfig {
    private drive;
    private rootFolderId;
    private initialized;
    initialize(): Promise<void>;
    getDrive(): drive_v3.Drive;
    getRootFolderId(): string | null;
    isInitialized(): boolean;
    getStats(): {
        initialized: boolean;
        rootFolderId: string | null;
    };
}
declare const _default: DriveConfig;
export default _default;
//# sourceMappingURL=drive.d.ts.map