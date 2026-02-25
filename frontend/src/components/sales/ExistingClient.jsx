import React, { useState } from 'react';
import SalesFormFields from './SalesFormField';

const ExistingClient = ({
  salesForm,
  handleSalesInputChange,
  salesServices,
  selectedServicesExisting,
  toggleServiceExisting,
  handleSalesSubmit,
  clients
}) => {
  const [clientFilter, setClientFilter] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Filter clients with Closed or Lost status (completed clients)
  const completedClients = clients.filter(client => client.status === 'Closed' || client.status === 'Lost');

  // Filter clients based on search input for display
  const filteredClients = completedClients.filter(client =>
    client.clientName.toLowerCase().includes(clientFilter.toLowerCase()) ||
    client.companyName.toLowerCase().includes(clientFilter.toLowerCase()) ||
    client.status.toLowerCase().includes(clientFilter.toLowerCase())
  );

  // Check if a client exists based on companyName + contactNo + email (case insensitive)
  const clientExists = completedClients.some(client =>
    (salesForm.companyName && client.companyName.toLowerCase().trim() === salesForm.companyName.toLowerCase().trim()) ||
    (salesForm.contactNo && client.contactNo.trim() === salesForm.contactNo.trim()) ||
    (salesForm.email && client.email.toLowerCase().trim() === salesForm.email.toLowerCase().trim())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!clientExists) {
      setSubmitError("Client not found in the existing clients list. Please add them via 'New to Business'.");
      return;
    }
    handleSalesSubmit(e);
  };

  return (
    <>
      {submitError && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '8px', background: 'var(--color-error-bg)', color: 'var(--color-error)', fontSize: '0.9375rem' }}>
          {submitError}
        </div>
      )}
      <style>{`
        /* Container and Form */
        .existing-client-container {
          padding: 20px;
          max-width: 1200px;
          margin: auto;
        }

        .sales-form {
          background: #fff;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          margin: 0 auto; /* Center the form */
          max-width: 800px;
        }

        /* Form Heading */
        .sales-form h2 {
          text-align: center;
          color: #1a237e;
          font-size: 2.2em;
          margin-bottom: 30px;
        }

        /* Form Fields - Assuming SalesFormFields has these styles */
        .form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        .form-grid label {
          font-weight: 600;
          color: #444;
          display: flex;
          flex-direction: column;
        }
        .form-grid input,
        .form-grid select {
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          margin-top: 8px;
        }
        .form-grid textarea {
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          margin-top: 8px;
          resize: vertical;
        }

        /* Submit Button */
        .submit-btn {
          background-color: #1a237e;
          color: white;
          padding: 12px 25px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.3s ease;
          display: block; /* Ensures button is a block element for alignment */
          margin-left: auto; /* Pushes the button to the right */
        }
        .submit-btn:hover {
          background-color: #0d124c;
        }
        .submit-btn:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        /* Warning Message */
        .warning-msg {
          text-align: center;
          font-weight: bold;
          padding: 10px;
          border-radius: 8px;
          background-color: #ffebee;
          border: 1px solid #ef5350;
        }
        .warning-msg strong {
          color: #d32f2f;
        }

        /* Client List Section */
        .client-list-section {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 12px;
          margin-top: 40px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        }

        /* Section Heading */
        .client-list-section h3 {
          font-size: 1.8em;
          color: #1a237e;
          border-bottom: 3px solid #1a237e;
          display: inline-block;
          padding-bottom: 5px;
          margin-bottom: 5px;
        }

        .client-list-section p {
          color: #666;
          font-size: 1em;
          margin-top: 0;
          margin-bottom: 20px;
        }

        /* Search Bar */
        .search-bar input {
          width: 100%;
          padding: 12px 15px;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 1em;
          transition: border-color 0.3s;
        }
        .search-bar input:focus {
          outline: none;
          border-color: #1a237e;
        }

        /* Table */
        .client-list-section table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0 10px;
        }

        .client-list-section th,
        .client-list-section td {
          padding: 15px;
          text-align: left;
          font-size: 0.9em;
        }

        .client-list-section thead tr {
          background-color: #eef2f6;
          color: #555;
        }

        .client-list-section tbody tr {
          background-color: #ffffff;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .client-list-section tbody tr:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
        }

        /* Status Badges */
        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: bold;
          text-transform: uppercase;
          color: #fff;
          font-size: 0.75em;
        }
        .status-badge.closed { background-color: #28a745; }
        .status-badge.lost { background-color: #dc3545; }

        .no-results {
          text-align: center;
          color: #888;
          font-style: italic;
          padding: 20px;
        }
      `}</style>
      <div className="existing-client-container">
        <form className="sales-form" onSubmit={handleSubmit}>
          <h2>Existing Client Form</h2>
          <SalesFormFields
            salesForm={salesForm}
            handleSalesInputChange={handleSalesInputChange}
            salesServices={salesServices}
            selectedServices={selectedServicesExisting}
            toggleService={toggleServiceExisting}
          />
          {!clientExists && 
            (salesForm.companyName || salesForm.contactNo || salesForm.email) && (
            <p className="warning-msg">
              🚫 Client not found in the existing client list. Please add via <strong>New to Business</strong>.
            </p>
          )}
          <button type="submit" className="submit-btn" disabled={!clientExists}>
            Submit
          </button>
        </form>
        <section className="client-list-section">
          <h3>Your Existing Clients 💼</h3>
          <p>Clients with Closed or Lost status.</p>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search clients..."
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
            />
          </div>
          {filteredClients.length === 0 ? (
            <p className="no-results">No matching clients found.</p>
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
                {filteredClients.map((client) => (
                  <tr key={client.id}>
                    <td>{client.clientName}</td>
                    <td>{client.companyName}</td>
                    <td>{client.contactNo}</td>
                    <td>
                      <span className={`status-badge ${client.status.toLowerCase()}`}>
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
        </section>
      </div>
    </>
  );
};

export default ExistingClient;