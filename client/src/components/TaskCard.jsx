import React from 'react';
import { Calendar, MessageSquare, ChevronLeft, ChevronRight, User, CheckSquare, GripVertical, Tag } from 'lucide-react';

const STATUS_ORDER = ['todo', 'in_progress', 'review', 'done'];

export default function TaskCard({ task, onOpenTask, onMoveTask, onDragStart }) {
  const { id, title, description, priority, status, due_date, assignee, comment_count = 0, subtasks = [], tags = [] } = task;

  const completedSubtasks = subtasks.filter(s => s.completed).length;
  const currentIdx = STATUS_ORDER.indexOf(status);
  const prevStatus = currentIdx > 0 ? STATUS_ORDER[currentIdx - 1] : null;
  const nextStatus = currentIdx < STATUS_ORDER.length - 1 ? STATUS_ORDER[currentIdx + 1] : null;

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    if (onDragStart) onDragStart(task);
  };

  return (
    <div
      id={`task-card-${id}`}
      draggable
      onDragStart={handleDragStart}
      className="task-card-item glass-panel"
      style={{
        padding: '14px',
        marginBottom: '12px',
        cursor: 'grab',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)'
      }}
      onClick={(e) => {
        if (e.target.closest('.move-btn')) return;
        onOpenTask(task);
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'var(--border-highlight)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border-color)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Top Header: Priority Badge & Drag Handle & Move Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <GripVertical size={14} style={{ color: 'var(--text-dim)', cursor: 'grab' }} />
          <span className={`badge badge-${priority || 'medium'}`}>
            {priority || 'medium'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          {prevStatus && (
            <button
              className="btn-icon move-btn"
              onClick={(e) => {
                e.stopPropagation();
                onMoveTask(id, prevStatus);
              }}
              title={`Move to ${prevStatus.replace('_', ' ')}`}
              style={{ width: '24px', height: '24px', borderRadius: '6px' }}
            >
              <ChevronLeft size={13} />
            </button>
          )}
          {nextStatus && (
            <button
              className="btn-icon move-btn"
              onClick={(e) => {
                e.stopPropagation();
                onMoveTask(id, nextStatus);
              }}
              title={`Move to ${nextStatus.replace('_', ' ')}`}
              style={{ width: '24px', height: '24px', borderRadius: '6px' }}
            >
              <ChevronRight size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Task Title */}
      <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 6px 0', lineHeight: 1.4 }}>
        {title}
      </h4>

      {/* Description Snippet */}
      {description && (
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 10px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
          {description}
        </p>
      )}

      {/* Tags Pill Stack */}
      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
          {tags.map((tag, idx) => (
            <span
              key={idx}
              style={{
                fontSize: '10px',
                fontWeight: 600,
                padding: '1px 6px',
                borderRadius: '4px',
                background: 'rgba(99, 102, 241, 0.1)',
                color: 'var(--primary)',
                border: '1px solid rgba(99, 102, 241, 0.2)'
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer Details */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: 'var(--text-dim)' }}>
          {due_date && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={12} /> {due_date}
            </span>
          )}
          {subtasks.length > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: completedSubtasks === subtasks.length ? 'var(--accent-emerald)' : 'var(--text-dim)' }}>
              <CheckSquare size={12} /> {completedSubtasks}/{subtasks.length}
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MessageSquare size={12} /> {comment_count}
          </span>
        </div>

        {/* Assignee Avatar */}
        {assignee ? (
          <img
            src={assignee.avatar}
            alt={assignee.name}
            title={`Assigned to ${assignee.name}`}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '1.5px solid var(--primary)'
            }}
          />
        ) : (
          <div
            title="Unassigned"
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'rgba(148, 163, 184, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px dashed var(--border-color)'
            }}
          >
            <User size={12} style={{ color: 'var(--text-dim)' }} />
          </div>
        )}
      </div>
    </div>
  );
}
