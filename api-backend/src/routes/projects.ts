import express from 'express';
import projectService from '../services/projectService';
import { requireAuth } from '../middleware/auth';
import { validateCreateProject, validateProjectParams } from '../middleware/validation';

const router = express.Router();

// Create a new project
router.post('/create', requireAuth, validateCreateProject, async (req, res) => {
  try {
    const { userId, className } = req.body;

    const result = await projectService.createProject(userId, className);

    res.json({
      success: true,
      projectId: result.projectId,
      projectFileId: result.projectFileId,
      message: 'Project created successfully'
    });

  } catch (error: any) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating project',
      details: error.message
    });
  }
});

// Get project data
router.get('/:userId/:className', requireAuth, validateProjectParams, async (req, res): Promise<void> => {
  try {
    const { userId, className } = req.params;

    const projectData = await projectService.getProject(userId, className);
    if (!projectData) {
      res.status(404).json({
        success: false,
        error: 'Project not found'
      });
      return;
    }

    const projectFolderId = await projectService.getProjectFolderId(userId, className);

    res.json({
      success: true,
      project: projectData,
      projectId: projectFolderId
    });

  } catch (error: any) {
    console.error('Error getting project:', error);
    res.status(500).json({
      success: false,
      error: 'Error getting project',
      details: error.message
    });
  }
});

// Update project data
router.put('/:userId/:className', requireAuth, validateProjectParams, async (req, res): Promise<void> => {
  try {
    const { userId, className } = req.params;
    const updateData = req.body;

    await projectService.updateProject(userId, className, updateData);

    res.json({
      success: true,
      message: 'Project updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating project',
      details: error.message
    });
  }
});

// List user projects
router.get('/:userId', requireAuth, async (req, res): Promise<void> => {
  try {
    const { userId } = req.params;

    const projects = await projectService.listUserProjects(userId);

    res.json({
      success: true,
      projects,
      count: projects.length
    });

  } catch (error: any) {
    console.error('Error listing projects:', error);
    res.status(500).json({
      success: false,
      error: 'Error listing projects',
      details: error.message
    });
  }
});

export default router;