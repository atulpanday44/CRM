import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityText, setActivityText] = useState('');
  const [activityType, setActivityType] = useState('daily');
  const [activityError, setActivityError] = useState('');

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'hr';

  const fetchData = async () => {
    try {
      const [tasksRes, meetingsRes, activitiesRes] = await Promise.allSettled([
        api.get('/tasks/tasks'),
        api.get('/meetings/meetings'),
        api.get('/tasks/activities'),
      ]);
      setTasks(Array.isArray(tasksRes.value) ? tasksRes.value : tasksRes.value?.results || []);
      setMeetings(Array.isArray(meetingsRes.value) ? meetingsRes.value : meetingsRes.value?.results || []);
      setActivities(Array.isArray(activitiesRes.value) ? activitiesRes.value : activitiesRes.value?.results || []);
    } catch {
      setTasks([]);
      setMeetings([]);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const submitActivity = async (e) => {
    e.preventDefault();
    setActivityError('');
    if (!activityText.trim()) return;
    try {
      await api.post('/tasks/activities', {
        content: activityText,
        activity_type: activityType,
        date: new Date().toISOString().slice(0, 10),
      });
      setActivityText('');
      fetchData();
    } catch (err) {
      setActivityError(err.message || 'Failed to save activity');
    }
  };

  const today = new Date().toISOString().slice(0, 10);
  const pendingTasks = tasks.filter((t) => t.status !== 'completed');
  const overdueTasks = tasks.filter((t) => t.is_overdue);
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const upcomingMeetings = meetings.filter((m) => new Date(m.scheduled_at) > new Date()).sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at)).slice(0, 5);

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '-');
  const formatDateTime = (d) => (d ? new Date(d).toLocaleString() : '-');

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p>
          {isAdmin ? 'Overview of team tasks, meetings, and activity' : 'Your tasks, upcoming meetings, and activity log'}
        </p>
      </header>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="dashboard-grid">
          <div className="stats-row">
            <div className="stat-card">
              <span className="stat-value">{pendingTasks.length}</span>
              <span className="stat-label">Pending Tasks</span>
            </div>
            <div className="stat-card overdue">
              <span className="stat-value">{overdueTasks.length}</span>
              <span className="stat-label">Overdue</span>
            </div>
            <div className="stat-card done">
              <span className="stat-value">{completedTasks.length}</span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{upcomingMeetings.length}</span>
              <span className="stat-label">Upcoming Meetings</span>
            </div>
          </div>

          <div className="dashboard-sections">
            <section className="panel">
              <h2>Tasks Overview</h2>
              {pendingTasks.length === 0 ? (
                <p className="empty">No pending tasks</p>
              ) : (
                <ul className="task-list">
                  {pendingTasks.slice(0, 8).map((t) => (
                    <li key={t.id} className={t.is_overdue ? 'overdue' : ''}>
                      <span>{t.title}</span>
                      <span>{t.assigned_to_detail?.name || t.assigned_to_detail?.username}</span>
                      <span>{formatDate(t.deadline)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="panel">
              <h2>Upcoming Meetings</h2>
              {upcomingMeetings.length === 0 ? (
                <p className="empty">No upcoming meetings</p>
              ) : (
                <ul className="meeting-list">
                  {upcomingMeetings.map((m) => (
                    <li key={m.id}>
                      <strong>{m.title}</strong>
                      <span>{formatDateTime(m.scheduled_at)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {!isAdmin && (
              <section className="panel activity-panel">
                <h2>Log Activity</h2>
                {activityError && <p className="activity-error">{activityError}</p>}
                <form onSubmit={submitActivity}>
                  <select value={activityType} onChange={(e) => setActivityType(e.target.value)}>
                    <option value="daily">Daily Log</option>
                    <option value="weekly">Weekly Summary</option>
                    <option value="update">Status Update</option>
                  </select>
                  <textarea
                    value={activityText}
                    onChange={(e) => setActivityText(e.target.value)}
                    placeholder="What did you work on today?"
                    rows={3}
                  />
                  <button type="submit" className="btn-primary">Save Activity</button>
                </form>
              </section>
            )}

            {activities.length > 0 && (
              <section className="panel full">
                <h2>Recent Activity</h2>
                <ul className="activity-list">
                  {activities.slice(0, 10).map((a) => (
                    <li key={a.id}>
                      <span className="activity-user">{a.user_name || a.user}</span>
                      <span className="activity-type">{a.activity_type}</span>
                      <span className="activity-date">{formatDate(a.date)}</span>
                      <p className="activity-content">{a.content}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      )}

      <style>{`
        .dashboard-page { padding: 2rem; font-family: 'Segoe UI', sans-serif; }
        .dashboard-header { margin-bottom: 1.5rem; }
        .dashboard-header h1 { font-size: 1.8rem; color: #1e293b; }
        .dashboard-header p { color: #64748b; margin: 0.5rem 0; }
        .loading { text-align: center; padding: 3rem; color: #64748b; }
        .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .stat-card { background: #fff; border-radius: 12px; padding: 1.25rem; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border-left: 4px solid #3b82f6; }
        .stat-card.overdue { border-left-color: #ef4444; }
        .stat-card.done { border-left-color: #22c55e; }
        .stat-value { display: block; font-size: 2rem; font-weight: 700; color: #1e293b; }
        .stat-label { font-size: 0.9rem; color: #64748b; }
        .dashboard-sections { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
        .panel { background: #fff; border-radius: 12px; padding: 1.25rem; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .panel.full { grid-column: 1 / -1; }
        .panel h2 { font-size: 1.1rem; color: #334155; margin: 0 0 1rem; }
        .empty { color: #94a3b8; font-size: 0.95rem; }
        .task-list, .meeting-list, .activity-list { list-style: none; padding: 0; margin: 0; }
        .task-list li, .meeting-list li { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 0.5rem; padding: 0.6rem 0; border-bottom: 1px solid #f1f5f9; }
        .task-list li.overdue { color: #dc2626; }
        .meeting-list li { flex-direction: column; }
        .meeting-list li span { font-size: 0.9rem; color: #64748b; }
        .activity-list li { padding: 0.75rem 0; border-bottom: 1px solid #f1f5f9; }
        .activity-user { font-weight: 600; margin-right: 0.5rem; }
        .activity-type { font-size: 0.8rem; color: #64748b; margin-right: 0.5rem; }
        .activity-date { font-size: 0.8rem; color: #94a3b8; }
        .activity-content { margin: 0.25rem 0 0; font-size: 0.9rem; color: #475569; }
        .activity-panel select, .activity-panel textarea { width: 100%; padding: 0.5rem; margin: 0.5rem 0; border-radius: 6px; border: 1px solid #cbd5e1; }
        .btn-primary { background: #4953ff; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; margin-top: 0.5rem; }
        .btn-primary:hover { background: #3d46e0; }
        .activity-error { color: #dc2626; font-size: 0.9rem; margin: 0 0 0.5rem; }
      `}</style>
    </div>
  );
};

export default Dashboard;
