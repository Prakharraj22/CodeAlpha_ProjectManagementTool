import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import KanbanColumn from '../components/board/KanbanColumn';
import TaskModal from '../components/TaskModal';
import CreateTaskModal from '../components/CreateTaskModal';
import AddMemberModal from '../components/AddMemberModal';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { AvatarStack } from '../components/ui/Avatar';

const STATUSES = ['todo', 'in_progress', 'review', 'done'];

export default function ProjectBoard() {
  const { projectId } = useParams();           // keep as string — no parseInt!
  const navigate      = useNavigate();
  const { token, user } = useAuth();
  const { socket }    = useSocket();

  const [project, setProject]               = useState(null);
  const [tasks, setTasks]                   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [selectedTask, setSelectedTask]     = useState(null);
  const [createStatus, setCreateStatus]     = useState('todo');
  const [isCreateOpen, setIsCreateOpen]     = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [searchFilter, setSearchFilter]     = useState('');

  // Fetch project + tasks
  const fetchAll = useCallback(() => {
    if (!token || !projectId) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetch(`/api/projects/${projectId}`,       { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`/api/projects/${projectId}/tasks`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([pData, tData]) => {
      if (pData.project) setProject(pData.project);
      if (tData.tasks)   setTasks(tData.tasks);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [token, projectId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Socket — no selectedTask in deps
  useEffect(() => {
    if (!socket || !projectId) return;
    socket.emit('project:join', { projectId });

    const onTaskCreated  = (t)   => setTasks(p => p.some(x => x.id === t.id) ? p : [t, ...p]);
    const onTaskUpdated  = (t)   => setTasks(p => p.map(x => x.id === t.id ? { ...x, ...t } : x));
    const onTaskDeleted  = (data) => {
      const tId = data?.taskId || data;
      setTasks(p => p.filter(x => x.id !== tId));
    };
    const onMemberAdded = () => fetchAll();

    socket.on('task:created', onTaskCreated);
    socket.on('task:updated', onTaskUpdated);
    socket.on('task:deleted', onTaskDeleted);
    socket.on('member:added', onMemberAdded);

    return () => {
      socket.emit('project:leave', { projectId });
      socket.off('task:created', onTaskCreated);
      socket.off('task:updated', onTaskUpdated);
      socket.off('task:deleted', onTaskDeleted);
      socket.off('member:added', onMemberAdded);
    };
  }, [socket, projectId, fetchAll]);

  // Task CRUD
  const handleCreateTask = useCallback(async (data) => {
    // Backend uses 'assigned_to' not 'assignee_id'
    const payload = { ...data };
    if ('assignee_id' in payload) { payload.assigned_to = payload.assignee_id; delete payload.assignee_id; }
    const res = await fetch(`/api/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    const d = await res.json();
    if (d.task) setTasks(p => [d.task, ...p]);
  }, [token, projectId]);

  const handleUpdateTask = useCallback(async (taskId, data) => {
    // Backend uses 'assigned_to' not 'assignee_id'
    const payload = { ...data };
    if ('assignee_id' in payload) { payload.assigned_to = payload.assignee_id; delete payload.assignee_id; }
    const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    const d = await res.json();
    if (d.task) setTasks(p => p.map(t => t.id === taskId ? { ...t, ...d.task } : t));
    return d.task;
  }, [token, projectId]);

  const handleDeleteTask = useCallback(async (taskId) => {
    await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setTasks(p => p.filter(t => t.id !== taskId));
  }, [token, projectId]);

  const handleDrop = useCallback((taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;
    handleUpdateTask(taskId, { status: newStatus });
  }, [tasks, handleUpdateTask]);

  const handleAddMember = useCallback(async (projId, userId) => {
    const res = await fetch(`/api/projects/${projId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ user_id: userId })
    });
    const d = await res.json();
    if (d.project) setProject(d.project);
  }, [token]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (assigneeFilter !== 'all' && String(t.assigned_to) !== String(assigneeFilter)) return false;
      if (searchFilter && !t.title.toLowerCase().includes(searchFilter.toLowerCase())) return false;
      return true;
    });
  }, [tasks, priorityFilter, assigneeFilter, searchFilter]);

  const tasksByStatus = useMemo(() => {
    const map = {};
    STATUSES.forEach(s => { map[s] = filteredTasks.filter(t => t.status === s); });
    return map;
  }, [filteredTasks]);

  const totalDone  = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;
  const progress   = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;

  if (!loading && !project) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16 }}>
        <p style={{ color: 'var(--text-2)', fontSize: 15 }}>Project not found.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Board header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface-1)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => navigate('/')} className="btn btn-icon" aria-label="Back to dashboard" title="Dashboard">
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-1)', margin: 0, letterSpacing: '-0.02em' }}>
                {project?.name || '…'}
              </h1>
              {project?.description && (
                <p style={{ fontSize: 12, color: 'var(--text-2)', margin: '2px 0 0' }}>{project.description}</p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AvatarStack users={project?.members || []} max={5} />
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setIsAddMemberOpen(true)}
              id="add-member-btn"
              style={{ gap: 5 }}
            >
              <UserPlus size={14} /> Add member
            </button>
          </div>
        </div>

        {/* Progress + filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 160 }}>
            <div className="progress-bar" style={{ flex: 1, height: 5 }}>
              <div className="progress-bar-fill primary" style={{ width: `${progress}%` }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', whiteSpace: 'nowrap' }}>
              {totalDone}/{totalTasks} · {progress}%
            </span>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <input
              type="text" className="input"
              style={{ width: 160, fontSize: 12 }}
              placeholder="Search tasks..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              aria-label="Search tasks"
            />
            <select className="input select" style={{ width: 130, fontSize: 12 }} value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} aria-label="Filter by priority">
              <option value="all">All priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select className="input select" style={{ width: 140, fontSize: 12 }} value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)} aria-label="Filter by assignee">
              <option value="all">All assignees</option>
              <option value={String(user?.id)}>Mine</option>
              {(project?.members || []).map(m => (
                <option key={m.user_id} value={String(m.user_id)}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Kanban board */}
      <div style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', padding: '20px 24px' }}>
        <div className="kanban-board" style={{ minHeight: 'calc(100% - 0px)' }}>
          {STATUSES.map(status => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={tasksByStatus[status] || []}
              loading={loading}
              onOpenTask={t => setSelectedTask(t)}
              onDropTask={handleDrop}
              onCreateTask={s => { setCreateStatus(s); setIsCreateOpen(true); }}
            />
          ))}
        </div>
      </div>

      {/* Task slide panel */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          projectId={projectId}
          projectMembers={project?.members || []}
          onClose={() => setSelectedTask(null)}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      )}

      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateTask={handleCreateTask}
        projectMembers={project?.members || []}
        initialStatus={createStatus}
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
