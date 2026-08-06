import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Folder, CheckSquare, Plus, Sun, Moon, LayoutDashboard, X, ArrowRight } from 'lucide-react';

export default function CommandPalette({ isOpen, onClose, projects = [], onSelectProject, onCreateProject, onCreateTask, onToggleTheme, isDarkMode }) {
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [isOpen]);

  // Keyboard shortcut
  useEffect(() => {
    const handle = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : null;
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [isOpen, onClose]);

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  const actions = [
    { id: 'create-project', icon: Plus,           color: 'var(--primary)',       label: 'New project',                shortcut: 'Action', onSelect: () => { onCreateProject(); onClose(); } },
    { id: 'create-task',    icon: CheckSquare,     color: 'var(--color-warning)', label: 'New task',                   shortcut: 'Action', onSelect: () => { onCreateTask(); onClose(); } },
    { id: 'dashboard',      icon: LayoutDashboard, color: 'var(--color-info)',    label: 'Go to Dashboard',            shortcut: 'Nav',    onSelect: () => { onSelectProject(null); onClose(); } },
    { id: 'theme',          icon: isDarkMode ? Sun : Moon, color: '#fbbf24',     label: `${isDarkMode ? 'Light' : 'Dark'} mode`, shortcut: 'Theme', onSelect: () => { onToggleTheme(); onClose(); } },
  ];

  const projectItems = filteredProjects.map(p => ({
    id: `proj-${p.id}`,
    icon: Folder,
    color: 'var(--color-info)',
    label: p.name,
    meta: `${p.completed_task_count || 0}/${p.task_count || 0} done`,
    onSelect: () => { onSelectProject(p.id); onClose(); }
  }));

  const allItems = [...(query ? [] : actions), ...projectItems];
  const showActions = !query;

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, allItems.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter') {
        e.preventDefault();
        allItems[activeIdx]?.onSelect();
      }
      if (e.key === 'Escape') { onClose(); }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [isOpen, allItems, activeIdx, onClose]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  if (!isOpen) return null;

  return (
    <div className="command-overlay" onClick={onClose}>
      <div className="command-panel" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Command palette">
        {/* Search input */}
        <div style={{ position: 'relative', borderBottom: '1px solid var(--border)' }}>
          <Search size={17} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
          <input
            ref={inputRef}
            className="command-input"
            placeholder="Search projects or type a command..."
            value={query}
            onChange={e => { setQuery(e.target.value); setActiveIdx(0); }}
            aria-label="Command search"
          />
          <button
            onClick={onClose}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 4 }}
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Items */}
        <div className="command-list" ref={listRef}>
          {showActions && (
            <>
              <div className="command-section-label">Quick actions</div>
              {actions.map((item, i) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    data-idx={i}
                    className={`command-item ${activeIdx === i ? 'active' : ''}`}
                    onClick={item.onSelect}
                    onMouseEnter={() => setActiveIdx(i)}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={14} style={{ color: item.color }} />
                    </div>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    <span className="command-shortcut">{item.shortcut}</span>
                  </button>
                );
              })}
            </>
          )}

          {/* Projects */}
          <div className="command-section-label">
            {query ? `Projects matching "${query}"` : `All projects (${projects.length})`}
          </div>
          {projectItems.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
              No projects found
            </div>
          ) : (
            projectItems.map((item, i) => {
              const absIdx = showActions ? actions.length + i : i;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  data-idx={absIdx}
                  className={`command-item ${activeIdx === absIdx ? 'active' : ''}`}
                  onClick={item.onSelect}
                  onMouseEnter={() => setActiveIdx(absIdx)}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--info-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={14} style={{ color: 'var(--color-info)' }} />
                  </div>
                  <span style={{ flex: 1, fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{item.meta}</span>
                  <ArrowRight size={13} style={{ color: 'var(--text-3)' }} />
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="command-footer">
          <span>↑↓ Navigate &nbsp;·&nbsp; Enter Select &nbsp;·&nbsp; Esc Close</span>
          <span>⌘K to open</span>
        </div>
      </div>
    </div>
  );
}
