import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import CommandPalette from './components/CommandPalette';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectBoard from './pages/ProjectBoard';

function MainApp() {
  const { user, token, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [activeProject, setActiveProject] = useState(null);
  const [projectsList, setProjectsList] = useState([]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Sync Theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Fetch projects list for command palette
  useEffect(() => {
    if (user && token) {
      fetch('/api/projects', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
          if (data.projects) setProjectsList(data.projects);
        })
        .catch(console.error);
    }
  }, [user, token, currentProjectId]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#090d16',
          color: '#94a3b8',
          fontFamily: 'sans-serif'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '3px solid rgba(99, 102, 241, 0.2)',
              borderTopColor: '#6366f1',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px auto'
            }}
          />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <div style={{ fontWeight: 700, fontSize: '15px', color: '#f8fafc' }}>
            Initializing TaskPulse Enterprise...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return authView === 'login' ? (
      <Login onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  return (
    <SocketProvider>
      <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', color: 'var(--text-main)' }}>
        <Navbar
          currentProject={activeProject}
          onGoDashboard={() => {
            setCurrentProjectId(null);
            setActiveProject(null);
          }}
          onSelectProject={(id) => {
            setCurrentProjectId(id);
          }}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
        />

        <main>
          {currentProjectId ? (
            <ProjectBoard
              projectId={currentProjectId}
              onGoDashboard={() => {
                setCurrentProjectId(null);
                setActiveProject(null);
              }}
              onProjectLoaded={(proj) => setActiveProject(proj)}
            />
          ) : (
            <Dashboard
              onSelectProject={(id) => {
                setCurrentProjectId(id);
              }}
            />
          )}
        </main>

        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          projects={projectsList}
          onSelectProject={(id) => setCurrentProjectId(id)}
          onCreateProject={() => {
            setCurrentProjectId(null);
          }}
          onCreateTask={() => {
            if (projectsList.length > 0 && !currentProjectId) {
              setCurrentProjectId(projectsList[0].id);
            }
          }}
          onToggleTheme={toggleTheme}
          isDarkMode={isDarkMode}
        />
      </div>
    </SocketProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
