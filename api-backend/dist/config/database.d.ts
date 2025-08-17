import { Pool } from 'pg';
declare class DatabaseConfig {
    private pool;
    initialize(): Promise<void>;
    getPool(): Pool | null;
    close(): Promise<void>;
}
declare const _default: DatabaseConfig;
export default _default;
//# sourceMappingURL=database.d.ts.map