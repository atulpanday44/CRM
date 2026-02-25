import React, { useState } from 'react';
import { useLeave } from '../../context/LeaveContext';

const LeaveRequestForm = ({ userId }) => {
  const { createLeave } = useLeave();
  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await createLeave({
        start_date: form.startDate,
        end_date: form.endDate,
        reason: form.reason.trim(),
      });
      setSuccess('Leave requested successfully.');
      setForm({ startDate: '', endDate: '', reason: '' });
    } catch (err) {
      setError(err.message || 'Failed to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '20px auto' }}>
      <label>
        Start Date:
        <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
      </label>
      <br />
      <label>
        End Date:
        <input type="date" name="endDate" value={form.endDate} onChange={handleChange} required />
      </label>
      <br />
      <label>
        Reason:
        <textarea name="reason" value={form.reason} onChange={handleChange} placeholder="Reason for leave" required />
      </label>
      <br />
      {error && <p style={{ color: 'var(--color-error)', fontSize: '0.875rem' }}>{error}</p>}
      {success && <p style={{ color: 'var(--color-success)', fontSize: '0.875rem' }}>{success}</p>}
      <button type="submit" disabled={submitting}>
        {submitting ? 'Submitting…' : 'Apply Leave'}
      </button>
    </form>
  );
};

export default LeaveRequestForm;
