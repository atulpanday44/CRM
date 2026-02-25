import React from 'react';

const UserPerformanceModal = ({ userId, onClose, users = [], salesData = [] }) => {
  const user = users.find(u => u.id === userId);
  const userSalesData = salesData.filter(d => d.userId === userId);

  if (!user) {
    return (
      <div className="modal-overlay">
        <div className="modal">
          <p>User not found.</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  const closedDeals = userSalesData.filter(d => d.status === 'Closed');
  const lostDeals = userSalesData.filter(d => d.status === 'Lost');
  const totalLeads = userSalesData.filter(d => d.type === 'Lead').length;
  const totalRevenue = closedDeals.reduce((sum, deal) => sum + deal.value, 0);
  const conversionRate = totalLeads > 0 ? (closedDeals.length / totalLeads) * 100 : 0;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Performance of {user.name}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-content">
          <div className="kpi-grid">
            <div className="kpi-card">
              <h4>Total Revenue</h4>
              <p>${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="kpi-card">
              <h4>Closed Deals</h4>
              <p>{closedDeals.length}</p>
            </div>
            <div className="kpi-card">
              <h4>Lost Deals</h4>
              <p>{lostDeals.length}</p>
            </div>
            <div className="kpi-card">
              <h4>Conversion Rate</h4>
              <p>{conversionRate.toFixed(1)}%</p>
            </div>
          </div>
          <div className="activity-section">
            <h4>Recent Activities</h4>
            <ul>
              {userSalesData.slice(0, 5).map((activity, index) => (
                <li key={index}>
                  <strong>{activity.date}</strong>: {activity.notes || `${activity.type} - ${activity.status}`}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-close" onClick={onClose}>Close</button>
        </div>
      </div>
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e0e6ed;
          padding-bottom: 1rem;
          margin-bottom: 1.5rem;
        }
        .modal-header h3 {
          margin: 0;
          color: #1a237e;
        }
        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #888;
        }
        .close-btn:hover {
          color: #333;
        }
        .modal-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
          text-align: center;
        }
        .kpi-card {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid #e0e6ed;
        }
        .kpi-card h4 {
          margin: 0 0 0.5rem;
          font-size: 0.9rem;
          color: #555;
        }
        .kpi-card p {
          font-size: 1.5rem;
          font-weight: bold;
          color: #3f51b5;
          margin: 0;
        }
        .activity-section ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .activity-section li {
          padding: 0.75rem 0;
          border-bottom: 1px solid #eee;
        }
        .btn-close {
          display: block;
          width: 100%;
          padding: 0.75rem;
          margin-top: 1.5rem;
          background: #3f51b5;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.3s;
        }
        .btn-close:hover {
          background: #303f9f;
        }
      `}</style>
    </div>
  );
};

export default UserPerformanceModal;