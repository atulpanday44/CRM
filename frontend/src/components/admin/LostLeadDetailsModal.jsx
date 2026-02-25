import React from 'react';

const LostLeadDetailsModal = ({ leadId, onClose, lostLeads = [] }) => {
  const lead = lostLeads.find(l => l.id === leadId);

  if (!lead) {
    return (
      <div className="modal-overlay">
        <div className="modal">
          <p>Lost lead details not found.</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Lost Lead Details</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-content">
          <div className="detail-item">
            <strong>Client:</strong>
            <p>{lead.client}</p>
          </div>
          <div className="detail-item">
            <strong>Reason for Loss:</strong>
            <p>{lead.reason}</p>
          </div>
          <div className="detail-item">
            <strong>Date of Loss:</strong>
            <p>{lead.date}</p>
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
          max-width: 500px;
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
          gap: 1rem;
        }
        .detail-item {
          padding: 0.75rem;
          border-radius: 8px;
          background: #f8f9fa;
        }
        .detail-item strong {
          display: block;
          margin-bottom: 0.25rem;
          color: #555;
        }
        .detail-item p {
          margin: 0;
          color: #333;
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

export default LostLeadDetailsModal;