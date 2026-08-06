import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import CreateTaskModal from '../components/CreateTaskModal';
import AddMemberModal from '../components/AddMemberModal';
import { Plus, UserPlus, Filter, Search, CheckCircle2, Clock, PlayCircle, AlertCircle, Kanban, Calendar, Activity, X } from 'lucide-react';

const COLUMNS = [
  { id: 'todo', title: 'To Do', icon: Clock, color: '#6366f1', bg: 'var(--column-todo)' },
  { id: 'in_progress', title: 'In Progress', icon: PlayCircle, color: '#f59e0b', bg: 'var(--column-progress)' },
  { id: 'review', title: 'Under Review', icon: AlertCircle, color: '#06b6d4', bg: 'var(--column-review)' },
  { id: 'done', title: 'Completed', icon: CheckCircle2, color: '#10b981', bg: 'var(--column-done)' }
];

export default function ProjectBoard({ projectId, onGoDashboard, onProjectLoaded }) {
  const { user, token } = useAuth();
  const { socket } = useSocket();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & Views
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [createInitialStatus, setCreateInitialStatus] = useState('todo');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [viewMode, setViewMode] = useState('board'); // 'board' | 'calendar'

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  // Drag State
  const [draggedTask, setDraggedTask] = useState(null);
  const [activeDragOverCol, setActiveDragOverCol] = useState(null);

  // Load Data
  const loadProjectData = () => {
    if (!token || !projectId) return;

    Promise.all([
      fetch(`/api/projects/${projectId}`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
      fetch(`/api/projects/${projectId}/tasks`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json())
    ])
      .then(([projData, taskData]) => {
        if (projData.project) {
          setProject(projData.project);
          if (onProjectLoaded) onProjectLoaded(projData.project);
        }
        if (taskData.tasks) {
          setTasks(taskData.tasks);
        }
        if (taskData.activityLogs) {
          setActivityLogs(taskData.activityLogs);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProjectData();
  }, [projectId, token]);

  // Socket.IO Real-time Synchronization
  useEffect(() => {
    if (!socket || !projectId || !user) return;

    socket.emit('project:join', { projectId, userId: user.id });

    const handleTaskCreated = ({ task }) => {
      if (task.project_id === projectId) {
        setTasks(prev => [task, ...prev.filter(t => t.id !== task.id)]);
      }
    };

    const handleTaskUpdated = ({ task }) => {
      if (task.project_id === projectId) {
        setTasks(prev => prev.map(t => t.id === task.id ? task : t));
        if (selectedTask && selectedTask.id === task.id) {
          setSelectedTask(task);
        }
      }
    };

    const handleTaskDeleted = ({ taskId }) => {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(null);
      }
    };

    const handleCommentAdded = ({ taskId }) => {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, comment_count: (t.comment_count || 0) + 1 } : t));
    };

    const handleMemberAdded = ({ members }) => {
      setProject(prev => prev ? { ...prev, members } : prev);
    };

    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:deleted', handleTaskDeleted);
    socket.on('comment:added', handleCommentAdded);
    socket.on('project:member_added', handleMemberAdded);

    return () => {
      socket.emit('project:leave', { projectId });
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:deleted', handleTaskDeleted);
      socket.off('comment:added', handleCommentAdded);
      socket.off('project:member_added', handleMemberAdded);
    };
  }, [socket, projectId, user, selectedTask]);

  // Task Handlers
  const handleCreateTask = async (taskData) => {
    const res = await fetch(`/api/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(taskData)
    });
    const data = await res.json();
    if (res.ok && data.task) {
      setTasks(prev => [data.task, ...prev]);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (res.ok && data.task) {
      setTasks(prev => prev.map(t => t.id === taskId ? data.task : t));
    }
  };

  const handleMoveTask = async (taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    await handleUpdateTask(taskId, { ...task, status: newStatus });
  };

  const handleDeleteTask = async (taskId) => {
    const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setSelectedTask(null);
    }
  };

  const handleAddMember = async (pId, userId) => {
    const res = await fetch(`/api/projects/${pId}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ user_id: userId })
    });
    const data = await res.json();
    if (res.ok && data.members) {
      setProject(prev => prev ? { ...prev, members: data.members } : prev);
    }
  };

  // Drag and Drop Column Handlers
  const handleDragOverColumn = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDragOverCol !== colId) {
      setActiveDragOverCol(colId);
    }
  };

  const handleDropOnColumn = (e, targetStatus) => {
    e.preventDefault();
    setActiveDragOverCol(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      handleMoveTask(taskId, targetStatus);
    }
  };

  // Filtering Logic
  const filteredTasks = tasks.filter(t => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = t.title.toLowerCase().includes(query) ||
      (t.description && t.description.toLowerCase().includes(query)) ||
      (t.tags && t.tags.some(tag => tag.toLowerCase().includes(query)));
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === 'all' || (t.assigned_to === assigneeFilter);
    return matchesSearch && matchesPriority && matchesAssignee;
  });

  if (loading) {
    return (
      <div style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading TaskPulse workspace board...
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--accent-rose)' }}>
        Project not found or workspace access denied.
      </div>
    );
  }

  const members = project.members || [];

  return (
    <div style={{ padding: '24px', maxWidth: '1480px', margin: '0 auto' }}>
      {/* Board Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
              {project.name}
            </h1>
            <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', border: '1px solid rgba(99, 102, 241, 0.3)', fontWeight: 700 }}>
              SaaS Workspace
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            {project.description || 'Collaborative task management workspace.'}
          </p>
        </div>

        {/* Action Controls & Member Avatars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* View Toggle (Board vs Calendar) */}
          <div className="glass-panel" style={{ display: 'flex', padding: '3px', borderRadius: '10px' }}>
            <button
              onClick={() => setViewMode('board')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: viewMode === 'board' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'board' ? '#fff' : 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Kanban size={14} /> Board
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: viewMode === 'calendar' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'calendar' ? '#fff' : 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Calendar size={14} /> Calendar
            </button>
          </div>

          <button
            onClick={() => setIsActivityOpen(!isActivityOpen)}
            className="btn-secondary"
            title="Activity Audit Log"
            style={{ padding: '6px 12px', fontSize: '13px' }}
          >
            <Activity size={15} /> Activity
          </button>

          {/* Member Stack */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {members.map((m, i) => (
              <img
                key={m.id || i}
                src={m.avatar}
                alt={m.name}
                title={`${m.name} (${m.role})`}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--bg-card)',
                  marginLeft: i > 0 ? '-8px' : '0'
                }}
              />
            ))}
          </div>

          <button
            onClick={() => setIsAddMemberOpen(true)}
            id="add-member-btn"
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '13px' }}
          >
            <UserPlus size={15} /> Invite
          </button>

          <button
            onClick={() => {
              setCreateInitialStatus('todo');
              setIsCreateTaskOpen(true);
            }}
            id="new-task-btn"
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            <Plus size={16} /> Add Task
          </button>
        </div>
      </div>

      {/* Filter & Controls Toolbar */}
      <div
        className="glass-panel"
        style={{
          padding: '12px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              id="search-tasks-input"
              className="input-field"
              placeholder="Search tasks, tags, descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '36px', padding: '0.45rem 1rem 0.45rem 2.2rem', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={15} style={{ color: 'var(--text-dim)' }} />
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Priority:</span>
            <select
              className="input-field"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{ width: '130px', padding: '0.4rem 0.8rem', fontSize: '13px' }}
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Assignee:</span>
            <select
              className="input-field"
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              style={{ width: '150px', padding: '0.4rem 0.8rem', fontSize: '13px' }}
            >
              <option value="all">All Members</option>
              {members.map(m => (
                <option key={m.user_id} value={m.user_id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
          Showing {filteredTasks.length} of {tasks.length} tasks
        </div>
      </div>

      {/* Main Board View vs Calendar View */}
      {viewMode === 'board' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(280px, 1fr))',
            gap: '20px',
            alignItems: 'start',
            overflowX: 'auto',
            paddingBottom: '16px'
          }}
        >
          {COLUMNS.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.id);
            const Icon = col.icon;
            const isOver = activeDragOverCol === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOverColumn(e, col.id)}
                onDragLeave={() => setActiveDragOverCol(null)}
                onDrop={(e) => handleDropOnColumn(e, col.id)}
                className={`kanban-column ${isOver ? 'drag-over' : ''}`}
                style={{
                  background: col.bg,
                  border: isOver ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '16px',
                  minHeight: '600px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Column Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon size={16} style={{ color: col.color }} />
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                      {col.title}
                    </h3>
                    <span
                      style={{
                        background: 'rgba(148, 163, 184, 0.15)',
                        color: col.color,
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '10px'
                      }}
                    >
                      {colTasks.length}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setCreateInitialStatus(col.id);
                      setIsCreateTaskOpen(true);
                    }}
                    className="btn-icon"
                    title={`Add Task to ${col.title}`}
                    style={{ width: '28px', height: '28px', borderRadius: '8px' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Task Cards Droppable Container */}
                <div style={{ flex: 1 }}>
                  {colTasks.length === 0 ? (
                    <div
                      style={{
                        border: '1px dashed var(--border-color)',
                        borderRadius: '12px',
                        padding: '32px 12px',
                        textAlign: 'center',
                        color: 'var(--text-dim)',
                        fontSize: '12px'
                      }}
                    >
                      Drag tasks here or click + to add
                    </div>
                  ) : (
                    colTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onOpenTask={setSelectedTask}
                        onMoveTask={handleMoveTask}
                        onDragStart={setDraggedTask}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Calendar Schedule View */
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>
            📅 Project Task Due Dates Timeline
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {filteredTasks.map(t => (
              <div key={t.id} className="glass-panel" style={{ padding: '16px', borderRadius: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>
                  Due: {t.due_date || 'No Date Specified'}
                </div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
                  {t.title}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span className={`badge badge-${t.priority}`}>{t.priority}</span>
                  <span>{t.status.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Audit Log Drawer */}
      {isActivityOpen && (
        <div
          className="glass-panel animate-fade-in"
          style={{
            position: 'fixed',
            right: '24px',
            bottom: '24px',
            width: '360px',
            maxHeight: '480px',
            zIndex: 1500,
            padding: '20px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={16} style={{ color: 'var(--primary)' }} /> Audit Log Trail
            </h4>
            <button onClick={() => setIsActivityOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>

          <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
            {activityLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-dim)', fontSize: '12px' }}>
                No activity logs recorded.
              </div>
            ) : (
              activityLogs.map(l => (
                <div key={l.id} style={{ marginBottom: '10px', fontSize: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-main)', fontWeight: 600 }}>
                    <span>{l.action}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{new Date(l.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>{l.details}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Task Modals */}
      <TaskModal
        task={selectedTask}
        projectMembers={members}
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
      />

      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        initialStatus={createInitialStatus}
        projectMembers={members}
        onClose={() => setIsCreateTaskOpen(false)}
        onCreateTask={handleCreateTask}
      />

      <AddMemberModal
        isOpen={isAddMemberOpen}
        project={project}
        onClose={() => setIsAddMemberOpen(false)}
        onAddMember={handleAddMember}
      />
    </div>
  );
}
