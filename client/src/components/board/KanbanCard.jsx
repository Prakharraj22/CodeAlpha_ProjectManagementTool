import React from 'react';
import { Calendar, MessageSquare, CheckSquare, GripVertical } from 'lucide-react';
import { PriorityBadge } from '../ui/Badge';
import Avatar from '../ui/Avatar';

const STATUS_ORDER = ['todo', 'in_progress', 'review', 'done'];

export default function KanbanCard({ task, onOpenTask, onMoveTask, onDragStart }) {
  const { id, title, description, priority, status, due_date, assignee, comment_count = 0, subtasks = [], tags = [] } = task;

  const completedSubs = subtasks.filter(s => s.completed).length;

  const isOverdue = due_date && new Date(due_date) < new Date() && status !== 'done';

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', String(id));
    e.dataTransfer.effectAllowed = 'move';
    if (onDragStart) onDragStart(task);
  };

  return (
    <div
      id={`task-card-${id}`}
      draggable
      onDragStart={handleDragStart}
      className={`task-card priority-${priority || 'medium'}`}
      onClick={(e) => {
        if (e.target.closest('[data-move-btn]')) return;
        onOpenTask(task);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onOpenTask(task)}
      aria-label={`Task: ${title}. Priority: ${priority}. Click to open.`}
      style={{ paddingLeft: 14 }}
    >
      {/* Priority + badges */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <PriorityBadge priority={priority} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <GripVertical size={13} style={{ color: 'var(--text-4)', cursor: 'grab' }} />
        </div>
      </div>

      {/* Title */}
      <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', margin: '0 0 5px', lineHeight: 1.45 }}>
        {title}
      </h4>

      {/* Description snippet */}
      {description && (
        <p className="line-clamp-2" style={{ fontSize: 12, color: 'var(--text-2)', margin: '0 0 8px', lineHeight: 1.45 }}>
          {description}
        </p>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
          {tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="tag-chip">#{tag}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border)', marginTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: 'var(--text-3)' }}>
          {due_date && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: isOverdue ? 'var(--color-error)' : 'var(--text-3)' }}>
              <Calendar size={11} /> {due_date}
            </span>
          )}
          {subtasks.length > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: completedSubs === subtasks.length ? 'var(--color-success)' : 'var(--text-3)' }}>
              <CheckSquare size={11} /> {completedSubs}/{subtasks.length}
            </span>
          )}
          {comment_count > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <MessageSquare size={11} /> {comment_count}
            </span>
          )}
        </div>

        {assignee ? (
          <Avatar src={assignee.avatar} name={assignee.name} size="sm" title={`Assigned to ${assignee.name}`} style={{ border: '1.5px solid var(--primary-border)', flexShrink: 0 }} />
        ) : (
          <div style={{ width: 24, height: 24, borderRadius: '50%', border: '1.5px dashed var(--border-medium)', flexShrink: 0 }} title="Unassigned" />
        )}
      </div>
    </div>
  );
}
