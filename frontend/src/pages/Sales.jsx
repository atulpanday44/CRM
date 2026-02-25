import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import NewToBusiness from '../components/sales/NewToBusiness';
import ExistingClient from '../components/sales/ExistingClient';
import Pipeline from '../components/sales/Pipeline';
import SalesDashboard from '../components/sales/SalesDashboard';

const normalizeClient = (c) => {
  const name = c.assigned_to_detail
    ? [c.assigned_to_detail.first_name, c.assigned_to_detail.last_name].filter(Boolean).join(' ') || c.assigned_to_detail.username
    : '';
  return {
    ...c,
    clientName: c.client_name ?? c.clientName,
    companyName: c.company_name ?? c.companyName,
    contactNo: c.contact_no ?? c.contactNo,
    dealValue: c.deal_value ?? c.dealValue ?? 0,
    entryDate: c.entry_date ?? c.entryDate,
    closedDate: c.closed_date ?? c.closedDate,
    nextFollowUp: c.next_follow_up ?? c.nextFollowUp,
    assignedTo: name || (c.assigned_to_detail?.username),
  };
};

const normalizeFollowUp = (f) => ({
  ...f,
  clientId: f.client ?? f.clientId,
  date: f.date,
});

const Sales = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const loggedInUser = user?.name || user?.username || 'Pawan';
  const initialSalesForm = {
    date: '',
    clientName: '',
    companyName: '',
    address: '',
    country: '',
    contactNo: '',
    email: '',
    teamId: '',
    comments: '',
  };
  const [salesForm, setSalesForm] = useState(initialSalesForm);
  const [salesActivities, setSalesActivities] = useState([]);
  const [clients, setClients] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [salesServices, setSalesServices] = useState([
    'Bulk SMS',
    'OTP SMS',
    'Voice SMS',
    'Cloud Telephony',
    'WhatsApp Marketing',
    'API & SMPP Integration',
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [clientsRes, followUpsRes, servicesRes, activitiesRes] = await Promise.allSettled([
          api.get('/sales/clients'),
          api.get('/sales/follow-ups'),
          api.get('/sales/services'),
          api.get('/sales/activities'),
        ]);
        const clientsList = clientsRes.status === 'fulfilled' && Array.isArray(clientsRes.value)
          ? clientsRes.value.map(normalizeClient)
          : [];
        const followUpsList = followUpsRes.status === 'fulfilled' && Array.isArray(followUpsRes.value)
          ? followUpsRes.value.map(normalizeFollowUp)
          : [];
        const servicesList = servicesRes.status === 'fulfilled' && Array.isArray(servicesRes.value)
          ? servicesRes.value.map((s) => s.name || s)
          : salesServices;
        const activitiesList = activitiesRes.status === 'fulfilled' && Array.isArray(activitiesRes.value)
          ? activitiesRes.value.map((a) => ({
              id: a.id,
              date: a.date || a.created_at,
              activity: a.notes || a.activity_type || '',
            }))
          : [];
        setClients(clientsList);
        setFollowUps(followUpsList);
        setSalesServices(servicesList);
        setSalesActivities(activitiesList);
      } catch {
        setClients([]);
        setFollowUps([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const [selectedServicesNTB, setSelectedServicesNTB] = useState([]);
  const [selectedServicesExisting, setSelectedServicesExisting] = useState([]);
  const [newFollowUp, setNewFollowUp] = useState({
    clientId: '',
    date: '',
    notes: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientFilter, setClientFilter] = useState('');
  const [flashMessage, setFlashMessage] = useState(null);

  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    conversionFunnel: {},
    prospectToClosedRate: 0,
    averageTimeToClose: 0,
  });

  useEffect(() => {
    const closedDeals = clients.filter((c) => c.status === 'Closed');
    const totalRevenue = closedDeals.reduce((sum, deal) => sum + (Number(deal.dealValue) || 0), 0);

    const prospectCount = clients.filter(c => c.status === 'Prospect').length;
    const negotiationCount = clients.filter(c => c.status === 'Negotiation').length;
    const closedCount = closedDeals.length;
    const lostCount = clients.filter(c => c.status === 'Lost').length;
    const totalLeads = clients.length;

    const prospectToClosedRate = totalLeads > 0 ? ((closedCount + lostCount) / totalLeads) * 100 : 0;
    
    let totalDaysToClose = 0;
    closedDeals.forEach(deal => {
      const entryDate = new Date(deal.entryDate || deal.closedDate);
      const closeDate = new Date(deal.closedDate);
      if (deal.closedDate) {
        const diffTime = Math.abs(closeDate - entryDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        totalDaysToClose += diffDays;
      }
    });
    const averageTimeToClose = closedDeals.length > 0 ? totalDaysToClose / closedDeals.length : 0;

    setAnalytics({
      totalRevenue: totalRevenue,
      conversionFunnel: {
        totalLeads: totalLeads,
        prospect: prospectCount,
        negotiation: negotiationCount,
        closed: closedCount,
        lost: lostCount,
      },
      prospectToClosedRate: prospectToClosedRate.toFixed(2),
      averageTimeToClose: averageTimeToClose.toFixed(0),
    });
  }, [clients]);

  const handleStatusChange = async (clientId, newStatus) => {
    try {
      const payload = { status: newStatus };
      if (newStatus === 'Closed') payload.deal_value = 5000;
      const updated = await api.post(`/sales/clients/${clientId}/update_status`, payload);
      setClients((prev) => prev.map((c) => (c.id === clientId ? normalizeClient(updated) : c)));
    } catch {
      fetchClients();
    }
  };

  const fetchClients = async () => {
    try {
      const data = await api.get('/sales/clients');
      setClients(Array.isArray(data) ? data.map(normalizeClient) : []);
    } catch {
      setClients([]);
    }
  };

  const fetchFollowUps = async () => {
    try {
      const data = await api.get('/sales/follow-ups');
      setFollowUps(Array.isArray(data) ? data.map(normalizeFollowUp) : []);
    } catch {
      setFollowUps([]);
    }
  };

  const handleCardClick = (status) => {
    setTab('pipeline');
    setClientFilter(status.toLowerCase());
  };

  const handleSalesInputChange = (e) => {
    const { name, value } = e.target;
    setSalesForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleServiceNTB = (service) => {
    setSelectedServicesNTB((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };
  const toggleServiceExisting = (service) => {
    setSelectedServicesExisting((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };
  
  const handleSalesSubmit = async (e) => {
    e.preventDefault();
    const {
      date,
      clientName,
      companyName,
      address,
      country,
      contactNo,
      email,
      teamId,
      comments,
    } = salesForm;

    if (!date || !clientName || !address || !country || !contactNo || !email) {
      setFlashMessage({ text: 'Please fill in all required fields.', type: 'error' });
      return;
    }

    if (tab === 'ntb') {
      const isDuplicate = clients.some(
        (client) => client.email?.toLowerCase() === email.toLowerCase() || client.contactNo === contactNo
      );
      if (isDuplicate) {
        setFlashMessage({ text: 'This client already exists (Email or Contact already used).', type: 'error' });
        return;
      }
      try {
        const created = await api.post('/sales/clients', {
          client_name: clientName,
          company_name: companyName || clientName,
          email,
          contact_no: contactNo,
          address,
          country,
          status: 'Prospect',
          entry_date: date,
          assigned_to: user?.id || undefined,
          team_id: teamId || undefined,
          comments: comments || undefined,
          service_ids: selectedServicesNTB.length && salesServices.some((sv) => typeof sv === 'object' && sv.id)
            ? selectedServicesNTB.map((s) => {
                const found = salesServices.find((sv) => (typeof sv === 'string' ? sv : sv.name) === s);
                return found?.id;
              }).filter(Boolean)
            : undefined,
        });
        setClients((prev) => [...prev, normalizeClient(created)]);
        setFlashMessage({ text: 'Client created successfully.', type: 'success' });
      } catch (err) {
        setFlashMessage({ text: err.message || 'Failed to create client.', type: 'error' });
        return;
      }
      setSalesForm(initialSalesForm);
      setSelectedServicesNTB([]);
    } else if (tab === 'existing') {
      setFlashMessage({ text: 'Use the pipeline to update existing clients.', type: 'error' });
    }
  };

  const toggleFollowUpDone = async (id) => {
    try {
      const updated = await api.post(`/sales/follow-ups/${id}/toggle_done`);
      setFollowUps((prev) => prev.map((fu) => (fu.id === id ? normalizeFollowUp(updated) : fu)));
    } catch {
      fetchFollowUps();
    }
  };

  const handleNewFollowUpChange = (e) => {
    const { name, value } = e.target;
    setNewFollowUp((prev) => ({ ...prev, [name]: value }));
  };

  const addFollowUp = async (e) => {
    e.preventDefault();
    const { clientId, date, notes } = newFollowUp;
    if (!clientId || !date || !notes) {
      setFlashMessage({ text: 'Please fill all follow-up fields.', type: 'error' });
      return;
    }
    try {
      const created = await api.post('/sales/follow-ups', {
        client: Number(clientId),
        date,
        notes,
      });
      setFollowUps((prev) => [...prev, normalizeFollowUp(created)]);
      setClients((prev) =>
        prev.map((c) => (c.id === Number(clientId) ? { ...c, nextFollowUp: date } : c))
      );
      setNewFollowUp({ clientId: '', date: '', notes: '' });
      setIsModalOpen(false);
      setFlashMessage({ text: 'Follow-up added successfully.', type: 'success' });
    } catch (err) {
      setFlashMessage({ text: err.message || 'Failed to add follow-up.', type: 'error' });
    }
  };

  const getClientName = (id) => {
    const client = clients.find((c) => c.id === id);
    return client ? client.clientName : 'Unknown';
  };

  const sortedFollowUps = [...followUps].sort((a, b) => new Date(a.date) - new Date(b.date));

  const userClients = clients.filter(client => client.assignedTo === loggedInUser);

  const filteredClients = userClients.filter(client =>
    client.clientName.toLowerCase().includes(clientFilter.toLowerCase()) ||
    client.companyName.toLowerCase().includes(clientFilter.toLowerCase()) ||
    client.status.toLowerCase().includes(clientFilter.toLowerCase())
  );
  
  const leadsSummary = {
    total: analytics.conversionFunnel.totalLeads,
    prospect: analytics.conversionFunnel.prospect,
    negotiation: analytics.conversionFunnel.negotiation,
    closed: analytics.conversionFunnel.closed,
    lost: analytics.conversionFunnel.lost,
  };

  useEffect(() => {
    if (!flashMessage) return;
    const t = setTimeout(() => setFlashMessage(null), 4000);
    return () => clearTimeout(t);
  }, [flashMessage]);

  return (
    <div className="sales-page">
      {flashMessage && (
        <div
          role="alert"
          style={{
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: flashMessage.type === 'success' ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
            color: flashMessage.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
            fontSize: '0.9375rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{flashMessage.text}</span>
          <button type="button" onClick={() => setFlashMessage(null)} style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>Dismiss</button>
        </div>
      )}
      <header className="hero-section">
        <h1>Sales Department Dashboard</h1>
        <p>Manage your sales leads, clients, pipeline, and follow-ups here.</p>
      </header>

      <nav className="tab-nav">
        <button className={tab === 'dashboard' ? 'active' : ''} onClick={() => setTab('dashboard')} aria-label="Dashboard">
          Dashboard
        </button>
        <button className={tab === 'ntb' ? 'active' : ''} onClick={() => setTab('ntb')} aria-label="New to Business">
          New to Business
        </button>
        <button className={tab === 'existing' ? 'active' : ''} onClick={() => setTab('existing')} aria-label="Existing Client">
          Existing Client
        </button>
        <button className={tab === 'pipeline' ? 'active' : ''} onClick={() => setTab('pipeline')} aria-label="Pipeline">
          Pipeline
        </button>
      </nav>

      {tab === 'dashboard' && (
        <SalesDashboard
          leadsSummary={leadsSummary}
          salesActivities={salesActivities}
          sortedFollowUps={sortedFollowUps}
          getClientName={getClientName}
          handleCardClick={handleCardClick}
          analytics={analytics}
        />
      )}

      {tab === 'ntb' && (
        <NewToBusiness
          salesForm={salesForm}
          handleSalesInputChange={handleSalesInputChange}
          salesServices={salesServices}
          selectedServicesNTB={selectedServicesNTB}
          toggleServiceNTB={toggleServiceNTB}
          handleSalesSubmit={handleSalesSubmit}
        />
      )}
      
      {tab === 'existing' && (
        <ExistingClient
          salesForm={salesForm}
          handleSalesInputChange={handleSalesInputChange}
          salesServices={salesServices}
          selectedServicesExisting={selectedServicesExisting}
          toggleServiceExisting={toggleServiceExisting}
          handleSalesSubmit={handleSalesSubmit}
          clients={userClients}
        />
      )}

      {tab === 'pipeline' && (
        <Pipeline
          clients={userClients}
          filteredClients={filteredClients}
          clientFilter={clientFilter}
          setClientFilter={setClientFilter}
          sortedFollowUps={sortedFollowUps}
          getClientName={getClientName}
          toggleFollowUpDone={toggleFollowUpDone}
          setIsModalOpen={setIsModalOpen}
          isModalOpen={isModalOpen}
          newFollowUp={newFollowUp}
          handleNewFollowUpChange={handleNewFollowUpChange}
          addFollowUp={addFollowUp}
          handleStatusChange={handleStatusChange}
        />
      )}

      <style>{`
        body {
          background-color: #f4f7f9;
        }

        .sales-page {
          max-width: 1100px;
          margin: 40px auto;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #fff;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          padding: 30px;
        }

        /* ====== Hero Section ====== */
        .hero-section {
          text-align: center;
          margin-bottom: 30px;
          color: #333;
        }

        .hero-section h1 {
          font-size: 2.5em;
          color: #1a237e;
          margin-bottom: 5px;
        }

        .hero-section p {
          color: #666;
          font-size: 1em;
        }

        /* ====== Tab Navigation ====== */
        .tab-nav {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
          justify-content: center;
          background: #eef2f6;
          padding: 10px;
          border-radius: 8px;
        }

        .tab-nav button {
          padding: 12px 22px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 6px;
          font-weight: 600;
          color: #555;
          transition: all 0.3s ease;
        }

        .tab-nav button.active,
        .tab-nav button:hover {
          background: #1a237e;
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        /* ====== Forms & Grids ====== */
        form.sales-form,
        .pipeline-view {
          background: #fff;
          padding: 25px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .form-grid,
        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        label {
          display: flex;
          flex-direction: column;
          font-weight: 600;
          color: #444;
        }

        input[type="text"],
        input[type="email"],
        input[type="date"],
        input[type="tel"],
        select,
        textarea {
          padding: 10px 15px;
          font-size: 15px;
          border: 1px solid #ddd;
          border-radius: 5px;
          margin-top: 6px;
          font-family: inherit;
          transition: border-color 0.3s;
        }

        input:focus,
        select:focus,
        textarea:focus {
          outline: none;
          border-color: #1a237e;
          box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.2);
        }

        textarea {
          resize: vertical;
          min-height: 80px;
        }

        .comments-label {
          grid-column: 1 / -1;
        }

        /* ====== Buttons ====== */
        button.submit-btn {
          padding: 12px 20px;
          background: #1a237e;
          color: white;
          font-weight: bold;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.3s;
          max-width: 200px;
          align-self: flex-start;
          margin-top: 10px;
        }

        button.submit-btn:hover {
          background: #0d124c;
        }

        /* ====== Services Fieldset ====== */
        fieldset.services-fieldset {
          border: 1px solid #e0e0e0;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        legend {
          font-weight: 700;
          color: #333;
          padding: 0 10px;
        }

        .service-checkbox {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-weight: normal;
        }

        .service-checkbox input[type="checkbox"] {
          margin: 0;
          accent-color: #1a237e;
        }

        /* ====== Client Table ====== */
        .client-list-section table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin-bottom: 20px;
        }

        .client-list-section th,
        .client-list-section td {
          border: 1px solid #e0e0e0;
          padding: 12px;
          text-align: left;
          font-size: 14px;
        }

        .client-list-section th {
          background: #f0f4f7;
          font-weight: 600;
          color: #555;
          position: sticky;
          top: 0;
          z-index: 1;
        }

        .client-list-section tr:first-child th:first-child {
          border-top-left-radius: 8px;
        }

        .client-list-section tr:first-child th:last-child {
          border-top-right-radius: 8px;
        }

        .client-list-section tr:hover {
          background-color: #f6f8fa;
        }

        /* ====== Status Badges ====== */
        .status-badge {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 20px;
          color: white;
          font-size: 0.8em;
          font-weight: bold;
          text-transform: uppercase;
        }

        .status-badge.prospect { background: #17a2b8; }
        .status-badge.negotiation { background: #ffc107; }
        .status-badge.closed { background: #28a745; }
        .status-badge.lost { background: #dc3545; }

        .no-results {
          text-align: center;
          color: #999;
          font-style: italic;
          padding: 20px;
        }

        /* ====== Detailed Follow-ups ====== */
        .follow-ups-section {
          margin-top: 20px;
        }

        .follow-up-actions {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 15px;
        }

        .add-follow-up-btn {
          padding: 10px 18px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          transition: background-color 0.3s;
        }

        .add-follow-up-btn:hover {
          background: #218838;
        }

        .follow-up-list-detailed {
          list-style: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .follow-up-list-detailed li {
          background: #f8f9fa;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: transform 0.2s;
        }

        .follow-up-list-detailed li:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .follow-up-list-detailed li.done {
          background: #f0f4f7;
          border-color: #d0d0d0;
          text-decoration: line-through;
          opacity: 0.7;
        }

        .follow-up-list-detailed strong {
          font-size: 1.1em;
          color: #1a237e;
        }

        .follow-up-list-detailed p {
          margin: 5px 0 0;
          font-size: 0.9em;
        }

        .follow-up-list-detailed li span {
          display: block;
          font-size: 0.8em;
          color: #888;
          margin-top: 2px;
        }

        .toggle-done-btn {
          background: #17a2b8;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 13px;
          transition: background-color 0.3s;
        }

        .toggle-done-btn:hover {
          background: #138496;
        }

        .follow-up-list-detailed li.done .toggle-done-btn {
          background: #dc3545;
        }

        .follow-up-list-detailed li.done .toggle-done-btn:hover {
          background: #c82333;
        }

        /* ====== Modal Styles ====== */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: #fff;
          padding: 30px;
          border-radius: 10px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
          position: relative;
        }

        .modal-content form {
          gap: 15px;
        }

        .close-modal-btn {
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #999;
        }

        .close-modal-btn:hover {
          color: #333;
        }

        .new-follow-up-form {
          display: flex;
          flex-direction: column;
        }
      `}</style>    </div>
  );
};

export default Sales;