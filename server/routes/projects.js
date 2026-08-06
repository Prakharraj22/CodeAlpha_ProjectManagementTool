import express from 'express';
import { db } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateProjectCreation } from '../middleware/validate.js';
import { emitToProject, emitToUser } from '../websocket.js';

const router = express.Router();

// Get all projects for logged in user
router.get('/', authenticateToken, (req, res) => {
  try {
    const projects = db.getProjectsForUser(req.user.id);
    res.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Create project
router.post('/', authenticateToken, validateProjectCreation, (req, res) => {
  try {
    const { name, description, member_ids = [] } = req.body;

    const project = db.createProject({
      name,
      description,
      created_by: req.user.id
    });

    for (const memberId of member_ids) {
      if (memberId !== req.user.id) {
        db.addProjectMember(project.id, memberId, 'member');
        
        const notif = db.createNotification({
          user_id: memberId,
          message: `${req.user.name} added you to project "${project.name}"`,
          type: 'project_invite',
          project_id: project.id
        });
        emitToUser(memberId, 'notification:new', notif);
      }
    }

    const updatedProject = db.getProjectById(project.id);
    res.status(201).json({ project: updatedProject });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Get single project
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const projectId = req.params.id;
    if (!db.isProjectMember(projectId, req.user.id)) {
      return res.status(403).json({ error: 'Access denied to this project' });
    }

    const project = db.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const userRole = db.getUserRoleInProject(projectId, req.user.id);

    res.json({ project, userRole });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Add member to project
router.post('/:id/members', authenticateToken, (req, res) => {
  try {
    const projectId = req.params.id;
    const { user_id, role = 'member' } = req.body;

    if (!db.isProjectMember(projectId, req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const project = db.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    db.addProjectMember(projectId, user_id, role);
    const updatedMembers = db.getProjectMembers(projectId);

    emitToProject(projectId, 'project:member_added', {
      projectId,
      members: updatedMembers
    });

    const notif = db.createNotification({
      user_id,
      message: `${req.user.name} added you to project "${project.name}"`,
      type: 'project_invite',
      project_id: projectId
    });
    emitToUser(user_id, 'notification:new', notif);

    res.json({ members: updatedMembers });
  } catch (error) {
    console.error('Error adding project member:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

export default router;
