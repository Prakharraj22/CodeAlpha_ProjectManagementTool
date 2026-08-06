import React, { useState, useEffect } from 'react';
import { Search, Folder, CheckSquare, Plus, Sun, Moon, LayoutDashboard, X } from 'lucide-react';

export default function CommandPalette({ isOpen, onClose, projects = [], onSelectProject, onCreateProject, onCreateTask, onToggleTheme, isDarkMode }) {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '10vh'
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '600px',
          background: 'var(--bg-modal)',
          borderRadius: '16px',
          border: '1px solid var(--border-highlight)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div style={{ position: 'relative', borderBottom: '1px solid var(--border-color)' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Type a command or search workspace projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            style={{
              border: 'none',
              borderRadius: 0,
              padding: '16px 44px 16px 48px',
              fontSize: '15px',
              background: 'transparent'
            }}
          />
          <button onClick={onClose} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        {/* Command Options List */}
        <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '8px' }}>
          {/* System Actions */}
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', padding: '8px 12px 4px 12px', textTransform: 'uppercase' }}>
            Quick Actions
          </div>

          <div
            className="command-item"
            onClick={() => { onCreateProject(); onClose(); }}
            style={commandItemStyle}
          >
            <Plus size={16} style={{ color: 'var(--primary)' }} />
            <span>Create New Group Project</span>
            <span style={shortcutStyle}>Action</span>
          </div>

          <div
            className="command-item"
            onClick={() => { onCreateTask(); onClose(); }}
            style={commandItemStyle}
          >
            <CheckSquare size={16} style={{ color: 'var(--accent-amber)' }} />
            <span>Create New Task Card</span>
            <span style={shortcutStyle}>Action</span>
          </div>

          <div
            className="command-item"
            onClick={() => { onToggleTheme(); onClose(); }}
            style={commandItemStyle}
          >
            {isDarkMode ? <Sun size={16} style={{ color: '#f59e0b' }} /> : <Moon size={16} style={{ color: '#6366f1' }} />}
            <span>Switch to {isDarkMode ? 'Light Studio' : 'Dark Enterprise'} Theme</span>
            <span style={shortcutStyle}>Theme</span>
          </div>

          {/* Projects Group */}
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', padding: '12px 12px 4px 12px', textTransform: 'uppercase' }}>
            Workspaces ({filteredProjects.length})
          </div>

          {filteredProjects.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No matching projects found.
            </div>
          ) : (
            filteredProjects.map(p => (
              <div
                key={p.id}
                className="command-item"
                onClick={() => { onSelectProject(p.id); onClose(); }}
                style={commandItemStyle}
              >
                <Folder size={16} style={{ color: 'var(--accent-cyan)' }} />
                <span style={{ fontWeight: 600 }}>{p.name}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                  {p.completed_task_count || 0}/{p.task_count || 0} Done
                </span>
              </div>
            ))
          )}
        </div>

        {/* Command Footer */}
        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border-color)', fontSize: '11px', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Navigation: Use mouse or click</span>
          <span>Shortcut: <strong>Cmd + K</strong></span>
        </div>
      </div>
    </div>
  );
}

const commandItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '10px 12px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  color: 'var(--text-main)',
  transition: 'background-color 0.15s ease'
};

const shortcutStyle = {
  fontSize: '11px',
  background: 'rgba(148, 163, 184, 0.12)',
  padding: '2px 6px',
  borderRadius: '4px',
  marginLeft: 'auto',
  color: 'var(--text-muted)'
};
