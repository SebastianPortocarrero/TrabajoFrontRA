import { Request, Response, NextFunction } from 'express';
interface CustomError extends Error {
    code?: string;
}
export declare function errorHandler(error: CustomError, req: Request, res: Response, next: NextFunction): void;
export declare function notFoundHandler(req: Request, res: Response): void;
export {};
//# sourceMappingURL=errorHandler.d.ts.map