import React from 'react';
import AnalyticsKPIs from './AnalyticsKPIs';

const SalesDashboard = ({ leadsSummary, salesActivities, sortedFollowUps, getClientName, handleCardClick, analytics }) => {
  return (
    <section className="dashboard-content">
      <div className="summary-cards">
        <div className="card" onClick={() => handleCardClick('')}>
          <h3>Total Leads</h3>
          <p className="card-value total">{leadsSummary.total}</p>
        </div>
        <div className="card" onClick={() => handleCardClick('Closed')}>
          <h3>Closed Deals</h3>
          <p className="card-value closed">{leadsSummary.closed}</p>
        </div>
        <div className="card" onClick={() => handleCardClick('Negotiation')}>
          <h3>In Negotiation</h3>
          <p className="card-value negotiation">{leadsSummary.negotiation}</p>
        </div>
        <div className="card" onClick={() => handleCardClick('Prospect')}>
          <h3>Prospects</h3>
          <p className="card-value prospect">{leadsSummary.prospect}</p>
        </div>
      </div>
      
      <AnalyticsKPIs analytics={analytics} />

      <div className="dashboard-sections">
        <div className="recent-activities-section">
          <h3>Recent Sales Activities 🚀</h3>
          <ul className="activity-list">
            {salesActivities.map((act) => (
              <li key={act.id}>
                <strong>{act.date}:</strong> {act.activity}
              </li>
            ))}
          </ul>
        </div>
        <div className="upcoming-follow-ups-section">
          <h3>Upcoming Follow-Ups 🗓️</h3>
          <ul className="follow-up-list">
            {sortedFollowUps.length === 0 && <li>No follow-ups scheduled.</li>}
            {sortedFollowUps.filter(fu => !fu.done).map((fu) => (
              <li key={fu.id}>
                <strong>{getClientName(fu.clientId)}</strong> on {fu.date}
                <p>{fu.notes}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style>{`
        .dashboard-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
          background: #fff;
          padding: 25px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .card {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
        }

        .card h3 {
          margin: 0 0 10px;
          color: #555;
          font-size: 1.1em;
        }

        .card-value {
          font-size: 2.5em;
          font-weight: bold;
          color: #1a237e;
        }

        .card-value.closed { color: #28a745; }
        .card-value.negotiation { color: #ffc107; }
        .card-value.prospect { color: #17a2b8; }
        .card-value.total { color: #1a237e; }

        .dashboard-sections {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .recent-activities-section,
        .upcoming-follow-ups-section {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }

        .activity-list,
        .follow-up-list {
          list-style: none;
          padding: 0;
        }

        .activity-list li,
        .follow-up-list li {
          border-bottom: 1px solid #eee;
          padding: 10px 0;
          font-size: 0.95em;
        }

        .activity-list li:last-child,
        .follow-up-list li:last-child {
          border-bottom: none;
        }

        .follow-up-list p {
          margin: 5px 0 0;
          color: #666;
        }
      `}</style>
    </section>
  );
};

export default SalesDashboard;