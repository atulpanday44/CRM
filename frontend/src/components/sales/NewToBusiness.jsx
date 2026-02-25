import React from 'react';
import SalesFormFields from './SalesFormField';

const NewToBusiness = ({
  salesForm,
  handleSalesInputChange,
  salesServices,
  selectedServicesNTB,
  toggleServiceNTB,
  handleSalesSubmit
}) => {
  return (
    <>
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

        .status-badge.closed {
          background-color: #28a745;
        }

        .status-badge.lost {
          background-color: #dc3545;
        }

        .no-results {
          text-align: center;
          color: #888;
          font-style: italic;
          padding: 20px;
        }
      `}</style>

      <form className="sales-form" onSubmit={handleSalesSubmit}>
        <h2>New to Business Form</h2>

        <SalesFormFields
          salesForm={salesForm}
          handleSalesInputChange={handleSalesInputChange}
          salesServices={salesServices}
          selectedServices={selectedServicesNTB}
          toggleService={toggleServiceNTB}
        />

        <div className="button-container">
          <button type="submit" className="submit-btn">
            Submit
          </button>
        </div>
      </form>
    </>
  );
};

export default NewToBusiness;
