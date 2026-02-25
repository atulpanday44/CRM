// Leave context: loads leave requests from API, supports create and update status.
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../api/client';

const LeaveContext = createContext();

function normalizeLeave(item) {
  const u = item.user_detail || item.userDetail;
  const name = u
    ? [u.first_name || u.firstName, u.last_name || u.lastName].filter(Boolean).join(' ').trim() || u.username || u.email || '—'
    : '—';
  const department = (u && (u.department != null)) ? u.department : '—';
  return {
    id: item.id,
    userId: item.user ?? item.userId ?? (u && (u.id != null) ? u.id : null),
    name,
    department,
    startDate: item.start_date ?? item.startDate,
    endDate: item.end_date ?? item.endDate,
    leaveType: item.leave_type ?? item.leaveType ?? 'Paid Leave',
    reason: item.reason ?? '',
    status: (item.status || 'pending').toLowerCase(),
  };
}

export const LeaveProvider = ({ children }) => {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLeaveRequests = useCallback(async () => {
    if (!user) {
      setLeaveRequests([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const role = (user.role || '').toLowerCase();
      const isAdminOrHr = ['admin', 'superadmin', 'hr'].includes(role);
      const path = isAdminOrHr ? '/leaves/requests' : '/leaves/requests/my_leaves';
      const data = await api.get(path);
      const list = Array.isArray(data) ? data : data?.results ?? [];
      setLeaveRequests(list.map(normalizeLeave));
    } catch (err) {
      setError(err.message || 'Failed to load leave requests');
      setLeaveRequests([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLeaveRequests();
  }, [fetchLeaveRequests]);

  const updateLeaveStatus = useCallback(async (id, status, rejectionReason) => {
    try {
      await api.post(`/leaves/requests/${id}/update_status`, {
        status,
        rejection_reason: status === 'rejected' ? (rejectionReason || 'Rejected') : undefined,
      });
      await fetchLeaveRequests();
    } catch (err) {
      throw new Error(err.message || 'Failed to update status');
    }
  }, [fetchLeaveRequests]);

  const createLeave = useCallback(async (payload) => {
    const created = await api.post('/leaves/requests', {
      start_date: payload.start_date || payload.startDate,
      end_date: payload.end_date || payload.endDate,
      leave_type: payload.leave_type || payload.leaveType || 'Paid Leave',
      reason: payload.reason,
    });
    await fetchLeaveRequests();
    return created;
  }, [fetchLeaveRequests]);

  const value = {
    leaveRequests,
    loading,
    error,
    fetchLeaveRequests,
    updateLeaveStatus,
    createLeave,
  };

  return (
    <LeaveContext.Provider value={value}>
      {children}
    </LeaveContext.Provider>
  );
};

export const useLeave = () => useContext(LeaveContext);
