import React from 'react';

export function PriorityBadge({ priority }) {
  const map = {
    urgent: { label: 'Urgent', cls: 'badge-urgent' },
    high:   { label: 'High',   cls: 'badge-high' },
    medium: { label: 'Medium', cls: 'badge-medium' },
    low:    { label: 'Low',    cls: 'badge-low' },
  };
  const cfg = map[priority] || map.medium;
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
}

export function StatusBadge({ status }) {
  const map = {
    todo:        { label: 'To Do',       cls: 'badge-todo' },
    in_progress: { label: 'In Progress', cls: 'badge-in_progress' },
    review:      { label: 'Review',      cls: 'badge-review' },
    done:        { label: 'Done',        cls: 'badge-done' },
  };
  const cfg = map[status] || map.todo;
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
}

export default function Badge({ children, variant = 'primary', className = '' }) {
  return <span className={`badge badge-${variant} ${className}`}>{children}</span>;
}
