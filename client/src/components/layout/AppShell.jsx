import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppShell({
  children,
  onOpenCommandPalette,
  isDarkMode,
  onToggleTheme,
  onOpenNotifications,
  currentProject,
  onCreateProject,
}) {
  const { token } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [projects, setProjects] = useState([]);

  const refreshProjects = () => {
    if (!token) return;
    fetch('/api/projects', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.projects) setProjects(d.projects); })
      .catch(console.error);
  };

  useEffect(() => { refreshProjects(); }, [token]);

  // Expose globally so Dashboard can trigger after project creation
  useEffect(() => {
    window.__refreshSidebarProjects = refreshProjects;
    return () => { delete window.__refreshSidebarProjects; };
  });

  return (
    <div className="app-shell">
      <Sidebar
        projects={projects}
        onCreateProject={onCreateProject}
        collapsed={collapsed}
        onToggle={() => setCollapsed(p => !p)}
      />
      <div className="app-main">
        <Topbar
          onOpenCommandPalette={onOpenCommandPalette}
          isDarkMode={isDarkMode}
          onToggleTheme={onToggleTheme}
          onOpenNotifications={onOpenNotifications}
          currentProject={currentProject}
        />
        <main className="app-content" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
