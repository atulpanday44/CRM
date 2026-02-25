import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [noteModal, setNoteModal] = useState(null);
  const [newNote, setNewNote] = useState('');

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'hr';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: '',
    deadline: '',
    priority: 'medium',
    status: 'pending',
  });

  const fetchTasks = async () => {
    try {
      setError('');
      const data = await api.get('/tasks/tasks');
      setTasks(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setTasks([]);
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!isAdmin) return;
    try {
      const data = await api.get('/accounts/users');
      setUsers(Array.isArray(data) ? data : data.results || []);
    } catch {
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [isAdmin]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingTask) {
        const payload = isAdmin
          ? {
              title: formData.title,
              description: formData.description,
              assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : editingTask.assigned_to?.id || editingTask.assigned_to,
              deadline: formData.deadline || null,
              priority: formData.priority,
              status: formData.status,
              progress: formData.status === 'completed' ? 100 : (editingTask.progress || 0),
            }
          : { status: formData.status, progress: formData.progress ?? editingTask.progress ?? 0 };
        await api.patch(`/tasks/tasks/${editingTask.id}`, payload);
      } else {
        const payload = {
          ...formData,
          assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : user?.id,
        };
        await api.post('/tasks/tasks', payload);
      }
      setShowForm(false);
      setEditingTask(null);
      setFormData({ title: '', description: '', assigned_to: '', deadline: '', priority: 'medium', status: 'pending' });
      fetchTasks();
    } catch (err) {
      setError(err.message || 'Failed to save task');
    }
  };

  const handleUpdateStatus = async (task, status, progress) => {
    try {
      await api.patch(`/tasks/tasks/${task.id}`, { status, progress: progress ?? task.progress });
      fetchTasks();
    } catch (err) {
      setError(err.message || 'Failed to update');
    }
  };

  const handleAddNote = async () => {
    if (!noteModal || !newNote.trim()) return;
    try {
      await api.post(`/tasks/tasks/${noteModal.id}/add_note`, { content: newNote });
      setNoteModal(null);
      setNewNote('');
      fetchTasks();
    } catch (err) {
      setError(err.message || 'Failed to add note');
    }
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      assigned_to: task.assigned_to?.id || task.assigned_to,
      deadline: task.deadline || '',
      priority: task.priority || 'medium',
      status: task.status || 'pending',
    });
    setShowForm(true);
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '-');
  const getStatusClass = (s) => ({ pending: 'pending', in_progress: 'progress', completed: 'done', overdue: 'overdue' }[s] || '');

  return (
    <div className="tasks-page">
      <header className="tasks-header">
        <h1>Tasks</h1>
        <p>
          {isAdmin ? 'Assign and monitor tasks across your team' : 'Manage your assigned tasks and update progress'}
        </p>
        {isAdmin && (
          <button className="btn-primary" onClick={() => { setEditingTask(null); setFormData({ title: '', description: '', assigned_to: '', deadline: '', priority: 'medium', status: 'pending' }); setShowForm(true); }}>
            + Assign Task
          </button>
        )}
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">No tasks found. {isAdmin && 'Assign a task to get started.'}</div>
      ) : (
        <div className="tasks-grid">
          {tasks.map((task) => (
            <div key={task.id} className={`task-card ${task.is_overdue ? 'overdue' : ''}`}>
              <div className="task-header">
                <h3>{task.title}</h3>
                <span className={`status-badge ${getStatusClass(task.status)}`}>{task.status?.replace('_', ' ')}</span>
              </div>
              {task.description && <p className="task-desc">{task.description}</p>}
              <div className="task-meta">
                <span>Assignee: {task.assigned_to_detail?.name || task.assigned_to_detail?.username || '-'}</span>
                <span>Deadline: {formatDate(task.deadline)}</span>
                <span>Priority: {task.priority}</span>
              </div>
              <div className="task-progress">
                <label>Progress: {task.progress || 0}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={task.progress || 0}
                  onChange={(e) => handleUpdateStatus(task, task.status, parseInt(e.target.value))}
                  disabled={task.status === 'completed'}
                />
              </div>
              <div className="task-actions">
                {task.status !== 'completed' && (
                  <select
                    value={task.status}
                    onChange={(e) => handleUpdateStatus(task, e.target.value)}
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                )}
                <button className="btn-sm" onClick={() => setNoteModal(task)}>Add Note</button>
                {isAdmin && <button className="btn-sm" onClick={() => openEdit(task)}>Edit</button>}
              </div>
              {task.notes?.length > 0 && (
                <div className="task-notes">
                  <strong>Notes:</strong>
                  {task.notes.slice(0, 2).map((n) => (
                    <div key={n.id} className="note">{n.content}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingTask ? 'Edit Task' : 'Assign New Task'}</h2>
            <form onSubmit={handleSubmit}>
              <label>Title *</label>
              <input name="title" value={formData.title} onChange={handleChange} required />
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} />
              {isAdmin && !editingTask && (
                <>
                  <label>Assign To</label>
                  <select name="assigned_to" value={formData.assigned_to} onChange={handleChange} required={!editingTask}>
                    <option value="">Select employee</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.first_name || u.username} {u.last_name || ''}</option>
                    ))}
                  </select>
                </>
              )}
              <label>Deadline</label>
              <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} />
              <label>Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange}>
                {PRIORITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <div className="modal-buttons">
                <button type="submit" className="btn-primary">Save</button>
                <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {noteModal && (
        <div className="modal-overlay" onClick={() => setNoteModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Work Note - {noteModal.title}</h2>
            <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Enter your update or note..." rows={4} />
            <div className="modal-buttons">
              <button className="btn-primary" onClick={handleAddNote}>Add Note</button>
              <button onClick={() => setNoteModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .tasks-page { padding: 2rem; font-family: 'Segoe UI', sans-serif; }
        .tasks-header { margin-bottom: 1.5rem; }
        .tasks-header h1 { font-size: 1.8rem; color: #1e293b; }
        .tasks-header p { color: #64748b; margin: 0.5rem 0 1rem; }
        .btn-primary { background: #4953ff; color: #fff; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 600; }
        .btn-primary:hover { background: #3d46e0; }
        .btn-sm { padding: 0.4rem 0.8rem; font-size: 0.85rem; border-radius: 6px; border: 1px solid #cbd5e1; background: #fff; cursor: pointer; margin-left: 0.5rem; }
        .btn-sm:hover { background: #f1f5f9; }
        .alert { padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; }
        .alert-error { background: #fee2e2; color: #991b1b; }
        .loading, .empty-state { text-align: center; padding: 3rem; color: #64748b; }
        .tasks-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
        .task-card { background: #fff; border-radius: 12px; padding: 1.25rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid #3b82f6; }
        .task-card.overdue { border-left-color: #ef4444; }
        .task-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
        .task-header h3 { margin: 0; font-size: 1.1rem; }
        .status-badge { padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }
        .status-badge.pending { background: #fef3c7; color: #92400e; }
        .status-badge.progress { background: #dbeafe; color: #1e40af; }
        .status-badge.done { background: #d1fae5; color: #065f46; }
        .status-badge.overdue { background: #fee2e2; color: #991b1b; }
        .task-desc { font-size: 0.9rem; color: #64748b; margin: 0.5rem 0; }
        .task-meta { font-size: 0.85rem; color: #64748b; display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; }
        .task-progress { margin: 0.75rem 0; }
        .task-progress input { width: 100%; }
        .task-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem; }
        .task-notes { margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #e2e8f0; font-size: 0.85rem; }
        .note { margin: 0.25rem 0; color: #475569; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: #fff; padding: 2rem; border-radius: 12px; width: 90%; max-width: 480px; }
        .modal-content label { display: block; margin-top: 1rem; font-weight: 600; }
        .modal-content input, .modal-content select, .modal-content textarea { width: 100%; padding: 0.5rem; margin-top: 0.25rem; border-radius: 6px; border: 1px solid #cbd5e1; }
        .modal-buttons { display: flex; gap: 0.75rem; margin-top: 1.5rem; }
      `}</style>
    </div>
  );
};

export default Tasks;
