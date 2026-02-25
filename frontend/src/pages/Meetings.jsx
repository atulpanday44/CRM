import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

const Meetings = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [viewMeeting, setViewMeeting] = useState(null);

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'hr';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduled_at: '',
    location: '',
    participant_ids: [],
    notes: '',
    decisions: '',
    follow_up_actions: '',
  });

  const fetchMeetings = async () => {
    try {
      setError('');
      const data = await api.get('/meetings/meetings');
      setMeetings(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setMeetings([]);
      setError(err.message || 'Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await api.get('/accounts/users');
      setUsers(Array.isArray(data) ? data : data.results || []);
    } catch {
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchMeetings();
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleParticipant = (id) => {
    setFormData((prev) => ({
      ...prev,
      participant_ids: prev.participant_ids.includes(id)
        ? prev.participant_ids.filter((x) => x !== id)
        : [...prev.participant_ids, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...formData,
        participant_ids: formData.participant_ids,
        scheduled_at: formData.scheduled_at ? new Date(formData.scheduled_at).toISOString() : null,
      };
      await api.post('/meetings/meetings', payload);
      setShowForm(false);
      setFormData({ title: '', description: '', scheduled_at: '', location: '', participant_ids: [], notes: '', decisions: '', follow_up_actions: '' });
      fetchMeetings();
    } catch (err) {
      setError(err.message || 'Failed to create meeting');
    }
  };

  const formatDateTime = (d) => (d ? new Date(d).toLocaleString() : '-');
  const isUpcoming = (m) => new Date(m.scheduled_at) > new Date();
  const isCompleted = (m) => m.status === 'completed' || new Date(m.scheduled_at) < new Date();

  const upcoming = meetings.filter(isUpcoming).sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
  const past = meetings.filter((m) => !isUpcoming(m)).sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at));

  return (
    <div className="meetings-page">
      <header className="meetings-header">
        <h1>Meetings</h1>
        <p>Schedule and track internal meetings, notes, decisions, and follow-ups</p>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Schedule Meeting
        </button>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading meetings...</div>
      ) : (
        <>
          <section className="meetings-section">
            <h2>Upcoming Meetings</h2>
            {upcoming.length === 0 ? (
              <div className="empty-row">No upcoming meetings</div>
            ) : (
              <div className="meetings-list">
                {upcoming.map((m) => (
                  <div key={m.id} className="meeting-card" onClick={() => setViewMeeting(m)}>
                    <div className="meeting-title">{m.title}</div>
                    <div className="meeting-meta">{formatDateTime(m.scheduled_at)}</div>
                    {m.location && <div className="meeting-loc">{m.location}</div>}
                    {m.participants_list?.length > 0 && (
                      <div className="participants">
                        {m.participants_list.map((p) => p.userDetail?.name || p.userDetail?.username).filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="meetings-section">
            <h2>Past Meetings</h2>
            {past.length === 0 ? (
              <div className="empty-row">No past meetings</div>
            ) : (
              <div className="meetings-list">
                {past.map((m) => (
                  <div key={m.id} className="meeting-card past" onClick={() => setViewMeeting(m)}>
                    <div className="meeting-title">{m.title}</div>
                    <div className="meeting-meta">{formatDateTime(m.scheduled_at)}</div>
                    {m.decisions && <div className="meeting-summary">Decisions: {m.decisions.slice(0, 80)}...</div>}
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content wide" onClick={(e) => e.stopPropagation()}>
            <h2>Schedule Meeting</h2>
            <form onSubmit={handleSubmit}>
              <label>Title *</label>
              <input name="title" value={formData.title} onChange={handleChange} required />
              <label>Date & Time *</label>
              <input type="datetime-local" name="scheduled_at" value={formData.scheduled_at} onChange={handleChange} required />
              <label>Location</label>
              <input name="location" value={formData.location} onChange={handleChange} />
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={2} />
              {users.length > 0 && (
                <>
                  <label>Participants</label>
                  <div className="participant-checklist">
                    {users.map((u) => (
                      <label key={u.id} className="check-item">
                        <input
                          type="checkbox"
                          checked={formData.participant_ids.includes(u.id)}
                          onChange={() => toggleParticipant(u.id)}
                        />
                        {u.first_name || u.username} {u.last_name || ''}
                      </label>
                    ))}
                  </div>
                </>
              )}
              <div className="modal-buttons">
                <button type="submit" className="btn-primary">Schedule</button>
                <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewMeeting && (
        <div className="modal-overlay" onClick={() => setViewMeeting(null)}>
          <div className="modal-content wide" onClick={(e) => e.stopPropagation()}>
            <h2>{viewMeeting.title}</h2>
            <div className="meeting-detail">
              <p><strong>When:</strong> {formatDateTime(viewMeeting.scheduled_at)}</p>
              {viewMeeting.location && <p><strong>Where:</strong> {viewMeeting.location}</p>}
              {viewMeeting.description && <p><strong>Description:</strong> {viewMeeting.description}</p>}
              {viewMeeting.participants_list?.length > 0 && (
                <p><strong>Participants:</strong> {viewMeeting.participants_list.map((p) => p.userDetail?.name || p.userDetail?.username).filter(Boolean).join(', ')}</p>
              )}
              {viewMeeting.notes && <div><strong>Notes:</strong><pre>{viewMeeting.notes}</pre></div>}
              {viewMeeting.decisions && <div><strong>Decisions:</strong><pre>{viewMeeting.decisions}</pre></div>}
              {viewMeeting.follow_up_actions && <div><strong>Follow-up Actions:</strong><pre>{viewMeeting.follow_up_actions}</pre></div>}
            </div>
            <button className="btn-primary" onClick={() => setViewMeeting(null)}>Close</button>
          </div>
        </div>
      )}

      <style>{`
        .meetings-page { padding: 2rem; font-family: 'Segoe UI', sans-serif; }
        .meetings-header { margin-bottom: 1.5rem; }
        .meetings-header h1 { font-size: 1.8rem; color: #1e293b; }
        .meetings-header p { color: #64748b; margin: 0.5rem 0 1rem; }
        .btn-primary { background: #4953ff; color: #fff; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 600; }
        .btn-primary:hover { background: #3d46e0; }
        .alert { padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; }
        .alert-error { background: #fee2e2; color: #991b1b; }
        .loading { text-align: center; padding: 3rem; color: #64748b; }
        .meetings-section { margin-bottom: 2rem; }
        .meetings-section h2 { font-size: 1.2rem; color: #334155; margin-bottom: 1rem; }
        .empty-row { color: #94a3b8; padding: 1rem; }
        .meetings-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .meeting-card { background: #fff; border-radius: 10px; padding: 1rem 1.25rem; box-shadow: 0 2px 6px rgba(0,0,0,0.06); cursor: pointer; border-left: 4px solid #3b82f6; transition: transform 0.2s; }
        .meeting-card:hover { transform: translateX(4px); }
        .meeting-card.past { border-left-color: #94a3b8; opacity: 0.9; }
        .meeting-title { font-weight: 600; color: #1e293b; }
        .meeting-meta { font-size: 0.9rem; color: #64748b; margin-top: 0.25rem; }
        .meeting-loc, .participants { font-size: 0.85rem; color: #94a3b8; margin-top: 0.25rem; }
        .meeting-summary { font-size: 0.85rem; color: #64748b; margin-top: 0.5rem; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; overflow-y: auto; padding: 1rem; }
        .modal-content { background: #fff; padding: 2rem; border-radius: 12px; width: 90%; max-width: 480px; }
        .modal-content.wide { max-width: 560px; }
        .modal-content label { display: block; margin-top: 1rem; font-weight: 600; }
        .modal-content input, .modal-content select, .modal-content textarea { width: 100%; padding: 0.5rem; margin-top: 0.25rem; border-radius: 6px; border: 1px solid #cbd5e1; }
        .participant-checklist { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; margin-top: 0.5rem; }
        .check-item { display: flex; align-items: center; gap: 0.5rem; font-weight: normal; cursor: pointer; }
        .meeting-detail pre { white-space: pre-wrap; font-family: inherit; margin: 0.25rem 0; }
        .modal-buttons { display: flex; gap: 0.75rem; margin-top: 1.5rem; }
      `}</style>
    </div>
  );
};

export default Meetings;
