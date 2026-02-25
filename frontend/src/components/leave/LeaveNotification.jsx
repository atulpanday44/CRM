import React, { useEffect, useState } from 'react';
import { useLeave } from '../../context/LeaveContext';

const Toast = ({ message, onDismiss }) => (
  <div
    role="status"
    style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      maxWidth: '360px',
      padding: '12px 16px',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-lg)',
      fontSize: '0.9375rem',
      color: 'var(--color-text)',
      zIndex: 10000,
    }}
  >
    {message}
    <button
      type="button"
      onClick={onDismiss}
      aria-label="Dismiss"
      style={{
        marginLeft: '12px',
        padding: '2px 8px',
        border: 'none',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--color-primary-light)',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '0.8125rem',
      }}
    >
      OK
    </button>
  </div>
);

const LeaveNotification = ({ userId }) => {
  const { leaveRequests } = useLeave();
  const [notifiedLeaves, setNotifiedLeaves] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const newNotifications = leaveRequests.filter(
      (lr) =>
        lr.userId === userId &&
        lr.status !== 'pending' &&
        !notifiedLeaves.includes(lr.id)
    );

    if (newNotifications.length > 0) {
      const msg =
        newNotifications.length === 1
          ? `Your leave from ${newNotifications[0].startDate} to ${newNotifications[0].endDate} was ${newNotifications[0].status}.`
          : `${newNotifications.length} leave request(s) updated.`;
      setToast(msg);
      setNotifiedLeaves((prev) => [...prev, ...newNotifications.map((lr) => lr.id)]);
      const t = setTimeout(() => setToast(null), 8000);
      return () => clearTimeout(t);
    }
  }, [leaveRequests, userId, notifiedLeaves]);

  if (!toast) return null;
  return <Toast message={toast} onDismiss={() => setToast(null)} />;
};

export default LeaveNotification;
