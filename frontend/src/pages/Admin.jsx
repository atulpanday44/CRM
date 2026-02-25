import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { canAccessAdminPanel } from '../utils/roles';
import UserManagement from '../components/admin/UserManagement';
import AdminSales from '../components/admin/AdminSales';
import { api } from '../api/client';

// Placeholder HR Component
const HR = () => (
  <div className="dept-container">
    <h2>HR Department</h2>
    <p>HR features are coming soon.</p>
  </div>
);

// Placeholder Finance Component
const Finance = () => (
  <div className="dept-container">
    <h2>Finance Department</h2>
    <p>Finance dashboard is under development.</p>
  </div>
);

// Placeholder Tech Support Component
const TechSupport = () => (
  <div className="dept-container">
    <h2>Tech Support Department</h2>
    <p>Tech support tools will be available soon.</p>
  </div>
);

// Leave Requests Component – data from API
const LeaveRequests = ({ currentUserRole }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const canManage = ['admin', 'superadmin', 'hr'].includes((currentUserRole || '').toLowerCase());

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/leaves/requests');
      setRequests(Array.isArray(data) ? data : data?.results || []);
    } catch (e) {
      setError(e.message || 'Failed to load leave requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateRequestStatus = async (id, newStatus, rejectionReason) => {
    setUpdatingId(id);
    try {
      const updated = await api.post(`/leaves/requests/${id}/update_status`, {
        status: newStatus.toLowerCase(),
        rejection_reason: rejectionReason || undefined,
      });
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (e) {
      setError(e.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
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

  const statusDisplay = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '-');

  return (
    <div className="dept-container">
      <h2>Leave Requests</h2>
      {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
      <table className="data-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Reason</th>
            <th>Status</th>
            {canManage && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => {
            const id = req.id;
            const status = (req.status || '').toLowerCase();
            const isPending = status === 'pending';
            return (
            <tr key={id}>
              <td>{employeeName(req)}</td>
              <td>{req.reason || '-'}</td>
              <td>
                <span className={`status-tag status-${status}`}>
                  {statusDisplay(req.status)}
                </span>
              </td>
              {canManage && (
                <td>
                  {isPending ? (
                    <>
                      <button
                        onClick={() => updateRequestStatus(id, 'approved')}
                        className="btn-approve"
                        disabled={updatingId === id}
                        aria-label={`Approve leave request`}
                      >
                        {updatingId === id ? '…' : '✔️ Approve'}
                      </button>
                      <button
                        onClick={() => updateRequestStatus(id, 'rejected')}
                        className="btn-reject"
                        disabled={updatingId === id}
                        aria-label={`Reject leave request`}
                        style={{ marginLeft: '8px' }}
                      >
                        {updatingId === id ? '…' : '❌ Reject'}
                      </button>
                    </>
                  ) : (
                    <em>No actions</em>
                  )}
                </td>
              )}
            </tr>
          );
          })}
          {requests.length === 0 && !loading && (
            <tr>
              <td colSpan={canManage ? 4 : 3} style={{ textAlign: 'center' }}>
                No leave requests.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      )}

      <style jsx>{`
        .btn-approve {
          background-color: #22c55e;
          border: none;
          color: white;
          padding: 0.3rem 0.7rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
          user-select: none;
          transition: background-color 0.3s ease;
        }
        .btn-approve:hover {
          background-color: #16a34a;
        }
        .btn-reject {
          background-color: #ef4444;
          border: none;
          color: white;
          padding: 0.3rem 0.7rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
          user-select: none;
          transition: background-color 0.3s ease;
        }
        .btn-reject:hover {
          background-color: #b91c1c;
        }
      `}</style>
    </div>
  );
};

// Icons & Departments data
const icons = {
  sales: '📈',
  hr: '👥',
  finance: '💰',
  techsupport: '🛠️',
  users: '👤',
  leave: '📝',
};

const departments = [
  { key: 'sales', label: 'Sales', icon: icons.sales },
  { key: 'hr', label: 'HR', icon: icons.hr },
  { key: 'finance', label: 'Finance', icon: icons.finance },
  { key: 'techsupport', label: 'Tech Support', icon: icons.techsupport },
  { key: 'users', label: 'User Management', icon: icons.users },
  { key: 'leave', label: 'Leave Requests', icon: icons.leave },
];

// Main Admin Component – only admin/superadmin should access (sidebar already hides for others)
const Admin = () => {
  const { user } = useAuth();
  const [activeDept, setActiveDept] = useState('sales');
  const currentUserRole = user?.role || '';
  const allowed = canAccessAdminPanel(currentUserRole);

  if (!allowed) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
        <h2>Access denied</h2>
        <p>Only Admin or Superadmin can access this page.</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeDept) {
      case 'sales':
        return <AdminSales />;
      case 'hr':
        return <HR />;
      case 'finance':
        return <Finance />;
      case 'techsupport':
        return <TechSupport />;
      case 'users':
        return <UserManagement />;
      case 'leave':
        return <LeaveRequests currentUserRole={currentUserRole} />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-container" role="main">
      <nav aria-label="Department navigation">
        <h1>Admin Panel</h1>
        <ul>
          {departments.map(({ key, label, icon }) => (
            <li
              key={key}
              onClick={() => setActiveDept(key)}
              className={activeDept === key ? 'active' : ''}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setActiveDept(key);
              }}
              aria-current={activeDept === key ? 'page' : undefined}
            >
              <span className="icon" aria-hidden="true">{icon}</span>
              {label}
            </li>
          ))}
        </ul>
      </nav>

      <section className="content-area" aria-live="polite">
        {renderContent()}
      </section>

      <style jsx>{`
        .admin-container { display: flex; height: 100vh; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f1f5f9; color: #334155; }
        nav { width: 240px; background: white; border-right: 1px solid #cbd5e1; padding: 1.5rem; user-select: none; }
        nav h1 { font-size: 1.5rem; margin-bottom: 2rem; text-align: center; }
        nav ul { list-style: none; padding: 0; margin: 0; }
        nav li { padding: 0.8rem 1rem; margin-bottom: 0.4rem; border-radius: 6px; cursor: pointer; display: flex; align-items: center; user-select: none; transition: background 0.3s, color 0.3s; outline-offset: 2px; }
        nav li .icon { margin-right: 0.8rem; font-size: 1.3rem; line-height: 1; }
        nav li:hover, nav li:focus { background: #e0e7ff; outline: none; }
        nav li.active { background: #3b82f6; color: white; font-weight: 700; }
        .content-area { flex: 1; padding: 2rem; overflow-y: auto; background: #f8fafc; }
        .dept-container h2 { margin-top: 0; color: #1e293b; margin-bottom: 1rem; user-select: none; }
        .data-table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1); user-select: none; }
        .data-table th, .data-table td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
        .data-table th { background: #e2e8f0; font-weight: 600; }
        .status-tag { padding: 0.2rem 0.6rem; border-radius: 4px; color: white; font-weight: 600; font-size: 0.85rem; user-select: none; display: inline-block; min-width: 72px; text-align: center; text-transform: capitalize; }
        .status-pending { background-color: #fbbf24; color: #78350f; }
        .status-approved { background-color: #22c55e; color: #14532d; }
        .status-rejected { background-color: #ef4444; color: #7f1d1d; }
      `}</style>
    </div>
  );
};

export default Admin;