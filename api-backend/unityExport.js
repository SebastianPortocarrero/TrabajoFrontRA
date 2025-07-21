const express = require('express');
const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const googleDrive = require('./googleDrive');

const router = express.Router();

// Unity Export Configuration defaults
const DEFAULT_UNITY_CONFIG = {
  targetUnityVersion: '2023.3.x',
  arFoundationVersion: '5.1.x',
  coordinateSystem: 'world',
  scaleFactor: 1.0,
  performanceProfile: 'mobile'
};

// Unity version compatibility matrix
const UNITY_VERSION_COMPATIBILITY = {
  '2023.3.x': { arFoundation: ['5.1.x', '5.0.x'], supported: true },
  '2022.3.x': { arFoundation: ['5.0.x', '4.2.x'], supported: true },
  '2021.3.x': { arFoundation: ['4.2.x', '4.1.x'], supported: true }
};

/**
 * Validate Unity export configuration and content
 */
function validateUnityExport(contents, template, config = {}) {
  const validation = {
    isValid: true,
    arFoundationCompatible: true,
    performanceScore: 100,
    warnings: [],
    errors: []
  };

  // Unity version compatibility check
  const unityConfig = { ...DEFAULT_UNITY_CONFIG, ...config };
  const versionSupport = UNITY_VERSION_COMPATIBILITY[unityConfig.targetUnityVersion];
  
  if (!versionSupport || !versionSupport.supported) {
    validation.errors.push({
      type: 'compatibility',
      message: `Unity version ${unityConfig.targetUnityVersion} is not supported`
    });
    validation.isValid = false;
  }

  // AR Foundation compatibility
  if (versionSupport && !versionSupport.arFoundation.includes(unityConfig.arFoundationVersion)) {
    validation.errors.push({
      type: 'compatibility',
      message: `AR Foundation ${unityConfig.arFoundationVersion} is not compatible with Unity ${unityConfig.targetUnityVersion}`
    });
    validation.arFoundationCompatible = false;
    validation.isValid = false;
  }

  // Content validation
  if (!contents || contents.length === 0) {
    validation.errors.push({
      type: 'content',
      message: 'No content items provided for export'
    });
    validation.isValid = false;
  }

  // Performance analysis
  let performanceScore = 100;
  let contentComplexity = 0;

  contents.forEach(content => {
    // Analyze content complexity
    switch (content.type) {
      case '3d-model':
        contentComplexity += 15;
        break;
      case 'video':
        contentComplexity += 10;
        break;
      case 'image':
        contentComplexity += 5;
        break;
      case 'audio':
        contentComplexity += 3;
        break;
      default:
        contentComplexity += 1;
    }
  });

  performanceScore -= Math.min(contentComplexity, 50);

  // Scale factor validation
  if (unityConfig.scaleFactor <= 0 || unityConfig.scaleFactor > 5) {
    validation.warnings.push({
      type: 'performance',
      message: 'Scale factor outside recommended range (0.1 - 5.0)'
    });
    performanceScore -= 5;
  }

  // Content density check
  if (contents.length > 20) {
    validation.warnings.push({
      type: 'performance',
      message: 'High content density may impact mobile performance'
    });
    performanceScore -= 10;
  }

  validation.performanceScore = Math.max(performanceScore, 0);

  if (performanceScore < 60) {
    validation.warnings.push({
      type: 'performance',
      message: 'Low performance score detected - consider optimizing content'
    });
  }

  return validation;
}

/**
 * Generate enhanced Unity JSON data
 */
function generateEnhancedUnityData(contents, template, config = {}) {
  const exportId = uuidv4();
  const unityConfig = { ...DEFAULT_UNITY_CONFIG, ...config };
  
  const unityData = {
    markerId: template?.id || `marker_${Date.now()}`,
    version: '2.0',
    unityExportConfig: {
      targetVersion: unityConfig.targetUnityVersion,
      arFoundationVersion: unityConfig.arFoundationVersion,
      coordinateSystem: unityConfig.coordinateSystem,
      scaleFactor: unityConfig.scaleFactor,
      performanceProfile: unityConfig.performanceProfile
    },
    layout: {
      mode: template ? 'template' : 'freeform',
      templateId: template?.id,
      worldScale: unityConfig.scaleFactor,
      contents: contents.map((content, index) => {
        const slotPosition = template?.slots?.[index]?.position || { x: 0, y: 0, z: 0 };
        
        return {
          id: content.id,
          type: content.type,
          slotId: template?.slots?.[index]?.id || `slot_${index}`,
          unityPosition: {
            x: slotPosition.x * unityConfig.scaleFactor,
            y: slotPosition.y * unityConfig.scaleFactor,
            z: slotPosition.z * unityConfig.scaleFactor
          },
          unityScale: { x: 1.0, y: 1.0, z: 1.0 },
          data: {
            title: content.title || content.value,
            action: content.type === 'button' ? 'interact' : 'display'
          },
          assets: content.assets ? {
            main: {
              googleDriveId: content.assets.main,
              unityPath: `Assets/AR_Content/${content.type}/${content.id}.${getAssetExtension(content.type)}`,
              format: getAssetFormat(content.type),
              optimized: true
            }
          } : {},
          performance: {
            complexity: getContentComplexity(content.type),
            renderCost: calculateRenderCost(content.type),
            recommendations: getOptimizationRecommendations(content.type)
          }
        };
      })
    },
    exportMetadata: {
      exportId,
      timestamp: new Date().toISOString(),
      exportedBy: 'unity_export_api',
      validationPassed: true
    }
  };

  return unityData;
}

/**
 * Helper functions
 */
function getAssetExtension(contentType) {
  const extensions = {
    'image': 'png',
    'video': 'mp4',
    'audio': 'mp3',
    '3d-model': 'fbx',
    'button': 'png'
  };
  return extensions[contentType] || 'asset';
}

function getAssetFormat(contentType) {
  const formats = {
    'image': 'PNG',
    'video': 'MP4',
    'audio': 'MP3',
    '3d-model': 'FBX',
    'button': 'PNG'
  };
  return formats[contentType] || 'BINARY';
}

function getContentComplexity(contentType) {
  const complexity = {
    'text': 'low',
    'button': 'low',
    'image': 'medium',
    'audio': 'medium',
    'video': 'high',
    '3d-model': 'very-high'
  };
  return complexity[contentType] || 'medium';
}

function calculateRenderCost(contentType) {
  const costs = {
    'text': 0.1,
    'button': 0.2,
    'image': 0.3,
    'audio': 0.2,
    'video': 0.8,
    '3d-model': 1.0
  };
  return costs[contentType] || 0.3;
}

function getOptimizationRecommendations(contentType) {
  const recommendations = {
    'video': ['Use H.264 compression', 'Limit resolution to 1080p', 'Consider streaming for long videos'],
    'image': ['Use compressed textures', 'Optimize resolution for mobile', 'Use ASTC format when possible'],
    '3d-model': ['Reduce polygon count', 'Use LOD system', 'Optimize texture sizes', 'Consider occlusion culling'],
    'audio': ['Use compressed audio formats', 'Limit sample rate to 44.1kHz', 'Use spatial audio for immersion']
  };
  return recommendations[contentType] || [];
}

// API Endpoints

/**
 * POST /api/unity/export/single
 * Export single template or content set
 */
router.post('/export/single', async (req, res) => {
  try {
    const { contents, template, config } = req.body;

    if (!contents || !Array.isArray(contents)) {
      return res.status(400).json({ error: 'Contents array is required' });
    }

    // Validate export
    const validation = validateUnityExport(contents, template, config);
    
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Export validation failed',
        validation 
      });
    }

    // Generate Unity data
    const unityData = generateEnhancedUnityData(contents, template, config);
    const exportId = unityData.exportMetadata.exportId;

    // Create export file
    const exportFileName = `unity_export_${exportId}.json`;
    const exportPath = path.join(__dirname, 'exports', exportFileName);
    
    // Ensure exports directory exists
    await fs.mkdir(path.dirname(exportPath), { recursive: true });
    
    // Write export file
    await fs.writeFile(exportPath, JSON.stringify(unityData, null, 2));

    // Upload to Google Drive (optional)
    let driveFileId = null;
    try {
      const drive = googleDrive.getDriveService();
      if (drive) {
        const driveResult = await googleDrive.uploadFile(
          exportFileName,
          JSON.stringify(unityData, null, 2),
          'application/json'
        );
        driveFileId = driveResult.id;
      }
    } catch (driveError) {
      console.warn('Google Drive upload failed:', driveError.message);
    }

    const result = {
      exportId,
      success: true,
      unityJsonData: unityData,
      validation,
      exportPath: driveFileId ? `https://drive.google.com/file/d/${driveFileId}/view` : exportPath,
      metadata: {
        exportedAt: new Date().toISOString(),
        templateCount: template ? 1 : 0,
        contentCount: contents.length,
        estimatedSize: `${(JSON.stringify(unityData).length / 1024).toFixed(1)}KB`
      }
    };

    res.json(result);
  } catch (error) {
    console.error('Unity export error:', error);
    res.status(500).json({ error: 'Internal server error during export' });
  }
});

/**
 * POST /api/unity/export/batch
 * Export multiple templates/content sets
 */
router.post('/export/batch', async (req, res) => {
  try {
    const { batchItems, config } = req.body;

    if (!batchItems || !Array.isArray(batchItems)) {
      return res.status(400).json({ error: 'Batch items array is required' });
    }

    const batchId = uuidv4();
    const results = [];

    for (let i = 0; i < batchItems.length; i++) {
      const item = batchItems[i];
      
      try {
        const validation = validateUnityExport(item.contents, item.template, { ...config, ...item.config });
        
        if (validation.isValid) {
          const unityData = generateEnhancedUnityData(item.contents, item.template, { ...config, ...item.config });
          const exportId = unityData.exportMetadata.exportId;
          
          // Create batch export file
          const exportFileName = `batch_${batchId}_item_${i + 1}_${exportId}.json`;
          const exportPath = path.join(__dirname, 'exports', 'batch', batchId, exportFileName);
          
          await fs.mkdir(path.dirname(exportPath), { recursive: true });
          await fs.writeFile(exportPath, JSON.stringify(unityData, null, 2));

          results.push({
            itemIndex: i,
            exportId,
            success: true,
            unityJsonData: unityData,
            validation,
            exportPath
          });
        } else {
          results.push({
            itemIndex: i,
            success: false,
            validation,
            errors: validation.errors
          });
        }
      } catch (itemError) {
        results.push({
          itemIndex: i,
          success: false,
          error: itemError.message
        });
      }
    }

    const batchResult = {
      batchId,
      totalItems: batchItems.length,
      successCount: results.filter(r => r.success).length,
      failureCount: results.filter(r => !r.success).length,
      results,
      metadata: {
        exportedAt: new Date().toISOString(),
        batchPath: path.join(__dirname, 'exports', 'batch', batchId)
      }
    };

    res.json(batchResult);
  } catch (error) {
    console.error('Batch export error:', error);
    res.status(500).json({ error: 'Internal server error during batch export' });
  }
});

/**
 * POST /api/unity/validate
 * Validate Unity export without generating files
 */
router.post('/validate', async (req, res) => {
  try {
    const { contents, template, config } = req.body;

    if (!contents || !Array.isArray(contents)) {
      return res.status(400).json({ error: 'Contents array is required' });
    }

    const validation = validateUnityExport(contents, template, config);
    
    res.json({
      validation,
      recommendations: {
        unity: getUnityRecommendations(contents, template, config),
        performance: getPerformanceRecommendations(validation.performanceScore)
      }
    });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ error: 'Internal server error during validation' });
  }
});

/**
 * GET /api/unity/export/history/:userId?
 * Get export history
 */
router.get('/export/history/:userId?', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Mock export history - in real implementation, this would come from database
    const mockHistory = [
      {
        exportId: 'export_123',
        timestamp: new Date().toISOString(),
        config: DEFAULT_UNITY_CONFIG,
        status: 'success',
        unityProjectPath: '/unity/projects/export_123',
        templateCount: 1,
        contentCount: 5,
        performanceScore: 85
      }
    ];

    res.json({
      history: mockHistory.slice(offset, offset + parseInt(limit)),
      total: mockHistory.length,
      hasMore: (offset + parseInt(limit)) < mockHistory.length
    });
  } catch (error) {
    console.error('History retrieval error:', error);
    res.status(500).json({ error: 'Internal server error during history retrieval' });
  }
});

/**
 * GET /api/unity/compatibility/:version
 * Get Unity version compatibility info
 */
router.get('/compatibility/:version', (req, res) => {
  const { version } = req.params;
  const compatibility = UNITY_VERSION_COMPATIBILITY[version];
  
  if (!compatibility) {
    return res.status(404).json({ error: 'Unity version not found' });
  }
  
  res.json({
    version,
    ...compatibility,
    recommendations: getUnityVersionRecommendations(version)
  });
});

/**
 * Helper functions for recommendations
 */
function getUnityRecommendations(contents, template, config) {
  const recommendations = [];
  
  if (!template) {
    recommendations.push('Consider using a template for consistent positioning');
  }
  
  if (contents.length > 10) {
    recommendations.push('Large content sets may benefit from LOD or culling systems');
  }
  
  return recommendations;
}

function getPerformanceRecommendations(score) {
  if (score >= 80) return ['Performance looks good!'];
  if (score >= 60) return ['Consider optimizing heavy assets', 'Test on target mobile devices'];
  return ['Significant optimization needed', 'Reduce content complexity', 'Consider asset streaming'];
}

function getUnityVersionRecommendations(version) {
  const recommendations = {
    '2023.3.x': ['Use latest AR Foundation features', 'Take advantage of improved mobile performance'],
    '2022.3.x': ['Stable LTS version with good AR Foundation support'],
    '2021.3.x': ['Consider upgrading for better AR Foundation compatibility']
  };
  return recommendations[version] || [];
}

module.exports = router; 