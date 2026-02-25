import React, { useState } from 'react';

const LostClients = ({ clients }) => {
  const [filter, setFilter] = useState('');

  // Filter lost clients by name, company, or email
  const filteredLostClients = clients.filter(client =>
    client.clientName.toLowerCase().includes(filter.toLowerCase()) ||
    client.companyName.toLowerCase().includes(filter.toLowerCase()) ||
    client.email.toLowerCase().includes(filter.toLowerCase())
  );

  if (clients.length === 0) return null;

  return (
    <section className="lost-clients-section">
      <h2>Lost Clients <span role="img" aria-label="lost">❌</span></h2>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search lost clients..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>

      {filteredLostClients.length === 0 ? (
        <p>No lost clients found matching your search.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Company Name</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Lost Date</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {filteredLostClients.map(client => (
              <tr key={client.id}>
                <td>{client.clientName}</td>
                <td>{client.companyName}</td>
                <td>{client.email}</td>
                <td>{client.contactNo}</td>
                <td>{client.lostDate || 'N/A'}</td>
                <td>{client.lostReason || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <style jsx>{`
        .lost-clients-section {
          margin-top: 2rem;
          background: #fee2e2;
          padding: 1rem;
          border-radius: 8px;
        }
        .search-bar input {
          width: 100%;
          padding: 0.5rem;
          margin-bottom: 1rem;
          border-radius: 6px;
          border: 1px solid #fca5a5;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 0.5rem 1rem;
          border: 1px solid #fca5a5;
          text-align: left;
        }
        th {
          background: #fecaca;
        }
      `}</style>
    </section>
  );
};

export default LostClients;
