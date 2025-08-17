import { Application } from 'express';
declare class App {
    private app;
    private initialized;
    constructor();
    private setupMiddleware;
    private setupRoutes;
    private setupErrorHandling;
    initialize(): Promise<void>;
    getApp(): Application;
    close(): Promise<void>;
}
export default App;
//# sourceMappingURL=app.d.ts.map