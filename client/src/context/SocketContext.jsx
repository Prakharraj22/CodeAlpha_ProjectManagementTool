import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { Bell, X } from 'lucide-react';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);

  // Fetch initial notifications
  useEffect(() => {
    if (token && user) {
      fetch('/api/notifications', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => {
          if (data.notifications) {
            setNotifications(data.notifications);
            setUnreadCount(data.notifications.filter(n => !n.is_read).length);
          }
        })
        .catch(console.error);
    }
  }, [token, user]);

  // Socket connection — FIXED: removed selectedTask from deps
  useEffect(() => {
    if (!user) {
      if (socket) { socket.disconnect(); setSocket(null); setConnected(false); }
      return;
    }
    const newSocket = io(window.location.origin, { transports: ['websocket', 'polling'] });
    newSocket.on('connect', () => {
      setConnected(true);
      newSocket.emit('auth:register_socket', { userId: user.id });
    });
    newSocket.on('disconnect', () => setConnected(false));
    newSocket.on('notification:new', (notif) => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);
      const id = Date.now();
      setToasts(prev => [...prev, { id, message: notif.message }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
    });
    setSocket(newSocket);
    return () => { newSocket.disconnect(); };
  }, [user]); // only user — not selectedTask

  const dismissToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const markAllNotificationsRead = async () => {
    if (!token) return;
    try {
      await fetch('/api/notifications/read-all', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) { console.error(e); }
  };

  const markSingleNotificationRead = async (id) => {
    if (!token) return;
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` } });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) { console.error(e); }
  };

  return (
    <SocketContext.Provider value={{
      socket, connected, notifications, unreadCount,
      markAllNotificationsRead, markSingleNotificationRead
    }}>
      {children}
      {/* Toast container */}
      <div className="toast-container" aria-live="polite" aria-label="Live notifications">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--primary-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Bell size={15} style={{ color: 'var(--primary)' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                Live update
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {t.message}
              </div>
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 2, flexShrink: 0 }}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
            <div className="toast-progress" />
          </div>
        ))}
      </div>
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
