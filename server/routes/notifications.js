import express from 'express';
import { db } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get notifications for logged in user
router.get('/', authenticateToken, (req, res) => {
  try {
    const notifications = db.getNotificationsForUser(req.user.id);
    res.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark single notification as read
router.patch('/:id/read', authenticateToken, (req, res) => {
  try {
    const notif = db.markNotificationRead(req.params.id);
    res.json({ notification: notif });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Mark all as read
router.post('/read-all', authenticateToken, (req, res) => {
  try {
    db.markAllNotificationsRead(req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ error: 'Failed to mark notifications read' });
  }
});

export default router;
