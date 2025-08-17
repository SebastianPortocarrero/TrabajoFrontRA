import express, { Request, Response } from 'express';
import userService from '../services/userService';
import { requireAuth, requireRole } from '../middleware/auth';
import { body, param, validationResult } from 'express-validator';

const router = express.Router();

// Validation middleware
const validateUserId = [
  param('userId').isUUID().withMessage('Invalid user ID format')
];

const validateUpdateUser = [
  body('name').optional().isString().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
  body('role').optional().isIn(['user', 'admin', 'moderator']).withMessage('Invalid role')
];

// Get current user profile
router.get('/me', requireAuth, async (req, res): Promise<void> => {
  try {
    const user = await userService.getUserById(req.user.id);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    console.error('Error getting current user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Update current user profile
router.put('/me', requireAuth, validateUpdateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }

    const { name, image } = req.body;
    const updatedUser = await userService.updateUser(req.user.id, { name, image });
    
    if (!updatedUser) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        image: updatedUser.image,
        role: updatedUser.role,
        emailVerified: updatedUser.emailVerified
      },
      message: 'Profile updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Get user by ID (admin only)
router.get('/:userId', requireAuth, requireRole('admin'), validateUserId, async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }

    const user = await userService.getUserById(req.params.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error: any) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Update user (admin only)
router.put('/:userId', requireAuth, requireRole('admin'), validateUserId, validateUpdateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }

    const { name, image, role } = req.body;
    const updatedUser = await userService.updateUser(req.params.userId, { name, image, role });
    
    if (!updatedUser) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        image: updatedUser.image,
        role: updatedUser.role,
        emailVerified: updatedUser.emailVerified
      },
      message: 'User updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Delete user (admin only)
router.delete('/:userId', requireAuth, requireRole('admin'), validateUserId, async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }

    const success = await userService.deleteUser(req.params.userId);
    
    if (!success) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Get user statistics (admin only)
router.get('/admin/stats', requireAuth, requireRole('admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await userService.getUserStats();
    
    res.json({
      success: true,
      stats
    });
  } catch (error: any) {
    console.error('Error getting user stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

export default router;