import express from 'express';
import unityService from '../services/unityService';
import { requireAuth } from '../middleware/auth';
import { validateUnityExport } from '../middleware/validation';

const router = express.Router();

// Export data for Unity
router.post('/export', requireAuth, validateUnityExport, async (req, res): Promise<void> => {
  try {
    const { userId, className, classData } = req.body;

    const exportResult = await unityService.exportProjectForUnity(userId, className, classData);

    res.json({
      success: true,
      unity_error_code: 'SUCCESS',
      export: exportResult,
      projectInfo: {
        userId,
        className,
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      },
      message: 'Unity export created successfully'
    });

  } catch (error: any) {
    console.error('Error exporting for Unity:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating Unity export',
      unity_error_code: 'EXPORT_FAILED',
      details: error.message
    });
  }
});

// Get Unity export data by file ID
router.get('/export/:fileId', requireAuth, async (req, res): Promise<void> => {
  try {
    const { fileId } = req.params;

    const exportData = await unityService.getUnityExport(fileId);

    res.json({
      success: true,
      unity_error_code: 'SUCCESS',
      export: exportData,
      message: 'Unity export data retrieved successfully'
    });

  } catch (error: any) {
    console.error('Error getting Unity export:', error);
    
    if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: 'Unity export file not found',
        unity_error_code: 'EXPORT_NOT_FOUND',
        details: error.message
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Error getting Unity export',
      unity_error_code: 'EXPORT_READ_FAILED',
      details: error.message
    });
  }
});

// List Unity exports for a project
router.get('/exports/:userId/:className', requireAuth, async (req, res): Promise<void> => {
  try {
    const { userId, className } = req.params;

    const unityExports = await unityService.listUnityExports(userId, className);

    res.json({
      success: true,
      unity_error_code: 'SUCCESS',
      exports: unityExports.map(file => ({
        fileId: file.id,
        fileName: file.name,
        downloadUrl: `https://drive.google.com/uc?id=${file.id}`,
        createdTime: file.createdTime,
        modifiedTime: file.modifiedTime,
        size: file.size
      })),
      count: unityExports.length,
      message: 'Unity exports listed successfully'
    });

  } catch (error: any) {
    console.error('Error listing Unity exports:', error);
    res.status(500).json({
      success: false,
      error: 'Error listing Unity exports',
      unity_error_code: 'LIST_FAILED',
      details: error.message
    });
  }
});

// Health check for Unity integration
router.get('/health', (req, res) => {
  const health = unityService.getUnityIntegrationStatus();
  
  res.json({
    success: true,
    unity_error_code: 'SUCCESS',
    health,
    message: 'Unity integration health check completed'
  });
});

export default router;