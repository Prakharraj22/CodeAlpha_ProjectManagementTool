import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Command, Sun, Moon, Bell, ChevronRight } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export default function Topbar({ onOpenCommandPalette, isDarkMode, onToggleTheme, onOpenNotifications, currentProject }) {
  const { user } = useAuth();
  const { unreadCount } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const isOnProject = location.pathname.startsWith('/projects/');

  return (
    <header className="app-topbar" role="banner">
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, padding: 0, whiteSpace: 'nowrap' }}
        >
          Workspace
        </button>
        {isOnProject && currentProject && (
          <>
            <ChevronRight size={13} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentProject.name}
            </span>
          </>
        )}
      </div>

      {/* Command palette trigger */}
      <button
        onClick={onOpenCommandPalette}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--surface-3)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', padding: '5px 12px',
          cursor: 'pointer', color: 'var(--text-2)', fontSize: 12,
          minWidth: 170, transition: 'all 0.15s'
        }}
        aria-label="Open command palette (Ctrl+K)"
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-active)'; e.currentTarget.style.color = 'var(--text-1)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; }}
      >
        <Command size={13} style={{ flexShrink: 0 }} />
        <span style={{ flex: 1, textAlign: 'left' }}>Quick command...</span>
        <kbd style={{ fontSize: 10, background: 'var(--surface-4)', padding: '1px 5px', borderRadius: 4, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>⌘K</kbd>
      </button>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          onClick={onToggleTheme}
          className="btn btn-icon"
          aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
          title={`${isDarkMode ? 'Light' : 'Dark'} mode`}
        >
          {isDarkMode
            ? <Sun size={16} style={{ color: '#fbbf24' }} />
            : <Moon size={16} style={{ color: 'var(--primary)' }} />}
        </button>

        <button
          onClick={onOpenNotifications}
          className="btn btn-icon"
          style={{ position: 'relative' }}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          title="Notifications"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: -2, right: -2,
              background: 'var(--color-error)', color: '#fff',
              fontSize: 9, fontWeight: 800,
              width: 16, height: 16, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--surface-1)'
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <Avatar
          src={user?.avatar}
          name={user?.name}
          size="sm"
          style={{ border: '2px solid var(--primary-border)', cursor: 'default', flexShrink: 0 }}
          title={user?.name}
        />
      </div>
    </header>
  );
}
