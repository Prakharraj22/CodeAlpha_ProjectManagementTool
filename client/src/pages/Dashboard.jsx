import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProjectCard from '../components/ProjectCard';
import CreateProjectModal from '../components/CreateProjectModal';
import { SkeletonCard } from '../components/ui/Skeleton';
import { Plus, Search, FolderKanban, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

function StatCard({ icon: Icon, value, label, color, bg }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchProjects = () => {
    if (!token) return;
    fetch('/api/projects', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (data.projects) setProjects(data.projects); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, [token]);

  const handleCreateProject = async (projectData) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(projectData)
    });
    const data = await res.json();
    if (res.ok && data.project) {
      setProjects(prev => [data.project, ...prev]);
      window.__refreshSidebarProjects?.();
    }
  };

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalTasks     = projects.reduce((a, p) => a + (p.task_count || 0), 0);
  const totalCompleted = projects.reduce((a, p) => a + (p.completed_task_count || 0), 0);
  const overallRate    = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '36px 28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-1)', margin: '0 0 6px', letterSpacing: '-0.025em' }}>
            {greeting()}, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-2)', margin: 0 }}>
            Here's what's happening across your workspace today.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          id="create-project-btn"
          className="btn btn-primary"
          style={{ gap: 8 }}
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 40 }}>
        <StatCard icon={FolderKanban} value={projects.length}     label="Active Projects"      color="var(--primary)"        bg="var(--primary-subtle)" />
        <StatCard icon={Clock}        value={totalTasks}           label="Total Tasks"           color="var(--color-warning)"  bg="var(--warning-subtle)" />
        <StatCard icon={CheckCircle2} value={totalCompleted}       label="Completed Tasks"       color="var(--color-success)"  bg="var(--success-subtle)" />
        <StatCard icon={TrendingUp}   value={`${overallRate}%`}    label="Completion Rate"       color="var(--color-info)"     bg="var(--info-subtle)" />
      </div>

      {/* Projects section */}
      <div className="section-header">
        <h2 className="section-title">Your Projects</h2>
        <div style={{ position: 'relative', width: 260 }}>
          <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
          <input
            type="text"
            id="search-projects-input"
            className="input"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 34, fontSize: 13 }}
            aria-label="Search projects"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {[1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FolderKanban size={28} />
          </div>
          <p className="empty-state-title">
            {searchQuery ? 'No matching projects' : 'No projects yet'}
          </p>
          <p className="empty-state-desc">
            {searchQuery
              ? `No projects matched "${searchQuery}".`
              : 'Create your first project to get started with your team.'}
          </p>
          {!searchQuery && (
            <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
              <Plus size={15} /> Create project
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {filtered.map(p => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
}
