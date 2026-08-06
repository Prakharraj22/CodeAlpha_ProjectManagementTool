import { Server } from 'socket.io';

let io = null;

export const initWebsocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join personal user room for direct notifications
    socket.on('auth:register_socket', ({ userId }) => {
      if (userId) {
        socket.userId = userId;
        socket.join(`user:${userId}`);
        console.log(`[Socket.io] User ${userId} joined personal room user:${userId}`);
      }
    });

    // Join project room for board updates
    socket.on('project:join', ({ projectId, userId }) => {
      if (projectId) {
        socket.join(`project:${projectId}`);
        console.log(`[Socket.io] Socket ${socket.id} joined project room project:${projectId}`);
        
        // Broadcast presence
        socket.to(`project:${projectId}`).emit('user:joined_project', {
          userId,
          socketId: socket.id
        });
      }
    });

    // Leave project room
    socket.on('project:leave', ({ projectId }) => {
      if (projectId) {
        socket.leave(`project:${projectId}`);
        console.log(`[Socket.io] Socket ${socket.id} left project room project:${projectId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized');
  }
  return io;
};

export const emitToProject = (projectId, event, data) => {
  if (io) {
    io.to(`project:${projectId}`).emit(event, data);
  }
};

export const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};
