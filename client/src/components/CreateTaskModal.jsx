import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, ListTodo } from 'lucide-react';
import { StatusBadge, PriorityBadge } from './ui/Badge';

const STATUSES  = ['todo', 'in_progress', 'review', 'done'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export default function CreateTaskModal({ isOpen, onClose, onCreateTask, projectMembers = [], initialStatus = 'todo' }) {
  const { user } = useAuth();
  const [title, setTitle]         = useState('');
  const [description, setDesc]    = useState('');
  const [status, setStatus]       = useState(initialStatus);
  const [priority, setPriority]   = useState('medium');
  const [dueDate, setDueDate]     = useState('');
  const [assigneeId, setAssignee] = useState('');
  const [tagsRaw, setTagsRaw]     = useState('');
  const [loading, setLoading]     = useState(false);

  // Fix: reset status when initialStatus changes (React controlled bug fix)
  useEffect(() => { if (isOpen) setStatus(initialStatus); }, [isOpen, initialStatus]);

  // Reset form on close
  useEffect(() => {
    if (!isOpen) {
      setTitle(''); setDesc(''); setPriority('medium');
      setDueDate(''); setAssignee(''); setTagsRaw('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handle = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);
    try {
      await onCreateTask({
        title: title.trim(), description, status, priority,
        due_date: dueDate || null,
        assigned_to: assigneeId || null,   // backend uses assigned_to
        tags
      });
      onClose();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const labelStyle = { fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6, display: 'block' };
  const selectStyle = { width: '100%', background: 'var(--surface-3)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '8px 12px', color: 'var(--text-1)', fontSize: 13, cursor: 'pointer', outline: 'none' };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Create task">
      <div className="modal-panel animate-fade-in" style={{ width: '100%', maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ListTodo size={16} style={{ color: 'var(--primary)' }} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>Create new task</h3>
          </div>
          <button onClick={onClose} className="btn btn-icon" aria-label="Close" style={{ width: 32, height: 32 }}><X size={16} /></button>
        </div>

        <div style={{ padding: 24 }}>
          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle} htmlFor="task-title">Task title *</label>
              <input
                id="task-title" type="text" className="input"
                placeholder="e.g. Set up CI/CD pipeline" value={title}
                onChange={e => setTitle(e.target.value)} required autoFocus
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle} htmlFor="task-desc">Description</label>
              <textarea
                id="task-desc" className="input textarea" rows={3}
                placeholder="Add more context or acceptance criteria..."
                value={description} onChange={e => setDesc(e.target.value)}
              />
            </div>

            {/* Row: Status + Priority */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle} htmlFor="task-status">Status</label>
                <select id="task-status" className="input select" value={status} onChange={e => setStatus(e.target.value)}>
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle} htmlFor="task-priority">Priority</label>
                <select id="task-priority" className="input select" value={priority} onChange={e => setPriority(e.target.value)}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            {/* Row: Assignee + Due date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle} htmlFor="task-assignee">Assignee</label>
                <select id="task-assignee" className="input select" value={assigneeId} onChange={e => setAssignee(e.target.value)}>
                  <option value="">Unassigned</option>
                  {projectMembers.map(m => (
                    <option key={m.user_id} value={m.user_id}>{m.name}{m.user_id === user?.id ? ' (you)' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle} htmlFor="task-due">Due date</label>
                <input id="task-due" type="date" className="input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
            </div>

            {/* Tags */}
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle} htmlFor="task-tags">Tags <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(comma-separated)</span></label>
              <input
                id="task-tags" type="text" className="input"
                placeholder="e.g. backend, api, urgent"
                value={tagsRaw} onChange={e => setTagsRaw(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" id="create-task-submit-btn" className="btn btn-primary" disabled={loading || !title.trim()}>
                {loading ? 'Creating...' : 'Create task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
