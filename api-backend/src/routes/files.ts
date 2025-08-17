import express from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload file to Google Drive - temporarily disabled
router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
  res.status(503).json({
    success: false,
    error: 'File upload temporarily disabled - googleapis import issue'
  });
});

// Download file from Google Drive - temporarily disabled
router.get('/download/:fileId', requireAuth, async (req, res) => {
  res.status(503).json({
    success: false,
    error: 'File download temporarily disabled - googleapis import issue'
  });
});

// List files in folder - temporarily disabled
router.get('/list/:folderId?', requireAuth, async (req, res) => {
  res.status(503).json({
    success: false,
    error: 'File listing temporarily disabled - googleapis import issue'
  });
});

// Delete file - temporarily disabled
router.delete('/:fileId', requireAuth, async (req, res) => {
  res.status(503).json({
    success: false,
    error: 'File deletion temporarily disabled - googleapis import issue'
  });
});

export default router;