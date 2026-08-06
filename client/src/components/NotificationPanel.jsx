import React from 'react';
import { Bell, CheckCheck, Clock, X } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationPanel({ isOpen, onClose, onSelectProject }) {
  const { notifications, unreadCount, markAllNotificationsRead, markSingleNotificationRead } = useSocket();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 899, background: 'rgba(0,0,0,0.3)' }}
        aria-hidden="true"
      />
      {/* Panel */}
      <div className="notif-panel" role="dialog" aria-modal="true" aria-label="Notifications">
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell size={18} style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)' }}>Notifications</span>
            {unreadCount > 0 && (
              <span style={{
                background: 'var(--primary)', color: '#fff',
                borderRadius: 99, padding: '1px 8px',
                fontSize: 11, fontWeight: 700
              }}>
                {unreadCount} new
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                id="mark-all-read-btn"
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 11, gap: 4 }}
                title="Mark all read"
              >
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="btn btn-icon"
              style={{ width: 30, height: 30 }}
              aria-label="Close notifications"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* List */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
          {notifications.length === 0 ? (
            <div style={{ padding: '48px 16px', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: 'var(--text-3)' }}>
                <Bell size={22} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>All caught up</p>
              <p style={{ fontSize: 13, color: 'var(--text-2)' }}>No notifications yet</p>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                className={`notif-item ${!n.is_read ? 'unread' : ''}`}
                onClick={() => {
                  markSingleNotificationRead(n.id);
                  if (n.project_id && onSelectProject) {
                    onSelectProject(n.project_id);
                    onClose();
                  }
                }}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && e.currentTarget.click()}
              >
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 5,
                  background: n.is_read ? 'var(--surface-4)' : 'var(--primary)'
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 13, color: n.is_read ? 'var(--text-2)' : 'var(--text-1)',
                    fontWeight: n.is_read ? 400 : 600, margin: '0 0 4px', lineHeight: 1.45
                  }}>
                    {n.message}
                  </p>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} />
                    {timeAgo(n.created_at)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
