import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

const ALLOWED_ROLES = [
  { value: 'user', label: 'User' },
  { value: 'hr', label: 'HR' },
  { value: 'admin', label: 'Admin' },
  { value: 'finance', label: 'Finance' },
  { value: 'tech_support', label: 'Tech Support' },
];

const DEPARTMENTS = ['Sales', 'HR', 'Finance', 'Tech Support', 'Admin'];

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    password2: '',
    role: 'user',
    department: '',
    phone: '',
    dob: '',
    doj: '',
    is_active: true,
  });

  const canManageUsers = currentUser?.role === 'admin' || currentUser?.role === 'superadmin' || currentUser?.role === 'hr';

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/accounts/users');
      setUsers(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message || 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddUserForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      password: '',
      password2: '',
      role: 'user',
      department: '',
      phone: '',
      dob: '',
      doj: '',
      is_active: true,
    });
    setEditUserId(null);
    setFormErrors({});
    setSuccessMessage('');
    setIsFormOpen(true);
  };

  const [editingUser, setEditingUser] = useState(null);

  const openEditUserForm = (u) => {
    setFormData({
      first_name: u.first_name || '',
      last_name: u.last_name || '',
      username: u.username || '',
      email: u.email || '',
      password: '',
      password2: '',
      role: u.role || 'user',
      department: u.department || '',
      phone: u.phone || '',
      dob: u.dob ? u.dob.slice(0, 10) : '',
      doj: u.doj ? u.doj.slice(0, 10) : '',
      is_active: u.is_active !== false,
    });
    setEditUserId(u.id);
    setEditingUser(u);
    setFormErrors({});
    setSuccessMessage('');
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditUserId(null);
    setEditingUser(null);
    setFormErrors({});
    setSuccessMessage('');
    setSubmitting(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...formData, [name]: value };
    if (name === 'email' && !editUserId) {
      next.username = value ? value.split('@')[0] : '';
    }
    setFormData(next);
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const err = {};
    if (!formData.first_name?.trim()) err.first_name = 'First name is required';
    if (!formData.email?.trim()) err.email = 'Email is required';
    if (!formData.username?.trim()) err.username = 'Username is required';
    if (!editUserId) {
      if (!formData.password) err.password = 'Password is required';
      else if (formData.password.length < 8) err.password = 'Password must be at least 8 characters';
      if (formData.password !== formData.password2) err.password2 = 'Passwords do not match';
    }
    if (!ALLOWED_ROLES.some((r) => r.value === formData.role)) err.role = 'Invalid role';
    setFormErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    if (!validate()) return;

    setSubmitting(true);
    setError('');
    try {
      if (editUserId) {
        const payload = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          username: formData.username,
          email: formData.email,
          department: formData.department || null,
          phone: formData.phone || null,
          dob: formData.dob || null,
          doj: formData.doj || null,
          is_active: formData.is_active,
        };
        if (!isSuperadmin(editingUser)) payload.role = formData.role;
        await api.patch(`/accounts/users/${editUserId}`, payload);
        setSuccessMessage('User updated successfully.');
      } else {
        const payload = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          password2: formData.password2,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
          department: formData.department || null,
          phone: formData.phone || null,
          dob: formData.dob || null,
          doj: formData.doj || null,
        };
        await api.post('/accounts/users', payload);
        setSuccessMessage('User created successfully.');
      }
      await fetchUsers();
      setTimeout(closeForm, 1200);
    } catch (err) {
      setFormErrors({ submit: err.message || 'Request failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setError('');
    try {
      await api.delete(`/accounts/users/${id}`);
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const formatDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '-');
  const displayName = (u) => [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username || '-';
  const isSuperadmin = (u) => (u?.role || '').toLowerCase() === 'superadmin';

  return (
    <div className="user-management">
      <div className="header">
        <h2>User Management</h2>
        {canManageUsers && (
          <button type="button" className="btn-add" onClick={openAddUserForm}>
            + Add User
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table className="data-table" aria-label="User list">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Username</th>
              <th>Role</th>
              <th>Department</th>
              <th>Phone</th>
              <th>DOB</th>
              <th>DOJ</th>
              {canManageUsers && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={canManageUsers ? 9 : 8} style={{ textAlign: 'center' }}>
                  No users found
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.id}>
                <td>{displayName(u)}</td>
                <td>{u.email}</td>
                <td>{u.username}</td>
                <td><span className={`role-badge role-${(u.role || '').toLowerCase()}`}>{u.role || 'user'}</span></td>
                <td>{u.department || '-'}</td>
                <td>{u.phone || '-'}</td>
                <td>{formatDate(u.dob)}</td>
                <td>{formatDate(u.doj)}</td>
                {canManageUsers && (
                  <td>
                    <button
                      type="button"
                      className="btn-edit"
                      onClick={() => openEditUserForm(u)}
                      title="Edit user"
                      aria-label={`Edit ${displayName(u)}`}
                    >
                      Edit
                    </button>
                    {!isSuperadmin(u) && (
                      <button
                        type="button"
                        className="btn-delete"
                        onClick={() => handleDelete(u.id)}
                        title="Delete user"
                        aria-label={`Delete ${displayName(u)}`}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isFormOpen && (
        <div className="form-overlay" role="dialog" aria-modal="true" aria-labelledby="form-title">
          <form className="user-form" onSubmit={handleSubmit} noValidate autoComplete="off">
            <h3 id="form-title">{editUserId ? 'Edit User' : 'Add User'}</h3>
            {formErrors.submit && <div className="error">{formErrors.submit}</div>}

            <label>First name *</label>
            <input name="first_name" value={formData.first_name} onChange={handleChange} required />
            {formErrors.first_name && <div className="error">{formErrors.first_name}</div>}

            <label>Last name</label>
            <input name="last_name" value={formData.last_name} onChange={handleChange} />

            <label>Email *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={!!editUserId} autoComplete="off" />
            {formErrors.email && <div className="error">{formErrors.email}</div>}

            <label>Username *</label>
            <input name="username" value={formData.username} onChange={handleChange} required autoComplete="off" />
            {formErrors.username && <div className="error">{formErrors.username}</div>}

            {!editUserId && (
              <>
                <label>Password *</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required={!editUserId} autoComplete="new-password" />
                {formErrors.password && <div className="error">{formErrors.password}</div>}
                <label>Confirm password *</label>
                <input type="password" name="password2" value={formData.password2} onChange={handleChange} required={!editUserId} autoComplete="new-password" />
                {formErrors.password2 && <div className="error">{formErrors.password2}</div>}
              </>
            )}

            {editUserId && isSuperadmin(editingUser) ? (
              <p><strong>Role:</strong> Superadmin (cannot be changed)</p>
            ) : (
              <>
                <label>Role *</label>
                <select name="role" value={formData.role} onChange={handleChange} required>
                  {ALLOWED_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                {formErrors.role && <div className="error">{formErrors.role}</div>}
              </>
            )}

            <label>Department</label>
            <select name="department" value={formData.department} onChange={handleChange}>
              <option value="">— Select —</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <label>Phone</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />

            <label>DOB</label>
            <input type="date" name="dob" value={formData.dob} onChange={handleChange} />

            <label>DOJ</label>
            <input type="date" name="doj" value={formData.doj} onChange={handleChange} />

            {editUserId && (
              <label className="checkbox-label">
                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={(e) => setFormData((p) => ({ ...p, is_active: e.target.checked }))} />
                Active
              </label>
            )}

            <div className="form-buttons">
              <button type="submit" className="btn-submit" disabled={submitting}>{editUserId ? 'Update' : 'Create'}</button>
              <button type="button" className="btn-cancel" onClick={closeForm} disabled={submitting}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <style>{`
        .user-management { padding: 1.5rem; font-family: 'Segoe UI', sans-serif; max-width: 1200px; margin: 0 auto; }
        .user-management .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .user-management h2 { margin: 0; font-size: 1.5rem; color: #1e293b; }
        .btn-add { background: #4953ff; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .btn-add:hover { background: #3d46e0; }
        .alert { padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; }
        .alert-error { background: #fee2e2; color: #991b1b; }
        .alert-success { background: #d1fae5; color: #065f46; }
        .data-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .data-table th, .data-table td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
        .data-table th { background: #f8fafc; font-weight: 600; color: #334155; }
        .role-badge { display: inline-block; padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; }
        .role-superadmin { background: #fef3c7; color: #92400e; }
        .role-admin { background: #dbeafe; color: #1e40af; }
        .role-hr { background: #d1fae5; color: #065f46; }
        .role-user { background: #f1f5f9; color: #475569; }
        .btn-edit, .btn-delete { margin-right: 0.5rem; padding: 0.35rem 0.75rem; border-radius: 6px; border: 1px solid #cbd5e1; background: #fff; cursor: pointer; font-size: 0.875rem; }
        .btn-edit:hover { background: #f1f5f9; }
        .btn-delete:hover { background: #fee2e2; color: #991b1b; }
        .form-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; overflow-y: auto; }
        .user-form { background: #fff; padding: 1.5rem; border-radius: 12px; max-width: 420px; width: 100%; max-height: 90vh; overflow-y: auto; }
        .user-form h3 { margin: 0 0 1rem; color: #1e293b; }
        .user-form label { display: block; margin-top: 0.75rem; font-weight: 600; font-size: 0.9rem; color: #334155; }
        .user-form input, .user-form select { width: 100%; padding: 0.5rem 0.75rem; margin-top: 0.25rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 1rem; }
        .user-form .checkbox-label { display: flex; align-items: center; gap: 0.5rem; }
        .user-form .checkbox-label input { width: auto; }
        .user-form .error { color: #dc2626; font-size: 0.85rem; margin-top: 0.25rem; }
        .form-buttons { display: flex; gap: 0.75rem; margin-top: 1.25rem; }
        .btn-submit { background: #4953ff; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .btn-cancel { background: #f1f5f9; color: #334155; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; }
      `}</style>
    </div>
  );
};

export default UserManagement;
