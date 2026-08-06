import express from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { initWebsocket } from './websocket.js';

import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import commentRoutes from './routes/comments.js';
import notificationRoutes from './routes/notifications.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initWebsocket(server);

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend in production/dist build if available
const clientDist = path.resolve(process.cwd(), 'client/dist');
app.use(express.static(clientDist));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  const indexPath = path.join(clientDist, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head><title>TaskPulse Enterprise Server</title></head>
        <body style="font-family: sans-serif; background: #090d16; color: #f8fafc; padding: 40px; text-align: center;">
          <h1>🚀 TaskPulse Enterprise API & WebSocket Server Running!</h1>
          <p>The backend server is running on port ${PORT}. Run <code>cd client && npm run dev</code> for frontend development server.</p>
        </body>
        </html>
      `);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`================================================`);
  console.log(`🚀 TaskPulse Enterprise Server running on http://localhost:${PORT}`);
  console.log(`⚡ WebSocket Server attached to http://localhost:${PORT}`);
  console.log(`================================================`);
});
