import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Search, Check, FolderPlus } from 'lucide-react';

export default function CreateProjectModal({ isOpen, onClose, onCreateProject }) {
  const { token, user: currentUser } = useAuth();
  const [name, setName]                   = useState('');
  const [description, setDescription]     = useState('');
  const [searchQuery, setSearchQuery]     = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loading, setLoading]             = useState(false);

  useEffect(() => {
    if (!isOpen) { setName(''); setDescription(''); setSelectedUserIds([]); setSearchQuery(''); }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && token) {
      fetch(`/api/auth/users?query=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => { if (data.users) setAvailableUsers(data.users.filter(u => u.id !== currentUser?.id)); })
        .catch(console.error);
    }
  }, [isOpen, searchQuery, token, currentUser]);

  useEffect(() => {
    if (!isOpen) return;
    const handle = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleUser = (uid) => setSelectedUserIds(p => p.includes(uid) ? p.filter(i => i !== uid) : [...p, uid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onCreateProject({ name: name.trim(), description: description.trim(), member_ids: selectedUserIds });
      onClose();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Create project">
      <div className="modal-panel animate-fade-in" style={{ width: '100%', maxWidth: 540 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FolderPlus size={16} style={{ color: 'var(--primary)' }} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>Create new project</h3>
          </div>
          <button onClick={onClose} className="btn btn-icon" aria-label="Close" style={{ width: 32, height: 32 }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: 24 }}>
          <form onSubmit={handleSubmit}>
            <div className="form-field" style={{ marginBottom: 16 }}>
              <label className="form-label" htmlFor="proj-name">Project name *</label>
              <input
                id="proj-name" type="text" className="input"
                placeholder="e.g. Q4 Marketing Campaign"
                value={name} onChange={e => setName(e.target.value)} required autoFocus
              />
            </div>

            <div className="form-field" style={{ marginBottom: 20 }}>
              <label className="form-label" htmlFor="proj-desc">Description</label>
              <textarea
                id="proj-desc" className="input textarea"
                rows={3} placeholder="What's the main goal of this project?"
                value={description} onChange={e => setDescription(e.target.value)}
              />
            </div>

            {/* Members */}
            <div className="form-field" style={{ marginBottom: 24 }}>
              <label className="form-label">Invite collaborators</label>
              <div style={{ position: 'relative', marginBottom: 10 }}>
                <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
                <input
                  type="text" className="input"
                  placeholder="Search by name or email..."
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: 32, fontSize: 13 }}
                  aria-label="Search users to invite"
                />
              </div>
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', maxHeight: 180, overflowY: 'auto' }}>
                {availableUsers.length === 0 ? (
                  <div style={{ padding: '14px', textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>No users found</div>
                ) : availableUsers.map(u => {
                  const selected = selectedUserIds.includes(u.id);
                  return (
                    <button
                      type="button" key={u.id}
                      onClick={() => toggleUser(u.id)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        width: '100%', padding: '9px 12px', background: selected ? 'var(--primary-subtle)' : 'transparent',
                        border: 'none', cursor: 'pointer', borderBottom: '1px solid var(--border)',
                        transition: 'background 0.12s'
                      }}
                      aria-pressed={selected}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img src={u.avatar} alt={u.name} style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0 }} />
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{u.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{u.email}</div>
                        </div>
                      </div>
                      <div style={{
                        width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                        background: selected ? 'var(--primary)' : 'transparent',
                        border: `1.5px solid ${selected ? 'var(--primary)' : 'var(--border-medium)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s'
                      }}>
                        {selected && <Check size={12} color="#fff" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              {selectedUserIds.length > 0 && (
                <p style={{ fontSize: 12, color: 'var(--primary)', marginTop: 6, fontWeight: 600 }}>
                  {selectedUserIds.length} member{selectedUserIds.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" id="create-project-submit-btn" className="btn btn-primary" disabled={loading || !name.trim()}>
                {loading ? 'Creating...' : 'Create project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
