import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Calendar, User, Tag, Flag, CheckSquare, Plus, Trash2, MessageSquare, Send, Edit3, Save } from 'lucide-react';
import { PriorityBadge, StatusBadge } from './ui/Badge';
import Avatar from './ui/Avatar';

// Correct API paths:
// GET    /api/comments/task/:taskId
// POST   /api/comments/task/:taskId
// GET    /api/projects/:projectId/tasks/:taskId/subtasks  (via task data)
// POST   /api/projects/:projectId/tasks/:taskId/subtasks
// PATCH  /api/projects/:projectId/tasks/:taskId/subtasks/:subId/toggle
// DELETE /api/projects/:projectId/tasks/:taskId/subtasks/:subId
// PATCH  /api/projects/:projectId/tasks/:taskId  (update task)

const STATUSES   = ['todo', 'in_progress', 'review', 'done'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

function timeAgo(d) {
  const diff = (Date.now() - new Date(d)) / 1000;
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function TaskModal({ task, projectId, projectMembers = [], onClose, onUpdateTask, onDeleteTask }) {
  const { token, user } = useAuth();
  const [taskData, setTaskData]   = useState(task);
  const [comments, setComments]   = useState([]);
  const [newComment, setNewComment] = useState('');
  const [subtasks, setSubtasks]   = useState([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [posting, setPosting]     = useState(false);
  const [editing, setEditing]     = useState(false);
  const [editTitle, setEditTitle] = useState(task?.title || '');
  const [editDesc, setEditDesc]   = useState(task?.description || '');
  const commentsEndRef             = useRef(null);

  // Load comments & subtasks using correct API paths
  useEffect(() => {
    if (!task || !token) return;
    // Comments: /api/comments/task/:taskId
    fetch(`/api/comments/task/${task.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (d.comments) setComments(d.comments); }).catch(console.error);
    // Subtasks come embedded in the task data already
    if (task.subtasks) setSubtasks(task.subtasks);
  }, [task?.id, token]);

  useEffect(() => {
    if (!task) return;
    setTaskData(task);
    setEditTitle(task.title || '');
    setEditDesc(task.description || '');
  }, [task]);

  // ESC to close
  useEffect(() => {
    const handle = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [onClose]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  if (!task) return null;

  const updateField = async (field, value) => {
    // Map frontend field names to backend field names
    const backendField = field === 'assignee_id' ? 'assigned_to' : field;
    setTaskData(p => ({ ...p, [field]: value }));
    try { await onUpdateTask(task.id, { [backendField]: value }); }
    catch (e) { console.error(e); }
  };

  const handleSaveEdit = async () => {
    await onUpdateTask(task.id, { title: editTitle, description: editDesc });
    setTaskData(p => ({ ...p, title: editTitle, description: editDesc }));
    setEditing(false);
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      // Correct path: /api/comments/task/:taskId
      const res = await fetch(`/api/comments/task/${task.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: newComment.trim() })
      });
      const data = await res.json();
      if (data.comment) { setComments(p => [...p, data.comment]); setNewComment(''); }
    } catch (e) { console.error(e); }
    finally { setPosting(false); }
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    try {
      // Correct path: /api/projects/:pid/tasks/:tid/subtasks
      const res = await fetch(`/api/projects/${projectId}/tasks/${task.id}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: newSubtask.trim() })
      });
      const data = await res.json();
      // Backend returns { task } with updated subtasks array
      if (data.task?.subtasks) { setSubtasks(data.task.subtasks); setNewSubtask(''); }
    } catch (e) { console.error(e); }
  };

  const handleToggleSubtask = async (sub) => {
    setSubtasks(p => p.map(s => s.id === sub.id ? { ...s, completed: !s.completed } : s));
    try {
      // Correct path: /api/projects/:pid/tasks/:tid/subtasks/:sid/toggle
      const res = await fetch(`/api/projects/${projectId}/tasks/${task.id}/subtasks/${sub.id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.task?.subtasks) setSubtasks(data.task.subtasks);
    } catch (e) { console.error(e); }
  };

  const handleDeleteSubtask = async (subId) => {
    setSubtasks(p => p.filter(s => s.id !== subId));
    try {
      // Correct path: /api/projects/:pid/tasks/:tid/subtasks/:sid
      await fetch(`/api/projects/${projectId}/tasks/${task.id}/subtasks/${subId}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) { console.error(e); }
  };

  const completedSubs = subtasks.filter(s => s.completed).length;

  const sectionLabel = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 };
  const selectStyle  = { background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '6px 10px', color: 'var(--text-1)', fontSize: 12, cursor: 'pointer', outline: 'none', fontFamily: 'inherit', width: '100%' };

  return (
    <>
      {/* Backdrop */}
      <div className="task-panel-overlay" onClick={onClose} />
      {/* Panel */}
      <div className="task-panel" role="dialog" aria-modal="true" aria-label={`Task: ${taskData.title}`}>
        {/* Panel header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <PriorityBadge priority={taskData.priority} />
            <StatusBadge status={taskData.status} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => { if (window.confirm('Delete this task?')) { onDeleteTask(task.id); onClose(); } }}
              aria-label="Delete task"
              style={{ gap: 5 }}
            >
              <Trash2 size={13} /> Delete
            </button>
            <button onClick={onClose} className="btn btn-icon" aria-label="Close task panel" style={{ width: 32, height: 32 }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Panel body — two columns */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 340px', overflow: 'hidden' }}>
          {/* LEFT — Details */}
          <div style={{ overflowY: 'auto', padding: '24px' }}>
            {/* Title */}
            {editing ? (
              <div style={{ marginBottom: 20 }}>
                <input
                  className="input"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}
                  autoFocus
                />
                <textarea
                  className="input textarea"
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  rows={3}
                  placeholder="Description..."
                  style={{ fontSize: 14 }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button className="btn btn-primary btn-sm" onClick={handleSaveEdit} style={{ gap: 5 }}>
                    <Save size={13} /> Save
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-1)', margin: 0, lineHeight: 1.3, flex: 1, letterSpacing: '-0.02em' }}>
                    {taskData.title}
                  </h2>
                  <button
                    className="btn btn-icon btn-sm"
                    onClick={() => setEditing(true)}
                    aria-label="Edit task title and description"
                    style={{ flexShrink: 0, marginTop: 2 }}
                    title="Edit"
                  >
                    <Edit3 size={14} />
                  </button>
                </div>
                {taskData.description ? (
                  <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.65, margin: 0 }}>{taskData.description}</p>
                ) : (
                  <p style={{ fontSize: 13, color: 'var(--text-3)', fontStyle: 'italic', margin: 0 }}>No description — click edit to add one.</p>
                )}
              </div>
            )}

            {/* Properties grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16 }}>
              {/* Status */}
              <div>
                <div style={sectionLabel}><Flag size={11} /> Status</div>
                <select style={selectStyle} value={taskData.status} onChange={e => updateField('status', e.target.value)} aria-label="Status">
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>

              {/* Priority */}
              <div>
                <div style={sectionLabel}><Flag size={11} /> Priority</div>
                <select style={selectStyle} value={taskData.priority} onChange={e => updateField('priority', e.target.value)} aria-label="Priority">
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {/* Assignee */}
              <div>
                <div style={sectionLabel}><User size={11} /> Assignee</div>
                <select style={selectStyle} value={taskData.assignee_id || ''} onChange={e => updateField('assignee_id', e.target.value || null)} aria-label="Assignee">
                  <option value="">Unassigned</option>
                  {projectMembers.map(m => <option key={m.user_id} value={m.user_id}>{m.name}</option>)}
                </select>
              </div>

              {/* Due date */}
              <div>
                <div style={sectionLabel}><Calendar size={11} /> Due date</div>
                <input
                  type="date" style={selectStyle}
                  value={taskData.due_date || ''}
                  onChange={e => updateField('due_date', e.target.value || null)}
                  aria-label="Due date"
                />
              </div>
            </div>

            {/* Tags */}
            {taskData.tags && taskData.tags.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={sectionLabel}><Tag size={11} /> Tags</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {taskData.tags.map((tag, i) => <span key={i} className="tag-chip">#{tag}</span>)}
                </div>
              </div>
            )}

            {/* Subtasks */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={sectionLabel}>
                  <CheckSquare size={11} />
                  Subtasks {subtasks.length > 0 && <span style={{ color: 'var(--primary)' }}>({completedSubs}/{subtasks.length})</span>}
                </div>
              </div>
              {subtasks.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div className="progress-bar" style={{ marginBottom: 12 }}>
                    <div className="progress-bar-fill success" style={{ width: `${subtasks.length > 0 ? (completedSubs / subtasks.length) * 100 : 0}%` }} />
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                {subtasks.map(sub => (
                  <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                    <input
                      type="checkbox" id={`sub-${sub.id}`}
                      checked={sub.completed} onChange={() => handleToggleSubtask(sub)}
                      style={{ accentColor: 'var(--primary)', width: 15, height: 15, cursor: 'pointer', flexShrink: 0 }}
                    />
                    <label htmlFor={`sub-${sub.id}`} style={{ flex: 1, fontSize: 13, color: sub.completed ? 'var(--text-3)' : 'var(--text-1)', textDecoration: sub.completed ? 'line-through' : 'none', cursor: 'pointer' }}>
                      {sub.title}
                    </label>
                    <button onClick={() => handleDeleteSubtask(sub.id)} className="btn btn-icon" style={{ width: 24, height: 24, color: 'var(--text-3)' }} aria-label="Delete subtask">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddSubtask} style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text" className="input" style={{ fontSize: 13, flex: 1 }}
                  placeholder="Add a subtask..."
                  value={newSubtask} onChange={e => setNewSubtask(e.target.value)}
                  aria-label="New subtask"
                />
                <button type="submit" className="btn btn-secondary btn-sm" disabled={!newSubtask.trim()} aria-label="Add subtask" style={{ gap: 4 }}>
                  <Plus size={13} /> Add
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT — Comments */}
          <div style={{ borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                <MessageSquare size={13} />
                Comments {comments.length > 0 && <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{comments.length}</span>}
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {comments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 12px', color: 'var(--text-3)', fontSize: 12 }}>
                  <MessageSquare size={24} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                  No comments yet
                </div>
              ) : (
                comments.map(c => (
                  <div key={c.id} className="comment">
                    <Avatar src={c.author?.avatar} name={c.author?.name} size="sm" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }}>{c.author?.name || 'User'}</span>
                        <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{timeAgo(c.created_at)}</span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0, lineHeight: 1.5, wordBreak: 'break-word' }}>{c.content}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={commentsEndRef} />
            </div>

            {/* Comment input */}
            <form onSubmit={handlePostComment} style={{ padding: 12, borderTop: '1px solid var(--border)', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <Avatar src={user?.avatar} name={user?.name} size="sm" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, position: 'relative' }}>
                  <textarea
                    className="input textarea"
                    rows={2}
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePostComment(e); } }}
                    style={{ fontSize: 13, resize: 'none', paddingRight: 42 }}
                    aria-label="Comment text"
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={posting || !newComment.trim()}
                    style={{ position: 'absolute', right: 6, bottom: 6, width: 30, height: 30, padding: 0 }}
                    aria-label="Post comment"
                  >
                    <Send size={13} />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
