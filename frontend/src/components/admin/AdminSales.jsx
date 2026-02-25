import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';

// --- Sub-Components ---
const SummaryCard = ({ title, value, color }) => (
  <div className="summary-card" style={{ borderTop: `4px solid ${color}` }}>
    <h4>{title}</h4>
    <p>{value}</p>
  </div>
);

const EmployeePerformanceView = ({ userId, onBack, users = [], salesLeads = [] }) => {
  const user = users.find(u => u.id === userId);
  const userLeads = salesLeads.filter(d => d.userId === userId);

  if (!user) {
    return (
      <div className="performance-view">
        <button className="btn-back" onClick={onBack}>← Back to Sales Team</button>
        <p>User not found.</p>
      </div>
    );
  }

  const closedLeads = userLeads.filter(d => d.status === 'Closed');
  const lostLeads = userLeads.filter(d => d.status === 'Lost');
  const totalLeads = userLeads.length;

  return (
    <div className="performance-view">
      <button className="btn-back" onClick={onBack}>← Back to Sales Team</button>
      <h3>Performance of {user.name}</h3>
      <div className="kpi-grid">
        <div className="kpi-card">
          <h4>Total Leads</h4>
          <p>{totalLeads}</p>
        </div>
        <div className="kpi-card">
          <h4>Closed Leads</h4>
          <p>{closedLeads.length}</p>
        </div>
        <div className="kpi-card">
          <h4>Lost Leads</h4>
          <p>{lostLeads.length}</p>
        </div>
      </div>
    </div>
  );
};

// --- Main AdminSales Component ---
const AdminSales = () => {
  const [activeTab, setActiveTab] = useState('clients');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [salesLeads, setSalesLeads] = useState([]);
  const [clientActivities, setClientActivities] = useState({});
  const [clientInfoData, setClientInfoData] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [clientsRes, usersRes, activitiesRes] = await Promise.allSettled([
          api.get('/sales/clients'),
          api.get('/accounts/users'),
          api.get('/sales/activities'),
        ]);
        const clientsList = clientsRes.status === 'fulfilled' && Array.isArray(clientsRes.value) ? clientsRes.value : [];
        const usersList = usersRes.status === 'fulfilled' && Array.isArray(usersRes.value) ? usersRes.value : [];
        const activitiesList = activitiesRes.status === 'fulfilled' && Array.isArray(activitiesRes.value) ? activitiesRes.value : [];

        const leads = clientsList.map((c) => ({
          id: c.id,
          client: c.client_name || c.clientName,
          status: c.status || 'Prospect',
          date: (c.entry_date || c.entryDate || '').toString(),
          userId: c.assigned_to || (c.assigned_to_detail?.id),
        }));
        setSalesLeads(leads);

        const byClient = {};
        activitiesList.forEach((a) => {
          const cid = a.client ?? a.client_id;
          if (!byClient[cid]) byClient[cid] = [];
          byClient[cid].push({
            type: a.activity_type || 'Activity',
            detail: a.notes || a.detail || '',
            date: (a.date || a.created_at || '').toString(),
          });
        });
        setClientActivities(byClient);

        const infoMap = {};
        clientsList.forEach((c) => {
          const name = c.client_name || c.clientName;
          const assignee = c.assigned_to_detail
            ? [c.assigned_to_detail.first_name, c.assigned_to_detail.last_name].filter(Boolean).join(' ') || c.assigned_to_detail.username
            : '';
          infoMap[name] = {
            clientName: name,
            companyName: c.company_name || c.companyName,
            address: c.address || '',
            contactNumber: c.contact_no || c.contactNo || '',
            email: c.email || '',
            manager: assignee,
          };
        });
        setClientInfoData(infoMap);

        setUsers(usersList.map((u) => ({
          id: u.id,
          name: [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username,
          role: u.role,
          email: u.email,
        })));
      } catch {
        setSalesLeads([]);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Client Dashboard Logic
  const [expandedClientId, setExpandedClientId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [modalClientName, setModalClientName] = useState(null);
  const today = new Date();
  const daysThreshold = 30;

  const clientsMap = salesLeads.reduce((acc, lead) => {
    if (!acc[lead.client]) acc[lead.client] = [];
    acc[lead.client].push(lead);
    return acc;
  }, {});

  const filteredClients = Object.entries(clientsMap)
    .filter(([client, leads]) => {
      if (filter === 'new') {
        return leads.some(({ date }) => (today - new Date(date)) / (1000 * 60 * 60 * 24) <= daysThreshold);
      } else if (filter === 'existing') {
        return !leads.some(({ date }) => (today - new Date(date)) / (1000 * 60 * 60 * 24) <= daysThreshold);
      }
      return true;
    })
    .flatMap(([client, leads]) => leads);

  const statusCounts = filteredClients.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {});

  const toggleDetails = (id) => setExpandedClientId(expandedClientId === id ? null : id);
  const openClientModal = (clientName) => setModalClientName(clientName);
  const closeClientModal = () => setModalClientName(null);
  const modalClientInfo = modalClientName ? clientInfoData[modalClientName] : null;

  // Render Logic
  const renderClientDashboard = () => (
    <>
      <div className="filter-group" role="group" aria-label="Filter clients">
        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Clients</button>
        <button className={`filter-btn ${filter === 'new' ? 'active' : ''}`} onClick={() => setFilter('new')}>New to Business</button>
        <button className={`filter-btn ${filter === 'existing' ? 'active' : ''}`} onClick={() => setFilter('existing')}>Existing Clients</button>
      </div>

      <div className="summary-container">
        <SummaryCard title="Total Leads" value={filteredClients.length} color="#3b82f6" />
        <SummaryCard title="Prospect" value={statusCounts['Prospect'] || 0} color="#f59e0b" />
        <SummaryCard title="Negotiation" value={statusCounts['Negotiation'] || 0} color="#2563eb" />
        <SummaryCard title="Closed" value={statusCounts['Closed'] || 0} color="#10b981" />
        <SummaryCard title="Lost" value={statusCounts['Lost'] || 0} color="#ef4444" />
      </div>

      {filteredClients.length === 0 ? (
        <p style={{ fontStyle: 'italic', color: '#64748b' }}>No leads matching the filter.</p>
      ) : (
        <table className="data-table" role="table" aria-label="Sales leads table">
          <thead>
            <tr>
              <th scope="col">Client</th>
              <th scope="col">Status</th>
              <th scope="col">Date</th>
              <th scope="col">Details</th>
              <th scope="col">Info</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map(({ id, client, status, date }) => (
              <React.Fragment key={id}>
                <tr>
                  <td>{client}</td>
                  <td><span className={`status-tag status-${status.toLowerCase()}`}>{status}</span></td>
                  <td>{date}</td>
                  <td><button onClick={() => toggleDetails(id)} aria-label={`View activities of ${client}`} className="btn-icon" type="button">👁️</button></td>
                  <td><button onClick={() => openClientModal(client)} aria-label={`View info of ${client}`} className="btn-icon" type="button">🛈</button></td>
                </tr>
                {expandedClientId === id && (
                  <tr className="client-details-row">
                    <td colSpan={5}>
                      <strong>Client Activity:</strong>
                      {clientActivities[id] && clientActivities[id].length > 0 ? (
                        <ul>
                          {clientActivities[id].map((activity, idx) => (<li key={idx}><strong>{activity.type}:</strong> {activity.detail} <em>({activity.date})</em></li>))}
                        </ul>
                      ) : (<p>No activities found.</p>)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
      {modalClientInfo && (
        <>
          <div className="modal-backdrop" onClick={closeClientModal} aria-hidden="true" />
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
            <h3 id="modalTitle">Client Information</h3>
            <p><strong>Client Name:</strong> {modalClientInfo.clientName}</p>
            <p><strong>Company Name:</strong> {modalClientInfo.companyName}</p>
            <p><strong>Address:</strong> {modalClientInfo.address}</p>
            <p><strong>Contact Number:</strong> {modalClientInfo.contactNumber}</p>
            <p><strong>Email:</strong> {modalClientInfo.email}</p>
            <p><strong>Manager:</strong> {modalClientInfo.manager}</p>
            <button onClick={closeClientModal} className="btn-close">Close</button>
          </div>
        </>
      )}
    </>
  );

  const renderEmployeePerformance = () => {
    if (selectedUserId) {
      return (
        <EmployeePerformanceView
          userId={selectedUserId}
          onBack={() => setSelectedUserId(null)}
          users={users}
          salesLeads={salesLeads}
        />
      );
    }
    const salesUsers = users.filter(u => (u.role || '').toLowerCase() === 'sales');
    return (
      <>
        <p>Select an employee to view their performance metrics.</p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {salesUsers.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <button className="btn-view-performance" onClick={() => setSelectedUserId(user.id)} aria-label={`View performance of ${user.name}`}>
                    View Performance
                  </button>
                </td>
              </tr>
            ))}
            {salesUsers.length === 0 && <tr><td colSpan="3" style={{ textAlign: 'center' }}>No sales employees found.</td></tr>}
          </tbody>
        </table>
      </>
    );
  };

  if (loading) {
    return (
      <div className="dept-container">
        <h2>Sales Department</h2>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dept-container">
      <h2>Sales Department</h2>
      <div className="tab-group" role="tablist">
        <button
          className={`tab-btn ${activeTab === 'clients' ? 'active' : ''}`}
          onClick={() => { setActiveTab('clients'); setSelectedUserId(null); }}
          role="tab"
          aria-selected={activeTab === 'clients'}
        >
          Client Dashboard
        </button>
        <button
          className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => { setActiveTab('employees'); setSelectedUserId(null); }}
          role="tab"
          aria-selected={activeTab === 'employees'}
        >
          Sales Team Performance
        </button>
      </div>

      <div className="tab-content" role="tabpanel">
        {activeTab === 'clients' ? renderClientDashboard() : renderEmployeePerformance()}
      </div>

      <style jsx>{`
        .dept-container { max-width: 900px; margin: 2rem auto; padding: 1rem 1.5rem; background: #f8fafc; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif; color: #1e293b; position: relative; z-index: 0; }
        h2 { margin-top: 0; margin-bottom: 1rem; font-weight: 700; }
        .tab-group { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 2px solid #e2e8f0; }
        .tab-btn { background: none; border: none; padding: 0.75rem 1.5rem; cursor: pointer; font-size: 1rem; font-weight: 600; color: #64748b; position: relative; transition: color 0.3s; }
        .tab-btn.active { color: #3b82f6; }
        .tab-btn.active::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 100%; height: 2px; background-color: #3b82f6; }
        .filter-group { display: flex; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
        .filter-btn { background: #e2e8f0; border: none; padding: 0.5rem 1rem; border-radius: 20px; cursor: pointer; font-weight: 600; color: #475569; transition: background 0.3s; }
        .filter-btn.active { background: #3b82f6; color: white; }
        .summary-container { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .summary-card { background: white; border-radius: 8px; padding: 1rem 1.5rem; box-shadow: 0 1px 4px rgba(0,0,0,0.1); flex: 1 1 140px; min-width: 140px; color: #334155; transition: box-shadow 0.2s; }
        .summary-card:hover { box-shadow: 0 4px 12px rgba(59,130,246,0.3); }
        .summary-card h4 { margin: 0 0 0.5rem; font-weight: 600; font-size: 1rem; }
        .summary-card p { font-size: 1.8rem; font-weight: 700; margin: 0; }
        .data-table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 6px rgba(0,0,0,0.1); }
        .data-table th, .data-table td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
        .data-table th { background: #e2e8f0; font-weight: 600; }
        .status-tag { padding: 0.2rem 0.6rem; border-radius: 4px; color: white; font-weight: 600; font-size: 0.85rem; display: inline-block; min-width: 72px; text-align: center; text-transform: capitalize; }
        .status-prospect { background: #f59e0b; }
        .status-negotiation { background: #2563eb; }
        .status-closed { background: #10b981; }
        .status-lost { background: #ef4444; }
        .client-details-row td { font-size: 0.9rem; color: #475569; background: #f9fafb; }
        .btn-icon { background: transparent; border: none; cursor: pointer; font-size: 1.3rem; transition: color 0.2s; padding: 0; }
        .btn-icon:hover { color: #3b82f6; }
        .modal-backdrop { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.3); z-index: 1000; }
        .modal { position: fixed; top: 50%; left: 50%; width: 320px; background: white; padding: 1.5rem 2rem; border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.2); transform: translate(-50%, -50%); z-index: 1001; }
        .modal h3 { margin-top: 0; margin-bottom: 1rem; }
        .modal p { margin: 0.3rem 0; color: #334155; font-size: 0.95rem; }
        .btn-close { margin-top: 1.2rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; transition: background 0.3s; }
        .btn-close:hover { background: #2563eb; }
        .btn-view-performance { background-color: #3b82f6; border: none; color: white; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 0.9rem; transition: background-color 0.3s ease; }
        .btn-view-performance:hover { background-color: #2563eb; }
        .performance-view { padding: 2rem; }
        .btn-back { background: none; border: none; color: #3b82f6; cursor: pointer; padding: 0; margin-bottom: 1.5rem; font-size: 1rem; font-weight: 600; }
        .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; text-align: center; margin-top: 1.5rem; }
        .kpi-card { background: white; padding: 1rem; border-radius: 8px; border: 1px solid #e0e6ed; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
        .kpi-card h4 { margin: 0 0 0.5rem; font-size: 0.9rem; color: #555; }
        .kpi-card p { font-size: 1.5rem; font-weight: bold; color: #3f51b5; margin: 0; }
      `}</style>
    </div>
  );
};

export default AdminSales;