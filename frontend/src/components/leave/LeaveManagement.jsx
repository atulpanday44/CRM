import React, { useState } from 'react';
import { useLeave } from '../../context/LeaveContext';

const LeaveManagement = () => {
  const { leaveRequests, updateLeaveStatus } = useLeave();
  const [error, setError] = useState('');

  const handleDecision = async (id, status) => {
    setError('');
    try {
      await updateLeaveStatus(id, status, status === 'rejected' ? 'Rejected' : undefined);
    } catch (e) {
      setError(e.message || 'Failed to update status');
    }
  };

  if (leaveRequests.length === 0) return <p>No leave requests.</p>;

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      {error && (
        <div style={{ padding: '1rem', background: 'var(--color-error-bg)', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600 }}>Dismiss</button>
        </div>
      )}
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
      role="grid"
      aria-label="Leave requests"
    >
      <thead style={{ backgroundColor: '#0f172a', color: 'white' }}>
        <tr>
          <th style={styles.th}>Employee</th>
          <th style={styles.th}>Start</th>
          <th style={styles.th}>End</th>
          <th style={styles.th}>Reason</th>
          <th style={styles.th}>Status</th>
          <th style={styles.th}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {leaveRequests.map(({ id, name, startDate, endDate, reason, status }) => (
          <tr key={id} style={styles.tr}>
            <td style={styles.td}>{name}</td>
            <td style={styles.td}>{formatDate(startDate)}</td>
            <td style={styles.td}>{formatDate(endDate)}</td>
            <td style={styles.td}>{reason}</td>
            <td style={{ ...styles.td, fontWeight: '600', textTransform: 'capitalize' }}>
              {status}
            </td>
            <td style={styles.td}>
              {status === 'pending' && (
                <>
                  <button
                    style={{ ...styles.button, backgroundColor: '#059669' }}
                    onClick={() => handleDecision(id, 'approved')}
                    aria-label={`Approve leave for ${name}`}
                  >
                    Approve
                  </button>{' '}
                  <button
                    style={{ ...styles.button, backgroundColor: '#dc2626' }}
                    onClick={() => handleDecision(id, 'rejected')}
                    aria-label={`Reject leave for ${name}`}
                  >
                    Reject
                  </button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </>
  );
};

const styles = {
  th: {
    padding: '12px 15px',
    textAlign: 'left',
    borderBottom: '2px solid #3446d9',
  },
  td: {
    padding: '10px 15px',
    borderBottom: '1px solid #ccc',
    verticalAlign: 'middle',
  },
  tr: {
    transition: 'background-color 0.3s',
  },
  button: {
    padding: '6px 12px',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.875rem',
    transition: 'background-color 0.3s',
  },
};

export default LeaveManagement;
