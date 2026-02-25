import React from 'react';

const SalesFormFields = ({
  salesForm,
  handleSalesInputChange,
  salesServices,
  selectedServices,
  toggleService
}) => {
  return (
    <>
      <div className="sales-form-fields">
        <div className="form-grid">
          <label htmlFor="date">Date *</label>
          <input
            id="date"
            type="date"
            name="date"
            value={salesForm.date}
            onChange={handleSalesInputChange}
            required
          />

          <label htmlFor="clientName">Client Name *</label>
          <input
            id="clientName"
            type="text"
            name="clientName"
            value={salesForm.clientName}
            onChange={handleSalesInputChange}
            required
            placeholder="Enter client/company name"
          />

          <label htmlFor="companyName">Company Name (optional)</label>
          <input
            id="companyName"
            type="text"
            name="companyName"
            value={salesForm.companyName}
            onChange={handleSalesInputChange}
            placeholder="Enter company name"
          />

          <label htmlFor="address">Address *</label>
          <input
            id="address"
            type="text"
            name="address"
            value={salesForm.address}
            onChange={handleSalesInputChange}
            required
            placeholder="Client address"
          />

          <label htmlFor="country">Country *</label>
          <input
            id="country"
            type="text"
            name="country"
            value={salesForm.country}
            onChange={handleSalesInputChange}
            required
            placeholder="Country"
          />

          <label htmlFor="contactNo">Contact Number *</label>
          <input
            id="contactNo"
            type="tel"
            name="contactNo"
            value={salesForm.contactNo}
            onChange={handleSalesInputChange}
            required
            placeholder="+1-234-567-890"
            pattern="[0-9+()\\-\\s]*"
            title="Enter a valid phone number"
          />

          <label htmlFor="email">Email ID *</label>
          <input
            id="email"
            type="email"
            name="email"
            value={salesForm.email}
            onChange={handleSalesInputChange}
            required
            placeholder="email@example.com"
          />

          <label htmlFor="teamId">Team's ID (optional)</label>
          <input
            id="teamId"
            type="text"
            name="teamId"
            value={salesForm.teamId}
            onChange={handleSalesInputChange}
            placeholder="Sales team ID"
          />
        </div>

        <fieldset className="services-fieldset">
          <legend>Select Services</legend>
          <div className="services-grid">
            {salesServices.map((service) => (
              <label key={service} className="service-checkbox" htmlFor={`service-${service}`}>
                <input
                  id={`service-${service}`}
                  type="checkbox"
                  checked={selectedServices.includes(service)}
                  onChange={() => toggleService(service)}
                />
                <span className="checkbox-custom"></span>
                {service}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="comments-label" htmlFor="comments">
          Comments (optional)
        </label>
        <textarea
          id="comments"
          name="comments"
          value={salesForm.comments}
          onChange={handleSalesInputChange}
          placeholder="Additional comments"
          rows={4}
        />
      </div>

      <style jsx>{`
        .sales-form-fields {
          max-width: 700px;
          margin: 2rem auto;
          padding: 2.5rem 3rem;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333333;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.8rem 2rem;
        }

        .form-grid label {
          font-weight: 600;
          font-size: 1rem;
          color: #444444;
        }

        .form-grid input[type="text"],
        .form-grid input[type="email"],
        .form-grid input[type="tel"],
        .form-grid input[type="date"],
        .form-grid textarea {
          width: 100%;
          padding: 0.6rem 0.75rem;
          border: 1.6px solid #d1d5db;
          border-radius: 10px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
          box-sizing: border-box;
        }

        .form-grid input:focus,
        textarea:focus {
          border-color: #2563eb;
          outline: none;
          box-shadow: 0 0 8px rgba(37, 99, 235, 0.2);
        }

        .services-fieldset {
          border: 2px solid #2563eb;
          border-radius: 12px;
          margin: 2rem 0 1.5rem 0;
          padding: 1.2rem 1.8rem 1.6rem 1.8rem;
          background: #f3f4f6;
        }

        .services-fieldset legend {
          font-weight: 700;
          font-size: 1.15rem;
          color: #1e40af;
          padding: 0 8px;
        }

        .services-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.85rem 1.2rem;
          margin-top: 0.8rem;
        }

        .service-checkbox {
          user-select: none;
          font-weight: 600;
          font-size: 0.9rem;
          color: #374151;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .service-checkbox input[type="checkbox"] {
          margin-right: 0.45rem;
          width: 18px;
          height: 18px;
          accent-color: #2563eb;
        }

        .comments-label {
          font-weight: 600;
          font-size: 1rem;
          color: #444444;
          margin-top: 1rem;
          display: block;
        }

        textarea {
          resize: vertical;
          min-height: 90px;
          margin-top: 0.5rem;
          width: 100%;
        }

        @media (max-width: 720px) {
          .form-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem 0;
          }
        }
      `}</style>
    </>
  );
};

export default SalesFormFields;
