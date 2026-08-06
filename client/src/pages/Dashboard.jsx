import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProjectCard from '../components/ProjectCard';
import CreateProjectModal from '../components/CreateProjectModal';
import { Plus, Search, FolderKanban, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export default function Dashboard({ onSelectProject }) {
  const { user, token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchProjects = () => {
    if (!token) return;
    fetch('/api/projects', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.projects) {
          setProjects(data.projects);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjects();
  }, [token]);

  const handleCreateProject = async (projectData) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(projectData)
    });
    const data = await res.json();
    if (res.ok && data.project) {
      setProjects(prev => [data.project, ...prev]);
    }
  };

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalTasks = projects.reduce((acc, p) => acc + (p.task_count || 0), 0);
  const totalCompleted = projects.reduce((acc, p) => acc + (p.completed_task_count || 0), 0);
  const overallRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Workspace Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
              Welcome back, {user ? user.name : 'User'} 👋
            </h1>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
            TaskPulse Workspace Hub — Manage team deliverables, assign tasks, and track velocity.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          id="create-project-btn"
          className="btn-primary"
          style={{ padding: '10px 20px', fontSize: '14px' }}
        >
          <Plus size={18} /> Create Group Project
        </button>
      </div>

      {/* Metrics Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '36px' }}>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FolderKanban size={22} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>{projects.length}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Active Group Projects</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} style={{ color: 'var(--accent-amber)' }} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>{totalTasks}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Workspace Tasks</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} style={{ color: 'var(--accent-emerald)' }} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>{totalCompleted} ({overallRate}%)</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Completed Deliverables</div>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
          Your Team Workspaces
        </h2>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            id="search-projects-input"
            className="input-field"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '38px', fontSize: '13px' }}
          />
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Loading workspace projects...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', borderRadius: '20px' }}>
          <FolderKanban size={48} style={{ color: 'var(--text-dim)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
            No Workspace Projects Found
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 24px auto' }}>
            {searchQuery ? "No projects match your search query." : "Get started by creating your first team workspace project."}
          </p>
          <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={16} /> Create Project Now
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {filteredProjects.map(p => (
            <ProjectCard key={p.id} project={p} onOpen={onSelectProject} />
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
}
