import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import ProjectBoard from './pages/ProjectBoard';
import Login from './pages/Login';
import Register from './pages/Register';
import CommandPalette from './components/CommandPalette';
import NotificationPanel from './components/NotificationPanel';
import CreateProjectModal from './components/CreateProjectModal';

// Auth pages rendered outside AppShell
function AuthPages() {
  const [view, setView] = useState('login');
  return view === 'login'
    ? <Login onSwitchToRegister={() => setView('register')} />
    : <Register onSwitchToLogin={() => setView('login')} />;
}

// Authenticated app — requires user
function AuthenticatedApp() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [isDarkMode, setIsDarkMode]         = useState(true);
  const [cmdOpen, setCmdOpen]               = useState(false);
  const [notifOpen, setNotifOpen]           = useState(false);
  const [createProjOpen, setCreateProjOpen] = useState(false);
  const [projects, setProjects]             = useState([]);

  // Apply theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Global Cmd/Ctrl+K
  useEffect(() => {
    const handle = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(o => !o);
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, []);

  const fetchProjects = useCallback(() => {
    if (!token) return;
    fetch('/api/projects', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.projects) setProjects(d.projects); })
      .catch(console.error);
  }, [token]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleCreateProject = async (data) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    const d = await res.json();
    if (d.project) {
      setProjects(p => [d.project, ...p]);
      window.__refreshSidebarProjects?.();
    }
  };

  const shellProps = {
    isDarkMode,
    onToggleTheme: () => setIsDarkMode(d => !d),
    onOpenCommandPalette: () => setCmdOpen(true),
    onOpenNotifications: () => setNotifOpen(true),
    onCreateProject: () => setCreateProjOpen(true),
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<AppShell {...shellProps}><Dashboard /></AppShell>} />
        <Route path="/projects/:projectId" element={<AppShell {...shellProps}><ProjectBoard /></AppShell>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global overlays */}
      <CommandPalette
        isOpen={cmdOpen}
        onClose={() => setCmdOpen(false)}
        projects={projects}
        onSelectProject={(id) => {
          if (id) navigate(`/projects/${id}`);
          else navigate('/');
        }}
        onCreateProject={() => { setCreateProjOpen(true); setCmdOpen(false); }}
        onCreateTask={() => setCmdOpen(false)}
        onToggleTheme={() => setIsDarkMode(d => !d)}
        isDarkMode={isDarkMode}
      />

      <NotificationPanel
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
      />

      <CreateProjectModal
        isOpen={createProjOpen}
        onClose={() => setCreateProjOpen(false)}
        onCreateProject={handleCreateProject}
      />
    </>
  );
}

// Root — decides auth vs app
function Root() {
  const { user } = useAuth();
  if (!user) return <AuthPages />;
  return <AuthenticatedApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Root />
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}
