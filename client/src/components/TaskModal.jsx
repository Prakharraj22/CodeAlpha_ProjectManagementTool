import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Send, Trash2, CheckSquare, Plus, Activity, Clock, Tag } from 'lucide-react';

export default function TaskModal({ task, projectMembers = [], isOpen, onClose, onUpdateTask, onDeleteTask }) {
  const { user, token } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'todo');
      setPriority(task.priority || 'medium');
      setAssignedTo(task.assigned_to || '');
      setDueDate(task.due_date || '');
      setSubtasks(task.subtasks || []);
      setTagsInput(task.tags ? task.tags.join(', ') : '');

      fetch(`/api/comments/task/${task.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.comments) setComments(data.comments);
        })
        .catch(console.error);
    }
  }, [task, token]);

  if (!isOpen || !task) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const parsedTags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
      await onUpdateTask(task.id, {
        title,
        description,
        status,
        priority,
        tags: parsedTags,
        assigned_to: assignedTo || null,
        due_date: dueDate || null
      });
      onClose();
    } catch (err) {
      console.error('Failed to update task:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    try {
      const res = await fetch(`/api/projects/${task.project_id}/tasks/${task.id}/subtasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: newSubtaskTitle.trim() })
      });
      const data = await res.json();
      if (res.ok && data.task) {
        setSubtasks(data.task.subtasks || []);
        setNewSubtaskTitle('');
      }
    } catch (err) {
      console.error('Failed to add subtask:', err);
    }
  };

  const handleToggleSubtask = async (subtaskId) => {
    try {
      const res = await fetch(`/api/projects/${task.project_id}/tasks/${task.id}/subtasks/${subtaskId}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.task) {
        setSubtasks(data.task.subtasks || []);
      }
    } catch (err) {
      console.error('Failed to toggle subtask:', err);
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    try {
      const res = await fetch(`/api/projects/${task.project_id}/tasks/${task.id}/subtasks/${subtaskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.task) {
        setSubtasks(data.task.subtasks || []);
      }
    } catch (err) {
      console.error('Failed to delete subtask:', err);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentLoading(true);
    try {
      const res = await fetch(`/api/comments/task/${task.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newComment })
      });
      const data = await res.json();
      if (res.ok) {
        setComments(prev => [...prev, data.comment]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  const completedCount = subtasks.filter(s => s.completed).length;
  const progressPercent = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel animate-fade-in"
        style={{
          background: 'var(--bg-modal)',
          border: '1px solid var(--border-highlight)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          display: 'grid',
          gridTemplateColumns: '1fr 360px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side: Task Details & Subtasks */}
        <div style={{ padding: '28px', borderRight: '1px solid var(--border-color)', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Task Card Details
            </span>
            <button
              onClick={() => onDeleteTask(task.id)}
              id="delete-task-btn"
              style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
            >
              <Trash2 size={15} /> Delete Task
            </button>
          </div>

          <form onSubmit={handleSave}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>Title</label>
              <input
                type="text"
                className="input-field"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{ fontSize: '16px', fontWeight: 700 }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>Description</label>
              <textarea
                className="input-field"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add detailed task instructions..."
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Field Controls Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>Status Column</label>
                <select
                  className="input-field"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Under Review</option>
                  <option value="done">Completed</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>Priority Level</label>
                <select
                  className="input-field"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>Assigned Member</label>
                <select
                  className="input-field"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {projectMembers.map(m => (
                    <option key={m.user_id} value={m.user_id}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>Due Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>Tags (comma-separated)</label>
              <input
                type="text"
                className="input-field"
                placeholder="Frontend, WebSockets, Bug"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>

            {/* Subtask Checklist Section */}
            <div style={{ marginBottom: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckSquare size={16} style={{ color: 'var(--primary)' }} /> Subtask Checklist ({completedCount}/{subtasks.length})
                </h4>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>
                  {progressPercent}%
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: '6px', borderRadius: '4px', background: 'rgba(148, 163, 184, 0.15)', overflow: 'hidden', marginBottom: '14px' }}>
                <div style={{ height: '100%', width: `${progressPercent}%`, background: 'var(--primary)', transition: 'width 0.3s ease' }} />
              </div>

              {/* List of Subtasks */}
              <div style={{ marginBottom: '12px' }}>
                {subtasks.map(st => (
                  <div key={st.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', borderRadius: '8px', background: 'rgba(148, 163, 184, 0.05)', marginBottom: '6px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: st.completed ? 'var(--text-muted)' : 'var(--text-main)', textDecoration: st.completed ? 'line-through' : 'none' }}>
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => handleToggleSubtask(st.id)}
                        style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
                      />
                      {st.title}
                    </label>
                    <button
                      type="button"
                      onClick={() => handleDeleteSubtask(st.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Subtask Input */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Add a subtask item..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  style={{ fontSize: '13px', padding: '0.45rem 0.8rem' }}
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="btn-secondary"
                  style={{ padding: '0.45rem 0.8rem', fontSize: '13px' }}
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Comments Stream */}
        <div style={{ background: 'rgba(17, 24, 39, 0.4)', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Discussion Stream
              </h4>
              <button onClick={onClose} className="btn-icon" style={{ width: '28px', height: '28px' }}>
                <X size={16} />
              </button>
            </div>

            {/* Comment Stream */}
            <div style={{ maxHeight: '440px', overflowY: 'auto', paddingRight: '4px', marginBottom: '16px' }}>
              {comments.length === 0 ? (
                <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No comments yet. Start the discussion!
                </div>
              ) : (
                comments.map(c => (
                  <div key={c.id} style={{ marginBottom: '14px', background: 'var(--bg-card)', borderRadius: '12px', padding: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <img
                        src={c.user ? c.user.avatar : 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                        alt={c.user ? c.user.name : 'User'}
                        style={{ width: '22px', height: '22px', borderRadius: '50%' }}
                      />
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
                        {c.user ? c.user.name : 'Unknown User'}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-dim)', marginLeft: 'auto' }}>
                        {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                      {c.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* New Comment Input */}
          <form onSubmit={handlePostComment} style={{ position: 'relative' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              style={{ paddingRight: '46px', fontSize: '13px' }}
            />
            <button
              type="submit"
              disabled={commentLoading || !newComment.trim()}
              style={{
                position: 'absolute',
                right: '6px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'var(--primary)',
                border: 'none',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
