import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { Bell, CheckCheck, Clock } from 'lucide-react';

export default function NotificationDropdown({ onSelectProject }) {
  const { notifications, unreadCount, markAllNotificationsRead, markSingleNotificationRead } = useSocket();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-icon"
        title="Notifications"
        style={{ position: 'relative' }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              background: 'var(--primary)',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 800,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--bg-card)'
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            marginTop: '8px',
            width: '360px',
            maxHeight: '480px',
            background: 'var(--bg-modal)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border-highlight)',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
          className="animate-fade-in"
        >
          {/* Header */}
          <div
            style={{
              padding: '16px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={18} style={{ color: 'var(--primary)' }} />
              <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-main)' }}>Notifications</span>
              {unreadCount > 0 && (
                <span
                  style={{
                    background: 'var(--primary)',
                    color: '#fff',
                    borderRadius: '12px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                id="mark-all-read-btn"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
                No notifications recorded
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => {
                    markSingleNotificationRead(n.id);
                    if (n.project_id && onSelectProject) {
                      onSelectProject(n.project_id);
                      setIsOpen(false);
                    }
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    marginBottom: '4px',
                    background: n.is_read ? 'transparent' : 'rgba(99, 102, 241, 0.1)',
                    border: n.is_read ? '1px solid transparent' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start'
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: n.is_read ? 'transparent' : 'var(--primary)',
                      marginTop: '6px',
                      flexShrink: 0
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', color: n.is_read ? 'var(--text-muted)' : 'var(--text-main)', margin: '0 0 4px 0', lineHeight: 1.4, fontWeight: n.is_read ? 400 : 600 }}>
                      {n.message}
                    </p>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={11} /> {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
