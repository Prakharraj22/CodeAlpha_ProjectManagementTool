import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutGrid, Home, Plus, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import Avatar from '../ui/Avatar';

const PROJECT_COLORS = ['#7c6ef6','#22d3ee','#34d399','#fbbf24','#fb7185','#a78bfa','#60a5fa','#f97316'];

export default function Sidebar({ projects = [], onCreateProject, collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isProjectActive = (id) => location.pathname === `/projects/${id}`;
  const isDashboard = location.pathname === '/';

  return (
    <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''}`} aria-label="Main navigation">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <LayoutGrid size={18} color="#fff" />
        </div>
        <span className="sidebar-brand">TaskPulse</span>
        {!collapsed && (
          <button
            className="btn btn-icon"
            onClick={onToggle}
            aria-label="Collapse sidebar"
            style={{ marginLeft: 'auto', width: 26, height: 26, flexShrink: 0 }}
          >
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      {/* Main nav */}
      <div className="sidebar-section">
        <button
          className={`sidebar-item ${isDashboard ? 'active' : ''}`}
          onClick={() => navigate('/')}
          title="Dashboard"
        >
          <span className="sidebar-item-icon"><Home size={16} /></span>
          <span className="sidebar-item-text">Dashboard</span>
        </button>
      </div>

      {/* Projects */}
      <div className="sidebar-section" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 12px 6px' }}>
          <span className="sidebar-section-label" style={{ padding: 0 }}>Projects</span>
          {!collapsed && (
            <button
              className="btn btn-icon"
              style={{ width: 22, height: 22, borderRadius: 6 }}
              onClick={onCreateProject}
              title="New project"
              aria-label="Create new project"
            >
              <Plus size={13} />
            </button>
          )}
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {projects.length === 0 && !collapsed && (
            <div style={{ padding: '6px 12px', fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic' }}>
              No projects yet
            </div>
          )}
          {projects.map((p, i) => (
            <button
              key={p.id}
              className={`sidebar-item ${isProjectActive(p.id) ? 'active' : ''}`}
              onClick={() => navigate(`/projects/${p.id}`)}
              title={p.name}
            >
              <span className="sidebar-item-icon">
                <span
                  className="sidebar-project-dot"
                  style={{ background: PROJECT_COLORS[i % PROJECT_COLORS.length] }}
                />
              </span>
              <span className="sidebar-item-text">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        {collapsed ? (
          <button
            className="sidebar-item"
            onClick={onToggle}
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <span className="sidebar-item-icon"><ChevronRight size={16} /></span>
          </button>
        ) : (
          <div className="sidebar-user">
            <Avatar src={user?.avatar} name={user?.name} size="sm" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
            </div>
            <button
              onClick={logout}
              className="btn btn-icon"
              style={{ width: 28, height: 28, flexShrink: 0 }}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={13} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
