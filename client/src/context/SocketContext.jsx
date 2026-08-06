import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch initial notifications
  useEffect(() => {
    if (token && user) {
      fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.notifications) {
            setNotifications(data.notifications);
            setUnreadCount(data.notifications.filter(n => !n.is_read).length);
          }
        })
        .catch(console.error);
    }
  }, [token, user]);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const socketUrl = window.location.origin;
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('⚡ Socket.io connected:', newSocket.id);
      setConnected(true);
      newSocket.emit('auth:register_socket', { userId: user.id });
    });

    newSocket.on('disconnect', () => {
      console.log('⚡ Socket.io disconnected');
      setConnected(false);
    });

    newSocket.on('notification:new', (notif) => {
      console.log('🔔 Live Notification received:', notif);
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Trigger toast popup
      setToastMessage(notif.message);
      setTimeout(() => {
        setToastMessage(null);
      }, 4000);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const markAllNotificationsRead = async () => {
    if (!token) return;
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Failed to mark notifications read:', e);
    }
  };

  const markSingleNotificationRead = async (id) => {
    if (!token) return;
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error('Failed to mark notification read:', e);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        notifications,
        unreadCount,
        toastMessage,
        setToastMessage,
        markAllNotificationsRead,
        markSingleNotificationRead
      }}
    >
      {children}
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'rgba(255, 253, 250, 0.98)',
            border: '1px solid rgba(224, 79, 79, 0.4)',
            boxShadow: '0 10px 30px rgba(180, 80, 80, 0.25)',
            borderRadius: '12px',
            padding: '14px 20px',
            color: '#2d1e1e',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 9999,
            animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <span style={{ fontSize: '18px' }}>🔔</span>
          <div>
            <div style={{ fontSize: '12px', color: '#e04f4f', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Real-time Update</div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>{toastMessage}</div>
          </div>
        </div>
      )}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
