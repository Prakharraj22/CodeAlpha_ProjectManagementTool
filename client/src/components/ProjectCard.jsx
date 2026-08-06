import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Users, ArrowUpRight } from 'lucide-react';
import { AvatarStack } from './ui/Avatar';

export default function ProjectCard({ project }) {
  const navigate = useNavigate();
  const { id, name, description, members = [], task_count = 0, completed_task_count = 0 } = project;
  const progress = task_count > 0 ? Math.round((completed_task_count / task_count) * 100) : 0;

  const progressColor = progress === 100 ? 'var(--color-success)' : progress > 60 ? 'var(--primary)' : 'var(--color-warning)';

  return (
    <div
      className="project-card"
      onClick={() => navigate(`/projects/${id}`)}
      id={`project-card-${id}`}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/projects/${id}`)}
      aria-label={`Open project: ${name}`}
    >
      {/* Top */}
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)', margin: 0, lineHeight: 1.3 }}>{name}</h3>
          <ArrowUpRight size={16} style={{ color: 'var(--text-3)', flexShrink: 0, marginTop: 2 }} />
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5, margin: 0 }} className="line-clamp-2">
          {description || 'No description provided.'}
        </p>
      </div>

      {/* Progress */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-2)' }}>
            <CheckCircle2 size={13} style={{ color: 'var(--color-success)' }} />
            <span>{completed_task_count} of {task_count} tasks</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: progressColor }}>{progress}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill primary"
            style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${progressColor}, ${progressColor}88)` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <AvatarStack users={members} max={4} size="sm" />
        <span style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Users size={12} />
          {members.length} {members.length === 1 ? 'member' : 'members'}
        </span>
      </div>
    </div>
  );
}
