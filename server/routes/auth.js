import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { authenticateToken, JWT_SECRET } from '../middleware/auth.js';
import { validateRegistration, validateLogin } from '../middleware/validate.js';

const router = express.Router();

// Register
router.post('/register', validateRegistration, (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;

    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const password_hash = bcrypt.hashSync(password, 10);
    const user = db.createUser({ name, email, password_hash, avatar });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      user,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
router.post('/login', validateLogin, (req, res) => {
  try {
    const { email, password } = req.body;

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    const { password_hash, ...userWithoutPass } = user;

    res.json({
      user: userWithoutPass,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

// Get current user profile
router.get('/me', authenticateToken, (req, res) => {
  const { password_hash, ...userWithoutPass } = req.user;
  res.json({ user: userWithoutPass });
});

// Search users for project invitation or assignment
router.get('/users', authenticateToken, (req, res) => {
  const { query } = req.query;
  let users = db.getAllUsers();
  if (query) {
    const q = query.toLowerCase();
    users = users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }
  res.json({ users });
});

export default router;
