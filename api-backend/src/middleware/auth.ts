import { Request, Response, NextFunction } from 'express';
import { getAuth } from '../config/auth';

// Extend Express Request type to include user and session
declare global {
  namespace Express {
    interface Request {
      user?: any;
      session?: any;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const auth = await getAuth();
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Missing or invalid authorization header'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify session with Better Auth
    const session = await auth.api.getSession({
      headers: req.headers as any
    });

    if (!session || !session.user) {
      res.status(401).json({
        success: false,
        error: 'Invalid session',
        message: 'Session expired or invalid'
      });
      return;
    }

    // Add user info to request
    req.user = session.user;
    req.session = session;
    
    next();
  } catch (error: any) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: error.message
    });
  }
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const auth = await getAuth();
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const session = await auth.api.getSession({
        headers: req.headers as any
      });

      if (session && session.user) {
        req.user = session.user;
        req.session = session;
      }
    }
    
    next();
  } catch (error: any) {
    // Don't fail on optional auth errors, just log them
    console.warn('Optional auth error:', error);
    next();
  }
}

export function requireRole(roles: string | string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const userRole = req.user.role || 'user';
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: `Required roles: ${allowedRoles.join(', ')}`
      });
      return;
    }

    next();
  };
}