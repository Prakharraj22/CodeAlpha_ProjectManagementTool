import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = '520px', showClose = true }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    setTimeout(() => {
      const el = panelRef.current?.querySelector('input, button, textarea, select');
      el?.focus();
    }, 50);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div
        ref={panelRef}
        className="modal-panel animate-fade-in"
        style={{ width: '100%', maxWidth }}
        onClick={e => e.stopPropagation()}
      >
        {(title || showClose) && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            {title && <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>{title}</h3>}
            {showClose && (
              <button className="btn btn-icon" onClick={onClose} aria-label="Close modal" style={{ width: 32, height: 32 }}>
                <X size={16} />
              </button>
            )}
          </div>
        )}
        <div style={{ padding: '24px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
