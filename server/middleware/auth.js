import jwt from 'jsonwebtoken';
import { db } from '../db.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_TO_A_SECURE_RANDOM_SECRET_KEY_IN_PRODUCTION';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    const user = db.getUserById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User no longer exists' });
    }
    req.user = user;
    next();
  });
};
