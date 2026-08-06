import React from 'react';
import { Users, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ProjectCard({ project, onOpen }) {
  const { id, name, description, members = [], task_count = 0, completed_task_count = 0 } = project;
  const progress = task_count > 0 ? Math.round((completed_task_count / task_count) * 100) : 0;

  return (
    <div
      onClick={() => onOpen(id)}
      id={`project-card-${id}`}
      className="glass-panel"
      style={{
        padding: '24px',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '220px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = 'var(--border-highlight)';
        e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border-color)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            {name}
          </h3>
          <ArrowRight size={18} style={{ color: 'var(--primary)' }} />
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {description || 'No workspace description provided.'}
        </p>
      </div>

      <div>
        {/* Progress Bar */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={13} style={{ color: 'var(--accent-emerald)' }} /> {completed_task_count} of {task_count} tasks
            </span>
            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{progress}%</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(148, 163, 184, 0.15)', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--primary) 0%, var(--accent-emerald) 100%)',
                borderRadius: '3px',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        </div>

        {/* Footer: Member Avatars */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {members.slice(0, 4).map((m, i) => (
              <img
                key={m.id || i}
                src={m.avatar}
                alt={m.name}
                title={m.name}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--bg-card)',
                  marginLeft: i > 0 ? '-8px' : '0'
                }}
              />
            ))}
            {members.length > 4 && (
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--primary)',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--bg-card)',
                  marginLeft: '-8px'
                }}
              >
                +{members.length - 4}
              </div>
            )}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Users size={13} /> {members.length} {members.length === 1 ? 'member' : 'members'}
          </span>
        </div>
      </div>
    </div>
  );
}
