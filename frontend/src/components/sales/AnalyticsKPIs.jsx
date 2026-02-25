import React from 'react';

const AnalyticsKPIs = ({ analytics }) => {
  return (
    <div className="analytics-section">
      <div className="analytics-card">
        <h3>Revenue Generated</h3>
        <p className="analytics-value revenue">${analytics.totalRevenue.toLocaleString()}</p>
      </div>
      <div className="analytics-card">
        <h3>Avg. Time to Close</h3>
        <p className="analytics-value time">{analytics.averageTimeToClose} Days</p>
      </div>
      <div className="analytics-card">
        <h3>Prospect to Closed Rate</h3>
        <p className="analytics-value rate">{analytics.prospectToClosedRate}%</p>
      </div>
      
      <style>{`
        .analytics-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }
        .analytics-card {
          background: #f0f4f7;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        .analytics-card h3 {
          margin: 0 0 10px;
          color: #555;
          font-size: 1.1em;
        }
        .analytics-value {
          font-size: 2.2em;
          font-weight: bold;
          color: #1a237e;
        }
        .analytics-value.revenue { color: #28a745; }
        .analytics-value.time { color: #17a2b8; }
        .analytics-value.rate { color: #ffc107; }
      `}</style>
    </div>
  );
};

export default AnalyticsKPIs;