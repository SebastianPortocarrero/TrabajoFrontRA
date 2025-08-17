import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  code?: string;
}

export function errorHandler(error: CustomError, req: Request, res: Response, next: NextFunction): void {
  console.error('Error:', error);

  // Handle specific error types
  if (error.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (error.name === 'UnauthorizedError') {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Authentication required',
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    res.status(503).json({
      success: false,
      error: 'Service Unavailable',
      message: 'External service temporarily unavailable',
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Default server error
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : error.message,
    timestamp: new Date().toISOString()
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
    available_endpoints: [
      'GET /',
      'GET /health',
      'POST /api/auth/*',
      'POST /api/system/initialize',
      'GET /api/system/status',
      'POST /api/projects/create',
      'GET /api/projects/:userId',
      'GET /api/projects/:userId/:className',
      'PUT /api/projects/:userId/:className',
      'POST /api/files/upload',
      'GET /api/unity/health',
      'GET /api/unity/projects/:userId',
      'GET /api/unity/project/:userId/:className',
      'GET /api/unity/assets/:userId/:className',
      'POST /api/unity/export'
    ],
    timestamp: new Date().toISOString()
  });
}