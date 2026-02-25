import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLeave } from '../../context/LeaveContext';
import { useAuth } from '../../context/AuthContext';

const FormCard = styled.form`
  max-width: 480px;
  padding: var(--space-8);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
`;

const FormTitle = styled.h3`
  margin: 0 0 var(--space-6);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: -0.02em;
`;

const FieldGroup = styled.div`
  margin-top: var(--space-5);
  &:first-of-type { margin-top: 0; }
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: var(--space-2);
`;

const Input = styled.input`
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  color: var(--color-text);
  background: var(--color-surface);
  transition: border-color 0.15s, box-shadow 0.15s;
  &:focus {
    border-color: var(--color-border-focus);
    box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.08);
  }
  &:disabled {
    background: var(--color-primary-light);
    color: var(--color-text-muted);
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  color: var(--color-text);
  background: var(--color-surface);
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:focus {
    border-color: var(--color-border-focus);
    box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.08);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 96px;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  color: var(--color-text);
  background: var(--color-surface);
  resize: vertical;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:focus {
    border-color: var(--color-border-focus);
    box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.08);
  }
`;

const ErrorText = styled.p`
  margin: var(--space-1) 0 0;
  font-size: 0.8125rem;
  color: var(--color-error);
`;

const SuccessText = styled.p`
  margin: var(--space-4) 0 0;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-success);
`;

const SubmitBtn = styled.button`
  margin-top: var(--space-6);
  width: 100%;
  padding: var(--space-3) var(--space-5);
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: background 0.2s, transform 0.05s;
  &:hover:not(:disabled) {
    background: var(--color-primary-hover);
    transform: translateY(-1px);
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const LeaveForm = () => {
  const { createLeave } = useLeave();
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    leaveType: 'Paid Leave',
    reason: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const first = user?.first_name ?? user?.firstName ?? '';
    const last = user?.last_name ?? user?.lastName ?? '';
    setForm((f) => ({
      ...f,
      name: [first, last].filter(Boolean).join(' ') || user?.username || user?.email || '',
    }));
  }, [user]);

  const validate = () => {
    const newErrors = {};
    if (!form.startDate) newErrors.startDate = 'Start date is required';
    if (!form.endDate) newErrors.endDate = 'End date is required';
    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
      newErrors.endDate = 'End date cannot be before start date';
    }
    if (!form.reason.trim()) newErrors.reason = 'Please provide a reason';
    return newErrors;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSubmitting(true);
    setSuccessMessage('');
    setErrors({});
    try {
      await createLeave({
        start_date: form.startDate,
        end_date: form.endDate,
        leave_type: form.leaveType,
        reason: form.reason.trim(),
      });
      setSuccessMessage('Leave request submitted successfully.');
      setForm((f) => ({
        ...f,
        startDate: '',
        endDate: '',
        reason: '',
      }));
    } catch (err) {
      setErrors({ form: err.message || 'Failed to submit leave request.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormCard onSubmit={handleSubmit} noValidate>
      <FormTitle>Apply for Leave</FormTitle>

      <FieldGroup>
        <Label htmlFor="name">Name</Label>
        <Input
          type="text"
          id="name"
          name="name"
          value={form.name}
          disabled
          aria-readonly
        />
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="startDate">Start date</Label>
        <Input
          type="date"
          id="startDate"
          name="startDate"
          value={form.startDate}
          onChange={handleChange}
          aria-invalid={!!errors.startDate}
          aria-describedby={errors.startDate ? 'startDate-error' : undefined}
        />
        {errors.startDate && <ErrorText id="startDate-error">{errors.startDate}</ErrorText>}
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="endDate">End date</Label>
        <Input
          type="date"
          id="endDate"
          name="endDate"
          value={form.endDate}
          onChange={handleChange}
          aria-invalid={!!errors.endDate}
          aria-describedby={errors.endDate ? 'endDate-error' : undefined}
        />
        {errors.endDate && <ErrorText id="endDate-error">{errors.endDate}</ErrorText>}
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="leaveType">Leave type</Label>
        <Select
          id="leaveType"
          name="leaveType"
          value={form.leaveType}
          onChange={handleChange}
        >
          <option value="Paid Leave">Paid Leave</option>
          <option value="Medical Leave">Medical Leave</option>
          <option value="Vacation">Vacation</option>
          <option value="Unpaid Leave">Unpaid Leave</option>
          <option value="Other">Other</option>
        </Select>
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="reason">Reason</Label>
        <Textarea
          id="reason"
          name="reason"
          placeholder="Brief reason for leave"
          value={form.reason}
          onChange={handleChange}
          rows={3}
          aria-invalid={!!errors.reason}
          aria-describedby={errors.reason ? 'reason-error' : undefined}
        />
        {errors.reason && <ErrorText id="reason-error">{errors.reason}</ErrorText>}
      </FieldGroup>

      {errors.form && <ErrorText style={{ marginTop: 'var(--space-4)' }}>{errors.form}</ErrorText>}
      {successMessage && <SuccessText>{successMessage}</SuccessText>}

      <SubmitBtn type="submit" disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit request'}
      </SubmitBtn>
    </FormCard>
  );
};

export default LeaveForm;
