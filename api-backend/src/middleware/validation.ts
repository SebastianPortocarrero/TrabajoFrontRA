import { Request, Response, NextFunction } from 'express';

export function validateCreateProject(req: Request, res: Response, next: NextFunction): void {
  const { userId, className } = req.body;

  if (!userId || typeof userId !== 'string') {
    res.status(400).json({
      success: false,
      error: 'userId is required and must be a string'
    });
    return;
  }

  if (!className || typeof className !== 'string') {
    res.status(400).json({
      success: false,
      error: 'className is required and must be a string'
    });
    return;
  }

  next();
}

export function validateProjectParams(req: Request, res: Response, next: NextFunction): void {
  const { userId, className } = req.params;

  if (!userId || typeof userId !== 'string') {
    res.status(400).json({
      success: false,
      error: 'userId parameter is required'
    });
    return;
  }

  if (!className || typeof className !== 'string') {
    res.status(400).json({
      success: false,
      error: 'className parameter is required'
    });
    return;
  }

  next();
}

export function validateFileUpload(req: Request, res: Response, next: NextFunction): void {
  if (!req.file) {
    res.status(400).json({
      success: false,
      error: 'No file provided'
    });
    return;
  }

  const { targetFolderId } = req.body;
  
  if (!targetFolderId) {
    res.status(400).json({
      success: false,
      error: 'targetFolderId is required'
    });
    return;
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024;
  if (req.file.size > maxSize) {
    res.status(400).json({
      success: false,
      error: 'File too large. Maximum size is 10MB'
    });
    return;
  }

  next();
}

export function validateUnityExport(req: Request, res: Response, next: NextFunction): void {
  const { userId, className, classData } = req.body;

  if (!userId || !className || !classData) {
    res.status(400).json({
      success: false,
      error: 'userId, className and classData are required',
      unity_error_code: 'MISSING_PARAMETERS'
    });
    return;
  }

  if (!classData.markerObjects || !Array.isArray(classData.markerObjects)) {
    res.status(400).json({
      success: false,
      error: 'classData.markerObjects must be an array',
      unity_error_code: 'INVALID_MARKER_DATA'
    });
    return;
  }

  next();
}