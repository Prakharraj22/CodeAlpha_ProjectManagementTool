import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import KanbanCard from './KanbanCard';
import { SkeletonTaskCard } from '../ui/Skeleton';

const COL_CONFIG = {
  todo:        { label: 'To Do',       accent: '#7c6ef6' },
  in_progress: { label: 'In Progress', accent: '#fbbf24' },
  review:      { label: 'Review',      accent: '#22d3ee' },
  done:        { label: 'Done',        accent: '#34d399' },
};

export default function KanbanColumn({ status, tasks = [], loading, onOpenTask, onDropTask, onCreateTask }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const cfg = COL_CONFIG[status] || COL_CONFIG.todo;

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) onDropTask(parseInt(taskId, 10), status);
  };

  return (
    <div
      className={`kanban-column ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="region"
      aria-label={`${cfg.label} column, ${tasks.length} tasks`}
    >
      {/* Column header */}
      <div className="kanban-column-header">
        <div className="kanban-column-title-row">
          <span className="kanban-column-accent" style={{ background: cfg.accent }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.01em' }}>
            {cfg.label}
          </span>
          <span className="kanban-column-count">{tasks.length}</span>
        </div>
        <button
          className="btn btn-icon"
          style={{ width: 28, height: 28, borderRadius: 8 }}
          onClick={() => onCreateTask(status)}
          aria-label={`Add task to ${cfg.label}`}
          title={`Add task to ${cfg.label}`}
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Column body */}
      <div
        className="kanban-column-body"
        style={{ minHeight: 120 }}
      >
        {/* Top accent line */}
        <div style={{ height: 2, borderRadius: 999, background: `${cfg.accent}40`, marginBottom: 10 }} />

        {loading ? (
          [1,2].map(i => <SkeletonTaskCard key={i} />)
        ) : tasks.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-4)', fontSize: 12 }}>
            <div style={{ marginBottom: 4, fontSize: 18 }}>·</div>
            Drop tasks here
          </div>
        ) : (
          tasks.map(task => (
            <KanbanCard
              key={task.id}
              task={task}
              onOpenTask={onOpenTask}
              onDropTask={onDropTask}
            />
          ))
        )}

        {/* Quick add */}
        <button
          className="kanban-quick-add-trigger"
          onClick={() => onCreateTask(status)}
          aria-label={`Quick add task to ${cfg.label}`}
          style={{ marginTop: tasks.length > 0 ? 8 : 0 }}
        >
          <Plus size={13} />
          <span>Add task</span>
        </button>
      </div>
    </div>
  );
}
