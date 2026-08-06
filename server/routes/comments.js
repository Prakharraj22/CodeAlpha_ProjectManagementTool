import express from 'express';
import { db } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { emitToProject, emitToUser } from '../websocket.js';

const router = express.Router();

// Get comments for a task
router.get('/task/:taskId', authenticateToken, (req, res) => {
  try {
    const { taskId } = req.params;
    const task = db.getTaskById(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (!db.isProjectMember(task.project_id, req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const comments = db.getCommentsByTask(taskId);
    res.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Add comment to a task
router.post('/task/:taskId', authenticateToken, (req, res) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content cannot be empty' });
    }

    const task = db.getTaskById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (!db.isProjectMember(task.project_id, req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const comment = db.addComment({
      task_id: taskId,
      user_id: req.user.id,
      content: content.trim()
    });

    // Broadcast comment added to project room
    emitToProject(task.project_id, 'comment:added', {
      taskId,
      comment
    });

    // Send real-time notification to assignee if created
    if (task.assigned_to && task.assigned_to !== req.user.id) {
      const notifs = db.getNotificationsForUser(task.assigned_to);
      if (notifs[0]) {
        emitToUser(task.assigned_to, 'notification:new', notifs[0]);
      }
    }

    res.status(201).json({ comment });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

export default router;
