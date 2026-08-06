import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Search, UserPlus, Check } from 'lucide-react';
import Avatar from './ui/Avatar';

export default function AddMemberModal({ isOpen, project, onClose, onAddMember }) {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers]             = useState([]);
  const [addingId, setAddingId]       = useState(null);

  useEffect(() => {
    if (isOpen && token) {
      fetch(`/api/auth/users?query=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => { if (data.users) setUsers(data.users); })
        .catch(console.error);
    }
  }, [isOpen, searchQuery, token]);

  useEffect(() => {
    if (!isOpen) return;
    const handle = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [isOpen, onClose]);

  if (!isOpen || !project) return null;

  const currentMemberIds = (project.members || []).map(m => m.user_id);

  const handleAdd = async (userId) => {
    setAddingId(userId);
    try { await onAddMember(project.id, userId); }
    catch (err) { console.error(err); }
    finally { setAddingId(null); }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Add team member">
      <div className="modal-panel animate-fade-in" style={{ width: '100%', maxWidth: 460 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--info-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus size={16} style={{ color: 'var(--color-info)' }} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>Add team member</h3>
          </div>
          <button onClick={onClose} className="btn btn-icon" aria-label="Close" style={{ width: 32, height: 32 }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: 24 }}>
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
            <input
              type="text" className="input"
              placeholder="Search platform users..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: 32, fontSize: 13 }} autoFocus
              aria-label="Search users"
            />
          </div>

          {/* User list */}
          <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {users.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', fontSize: 13, color: 'var(--text-3)' }}>No users found</div>
            )}
            {users.map(u => {
              const isMember = currentMemberIds.includes(u.id);
              return (
                <div key={u.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: 'var(--radius-md)',
                  background: 'var(--surface-3)', border: '1px solid var(--border)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar src={u.avatar} name={u.name} size="sm" />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{u.email}</div>
                    </div>
                  </div>
                  {isMember ? (
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Check size={13} /> Member
                    </span>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={addingId === u.id}
                      onClick={() => handleAdd(u.id)}
                    >
                      {addingId === u.id ? 'Adding...' : 'Add'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
