import React from 'react';

const SalesFunnel = ({ conversionFunnel }) => {
  return (
    <div className="sales-funnel-section">
      <h3>Sales Funnel</h3>
      <div className="funnel-container">
        <div className="funnel-stage total-leads">
          <span>Total Leads</span>
          <p>{conversionFunnel.totalLeads}</p>
        </div>
        <div className="funnel-stage prospect">
          <span>Prospects</span>
          <p>{conversionFunnel.prospect}</p>
        </div>
        <div className="funnel-stage negotiation">
          <span>Negotiation</span>
          <p>{conversionFunnel.negotiation}</p>
        </div>
        <div className="funnel-stage closed">
          <span>Closed Deals</span>
          <p>{conversionFunnel.closed}</p>
        </div>
      </div>
      
      <style>{`
        .sales-funnel-section {
          margin-bottom: 20px;
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
          text-align: center;
        }
        .sales-funnel-section h3 {
          margin-top: 0;
          color: #1a237e;
          border-bottom: 2px solid #eef2f6;
          padding-bottom: 10px;
        }
        .funnel-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          padding: 20px;
        }
        .funnel-stage {
          background: #e0e6ec;
          padding: 15px 30px;
          border-radius: 8px;
          width: 80%;
          text-align: center;
          position: relative;
          box-shadow: 0 2px 5px rgba(0,0,0,0.08);
          transition: transform 0.3s ease;
        }
        .funnel-stage::after {
          content: '▼';
          position: absolute;
          bottom: -15px;
          left: 50%;
          transform: translateX(-50%);
          color: #e0e6ec;
          font-size: 24px;
        }
        .funnel-stage:last-child::after {
          display: none;
        }
        .funnel-stage span {
          display: block;
          font-weight: bold;
          font-size: 1.1em;
          color: #333;
        }
        .funnel-stage p {
          margin: 5px 0 0;
          font-size: 1.5em;
          font-weight: bold;
        }
        .funnel-stage.total-leads { background-color: #1a237e; color: white; }
        .funnel-stage.total-leads p { color: white; }
        .funnel-stage.total-leads::after { color: #1a237e; }

        .funnel-stage.prospect { background-color: #17a2b8; color: white; }
        .funnel-stage.prospect p { color: white; }
        .funnel-stage.prospect::after { color: #17a2b8; }
        
        .funnel-stage.negotiation { background-color: #ffc107; color: #333; }
        .funnel-stage.negotiation p { color: #333; }
        .funnel-stage.negotiation::after { color: #ffc107; }

        .funnel-stage.closed { background-color: #28a745; color: white; }
        .funnel-stage.closed p { color: white; }
      `}</style>
    </div>
  );
};

export default SalesFunnel;