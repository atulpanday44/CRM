import React, { useState } from 'react';

const Pipeline = ({
  clients,
  sortedFollowUps,
  getClientName,
  toggleFollowUpDone,
  setIsModalOpen,
  isModalOpen,
  newFollowUp,
  handleNewFollowUpChange,
  addFollowUp,
  handleStatusChange,
}) => {
  const [clientFilter, setClientFilter] = useState('');

  // Active clients exclude Closed and Lost
  const activeClients = clients.filter(client => client.status !== 'Closed' && client.status !== 'Lost');

  // Lost clients only
  const lostClients = clients.filter(client => client.status === 'Lost');

  // Filter active clients by search
  const filteredActiveClients = activeClients.filter(client =>
    client.clientName.toLowerCase().includes(clientFilter.toLowerCase()) ||
    client.status.toLowerCase().includes(clientFilter.toLowerCase())
  );

  // Filter lost clients by search
  const filteredLostClients = lostClients.filter(client =>
    client.clientName.toLowerCase().includes(clientFilter.toLowerCase()) ||
    client.status.toLowerCase().includes(clientFilter.toLowerCase())
  );

  return (
    <section className="pipeline-view">
      <h2>Pipeline Overview 🔎</h2>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search clients..."
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
        />
      </div>

      {/* Active Clients Section */}
      <div className="client-list-section">
        <h3>Active Clients</h3>
        <table>
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Status</th>
              <th>Next Follow-Up</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredActiveClients.length > 0 ? (
              filteredActiveClients.map(client => (
                <tr key={client.id}>
                  <td>{client.clientName}</td>
                  <td>
                    <select
                      value={client.status}
                      onChange={(e) => handleStatusChange(client.id, e.target.value)}
                      className={`status-select status-${client.status.toLowerCase()}`}
                    >
                      <option value="Prospect">Prospect</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Closed">Closed</option>
                      <option value="Lost">Lost</option>
                    </select>
                  </td>
                  <td>{client.nextFollowUp || 'N/A'}</td>
                  <td>
                    <a href={`mailto:${client.email}`}>Email</a> | <a href={`tel:${client.contactNo}`}>Call</a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-results">No active clients found matching your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Lost Clients Section */}
      <div className="client-list-section" style={{ marginTop: '2rem' }}>
        <h3>
          Lost Clients <span role="img" aria-label="lost client">❌</span>
        </h3>
        {filteredLostClients.length === 0 ? (
          <p>No lost clients found matching your search.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Company Name</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Deal Value</th>
                <th>Entry Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredLostClients.map(client => (
                <tr key={client.id} style={{ opacity: 0.6 }}>
                  <td>{client.clientName}</td>
                  <td>{client.companyName}</td>
                  <td>{client.contactNo}</td>
                  <td>
                    <span className={`status-badge status-lost`}>
                      {client.status}
                    </span>
                  </td>
                  <td>${client.dealValue}</td>
                  <td>{client.entryDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Follow-Ups Section */}
      <div className="follow-ups-section">
        <h3>Follow-Ups</h3>
        <div className="follow-up-actions">
          <button className="add-follow-up-btn" onClick={() => setIsModalOpen(true)}>Add New Follow-Up</button>
        </div>
        <ul className="follow-up-list-detailed">
          {sortedFollowUps.length === 0 && <li>No follow-ups scheduled.</li>}
          {sortedFollowUps.map((fu) => (
            <li key={fu.id} className={fu.done ? 'done' : ''}>
              <div>
                <strong>{getClientName(fu.clientId)}</strong>
                <span>{fu.date}</span>
                <p>{fu.notes}</p>
              </div>
              <button className="toggle-done-btn" onClick={() => toggleFollowUpDone(fu.id)}>
                {fu.done ? 'Undo' : 'Mark Done'}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal for new follow-up */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>×</button>
            <form className="new-follow-up-form" onSubmit={addFollowUp}>
              <h4>Add New Follow-Up</h4>
              <label>
                Select Client:
                <select name="clientId" value={newFollowUp.clientId} onChange={handleNewFollowUpChange} required>
                  <option value="">-- Select Client --</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.clientName}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Follow-Up Date:
                <input type="date" name="date" value={newFollowUp.date} onChange={handleNewFollowUpChange} required />
              </label>
              <label>
                Notes:
                <textarea name="notes" value={newFollowUp.notes} onChange={handleNewFollowUpChange} required placeholder="Enter follow-up notes" />
              </label>
              <button type="submit" className="submit-btn">Add Follow-Up</button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .status-select {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          border: 1px solid #ccc;
          background-color: white;
          font-size: 0.9rem;
          text-transform: capitalize;
        }
        .status-select.status-prospect { background-color: #fef3c7; color: #a16207; }
        .status-select.status-negotiation { background-color: #e0f2fe; color: #0c4a6e; }
        .status-select.status-closed { background-color: #dcfce7; color: #15803d; }
        .status-select.status-lost { background-color: #fee2e2; color: #991b1b; }
        
        .pipeline-view { padding: 1.5rem; background: white; border-radius: 8px; }
        .search-bar input { width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 20px; margin-bottom: 1.5rem; }
        .client-list-section table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        .client-list-section th, .client-list-section td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
        .client-list-section th { background: #f1f5f9; font-weight: 600; }
        .status-badge { padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; font-weight: 600; text-transform: capitalize; }
        
        .follow-ups-section { margin-top: 2rem; }
        .follow-up-list-detailed { list-style: none; padding: 0; }
        .follow-up-list-detailed li { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #f9fafb; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 0.75rem; transition: all 0.2s; }
        .follow-up-list-detailed li.done { opacity: 0.6; text-decoration: line-through; }
        .toggle-done-btn { background: none; border: 1px solid #cbd5e1; padding: 0.5rem 1rem; border-radius: 20px; cursor: pointer; font-size: 0.9rem; transition: background 0.3s; }
        .toggle-done-btn:hover { background: #f1f5f9; }
        
        /* Modal for new follow-up */
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal-content { background: white; padding: 2rem; border-radius: 8px; position: relative; width: 90%; max-width: 500px; }
        .close-modal-btn { position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 1.5rem; cursor: pointer; }
        .new-follow-up-form label { display: block; margin-bottom: 1rem; font-weight: 600; }
        .new-follow-up-form input,
        .new-follow-up-form select,
        .new-follow-up-form textarea { width: 100%; padding: 0.5rem; margin-top: 0.25rem; border: 1px solid #cbd5e1; border-radius: 4px; }
        .new-follow-up-form textarea { resize: vertical; min-height: 80px; }
        .submit-btn { background: #2563eb; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; font-weight: 700; }
        .submit-btn:hover { background: #1e40af; }
      `}</style>
    </section>
  );
};

export default Pipeline;
