import React from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { LayoutGrid, LogOut, Command, Sun, Moon, Sparkles } from 'lucide-react';

export default function Navbar({ currentProject, onGoDashboard, onOpenCommandPalette, isDarkMode, onToggleTheme }) {
  const { user, logout } = useAuth();

  return (
    <header
      className="glass-panel"
      style={{
        borderRadius: 0,
        borderLeft: 'none',
        borderRight: 'none',
        borderTop: 'none',
        padding: '12px 28px',
        position: 'sticky',
        top: 0,
        zIndex: 900,
        background: 'var(--bg-card)',
        borderColor: 'var(--border-color)'
      }}
    >
      <div
        style={{
          maxWidth: '1480px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Brand & Project Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            onClick={onGoDashboard}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--primary) 0%, #4338ca 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px var(--primary-glow)'
              }}
            >
              <LayoutGrid size={20} color="#fff" />
            </div>
            <div>
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                TaskPulse
              </span>
              <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', fontWeight: 700, marginLeft: '6px' }}>
                PRO
              </span>
            </div>
          </div>

          {currentProject && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <span>/</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{currentProject.name}</span>
            </div>
          )}
        </div>

        {/* Center: Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="btn-secondary"
          style={{
            padding: '6px 14px',
            fontSize: '12px',
            borderRadius: '10px',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Command size={14} />
          <span>Quick Command...</span>
          <kbd style={{ fontSize: '10px', background: 'rgba(148, 163, 184, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>Cmd K</kbd>
        </button>

        {/* Right Section: Theme Toggle, Notifications, User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="btn-icon"
            title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Theme`}
          >
            {isDarkMode ? <Sun size={18} style={{ color: '#f59e0b' }} /> : <Moon size={18} style={{ color: '#6366f1' }} />}
          </button>

          {/* Notifications Dropdown */}
          <NotificationDropdown />

          {/* User Avatar & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '8px', borderLeft: '1px solid var(--border-color)' }}>
            <img
              src={user ? user.avatar : 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
              alt={user ? user.name : 'User'}
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--primary)' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                {user ? user.name : 'User'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                {user ? user.email : ''}
              </span>
            </div>

            <button
              onClick={logout}
              className="btn-icon"
              title="Sign Out"
              style={{ width: '32px', height: '32px', borderRadius: '8px', marginLeft: '4px' }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
