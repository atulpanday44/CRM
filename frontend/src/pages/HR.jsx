import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

const HR = () => {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityText, setActivityText] = useState('');
  const [activityType, setActivityType] = useState('daily');
  const [activityError, setActivityError] = useState('');

  const isAdminOrHr = ['admin', 'superadmin', 'hr'].includes((user?.role || '').toLowerCase());

  const [notifications] = useState([
    { type: 'birthday', name: 'Rahul Sharma', date: '2025-08-22' },
    { type: 'anniversary', name: 'Gurpreet Kaur', date: '2025-08-20' },
  ]);

  const fetchLeaves = async () => {
    try {
      const path = isAdminOrHr ? '/leaves/requests' : '/leaves/requests/my_leaves';
      const data = await api.get(path);
      setLeaveRequests(Array.isArray(data) ? data : data?.results || []);
    } catch {
      setLeaveRequests([]);
    }
  };

  const fetchTasksAndActivity = async () => {
    try {
      const [tasksRes, activitiesRes] = await Promise.allSettled([
        api.get('/tasks/tasks'),
        api.get('/tasks/activities'),
      ]);
      setTasks(Array.isArray(tasksRes.value) ? tasksRes.value : tasksRes.value?.results || []);
      setActivities(Array.isArray(activitiesRes.value) ? activitiesRes.value : activitiesRes.value?.results || []);
    } catch {
      setTasks([]);
      setActivities([]);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchLeaves(), fetchTasksAndActivity()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, [isAdminOrHr]);

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
      fetchTasksAndActivity();
    } catch (err) {
      setActivityError(err.message || 'Failed to save activity');
    }
  };

  const handleDecision = async (id, decision) => {
    try {
      const updated = await api.post(`/leaves/requests/${id}/update_status`, {
        status: decision,
        rejection_reason: decision === 'rejected' ? 'Rejected by HR' : undefined,
      });
      setLeaveRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch {
      fetchLeaves();
    }
  };

  const employeeName = (req) => {
    const u = req.user_detail || req.userDetail;
    if (!u) return '-';
    const first = u.first_name || u.firstName;
    const last = u.last_name || u.lastName;
    if (first || last) return [first, last].filter(Boolean).join(' ').trim();
    return u.username || u.email || '-';
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>HR Dashboard</h1>

      {/* Notifications */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>🎉 Notifications</h2>
        {notifications.length ? (
          <div style={styles.notificationList}>
            {notifications.map((n, i) => (
              <div
                key={i}
                style={{
                  ...styles.notification,
                  backgroundColor:
                    n.type === 'birthday' ? '#e3f2fd' : '#fce4ec',
                  borderLeft:
                    n.type === 'birthday' ? '4px solid #2196f3' : '4px solid #e91e63',
                }}
              >
                {n.type === 'birthday' ? (
                  <span role="img" aria-label="birthday">
                    🎂
                  </span>
                ) : (
                  <span role="img" aria-label="anniversary">
                    🎊
                  </span>
                )}{' '}
                <strong>{n.name}</strong>{' '}
                {n.type === 'birthday'
                  ? "has a birthday today!"
                  : "is celebrating a work anniversary!"}
              </div>
            ))}
          </div>
        ) : (
          <p style={styles.noNotification}>No notifications today.</p>
        )}
      </section>

      {/* My tasks – what I need to do / will do (same for everyone; Superadmin sees all on Dashboard) */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>✅ My tasks</h2>
        {loading ? (
          <p style={styles.noRequests}>Loading...</p>
        ) : tasks.length === 0 ? (
          <p style={styles.noRequests}>No tasks assigned yet.</p>
        ) : (
          <ul style={styles.taskList}>
            {tasks.map((t) => (
              <li key={t.id} style={{ ...styles.taskItem, borderLeftColor: t.is_overdue ? '#f44336' : t.status === 'completed' ? '#4caf50' : '#2196f3' }}>
                <strong>{t.title}</strong>
                <span style={styles.taskMeta}>
                  {t.status?.replace('_', ' ')} · Due {t.deadline ? new Date(t.deadline).toLocaleDateString() : '-'}
                  {t.assigned_to_detail && (
                    <em> · Assigned to {[t.assigned_to_detail.first_name, t.assigned_to_detail.last_name].filter(Boolean).join(' ') || t.assigned_to_detail.username}</em>
                  )}
                </span>
                {t.description && <p style={styles.taskDesc}>{t.description}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* My activity – what I did (Superadmin can see everyone's on Dashboard) */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>📌 What I did / Activity log</h2>
        {activityError && <p style={{ color: '#f44336', marginBottom: '0.5rem' }}>{activityError}</p>}
        <form onSubmit={submitActivity} style={{ ...styles.form, marginBottom: '1.5rem' }}>
          <textarea
            placeholder="Log what you did today..."
            value={activityText}
            onChange={(e) => setActivityText(e.target.value)}
            style={{ ...styles.input, height: '70px', resize: 'vertical' }}
          />
          <select value={activityType} onChange={(e) => setActivityType(e.target.value)} style={{ ...styles.input, width: 'auto', marginRight: '0.5rem' }}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="update">Update</option>
          </select>
          <button type="submit" style={styles.submitButton}>Log activity</button>
        </form>
        {activities.length === 0 ? (
          <p style={styles.noRequests}>No activity logged yet.</p>
        ) : (
          <ul style={styles.activityList}>
            {activities.slice(0, 15).map((a) => (
              <li key={a.id} style={styles.activityItem}>
                <span style={styles.activityDate}>{a.date ? new Date(a.date).toLocaleDateString() : '-'}</span>
                <span style={styles.activityType}>({a.activity_type || 'daily'})</span>
                <span>{a.content}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Leave Requests */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>📋 Leave Requests</h2>
        {loading ? (
          <p style={styles.noRequests}>Loading...</p>
        ) : leaveRequests.length ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Dates</th>
                <th style={styles.th}>Reason</th>
                <th style={styles.th}>Status</th>
                {isAdminOrHr && <th style={styles.th}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map((req) => {
                const status = (req.status || '').toLowerCase();
                const isPending = status === 'pending';
                return (
                  <tr key={req.id} style={styles.tr}>
                    <td style={styles.td}>{employeeName(req)}</td>
                    <td style={styles.td}>
                      {req.start_date} → {req.end_date}
                    </td>
                    <td style={styles.td}>{req.reason}</td>
                    <td
                      style={{
                        ...styles.td,
                        color:
                          status === 'approved'
                            ? '#4caf50'
                            : status === 'rejected'
                            ? '#f44336'
                            : '#ff9800',
                        fontWeight: '600',
                        textTransform: 'capitalize',
                      }}
                    >
                      {req.status}
                    </td>
                    {isAdminOrHr && (
                      <td style={styles.td}>
                        {isPending ? (
                          <>
                            <button
                              style={{ ...styles.actionButton, backgroundColor: '#4caf50' }}
                              onClick={() => handleDecision(req.id, 'approved')}
                            >
                              Approve
                            </button>
                            <button
                              style={{ ...styles.actionButton, backgroundColor: '#f44336' }}
                              onClick={() => handleDecision(req.id, 'rejected')}
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span style={{ fontStyle: 'italic', color: '#666' }}>No actions</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p style={styles.noRequests}>No leave requests yet.</p>
        )}
      </section>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem 3rem',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: '#f4f6f8',
    minHeight: '100vh',
  },
  title: {
    fontSize: '2.4rem',
    fontWeight: '700',
    marginBottom: '2rem',
    color: '#2c3e50',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    padding: '1.8rem 2rem',
    marginBottom: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgb(0 0 0 / 0.1)',
  },
  sectionTitle: {
    fontSize: '1.8rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#34495e',
  },
  notificationList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
  },
  notification: {
    padding: '1rem',
    borderRadius: '8px',
    fontWeight: '500',
    fontSize: '1rem',
    color: '#34495e',
    boxShadow: '0 1px 6px rgb(0 0 0 / 0.08)',
  },
  noNotification: {
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  input: {
    padding: '0.85rem 1rem',
    borderRadius: '8px',
    border: '1px solid #bdc3c7',
    fontSize: '1rem',
    color: '#2c3e50',
    fontWeight: '400',
  },
  dateInputs: {
    display: 'flex',
  },
  submitButton: {
    padding: '0.85rem 0',
    backgroundColor: '#3498db',
    color: '#fff',
    fontWeight: '600',
    fontSize: '1.1rem',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.25s',
  },
  submitButtonHover: {
    backgroundColor: '#2980b9',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '1rem',
  },
  th: {
    textAlign: 'left',
    padding: '0.8rem',
    borderBottom: '2px solid #ecf0f1',
    color: '#7f8c8d',
    fontWeight: '600',
  },
  tr: {
    borderBottom: '1px solid #ecf0f1',
  },
  td: {
    padding: '0.75rem',
    verticalAlign: 'middle',
    color: '#2c3e50',
  },
  actionButton: {
    padding: '0.4rem 0.8rem',
    marginRight: '0.5rem',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  noRequests: {
    fontStyle: 'italic',
    color: '#7f8c8d',
  },
  taskList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  taskItem: {
    padding: '0.75rem 1rem',
    marginBottom: '0.5rem',
    borderRadius: '8px',
    backgroundColor: '#f8fafc',
    borderLeft: '4px solid #2196f3',
  },
  taskMeta: {
    display: 'block',
    fontSize: '0.9rem',
    color: '#64748b',
    marginTop: '0.25rem',
  },
  taskDesc: {
    margin: '0.5rem 0 0',
    fontSize: '0.95rem',
    color: '#475569',
  },
  activityList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  activityItem: {
    padding: '0.5rem 0',
    borderBottom: '1px solid #eee',
    fontSize: '0.95rem',
  },
  activityDate: {
    fontWeight: '600',
    marginRight: '0.5rem',
    color: '#374151',
  },
  activityType: {
    marginRight: '0.5rem',
    color: '#6b7280',
    fontSize: '0.85rem',
  },
};

export default HR;
