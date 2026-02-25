// src/components/KpiCard.jsx
import React from 'react';
import PropTypes from 'prop-types';

/**
 * A reusable KPI card component to display key metrics
 */
const KpiCard = ({ title, value, icon, color = '#fff', textColor = '#000' }) => (
  <div
    role="region"
    aria-label={`${title} KPI`}
    style={{
      flex: 1,
      padding: '1.5rem',
      backgroundColor: color,
      color: textColor,
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      minWidth: '150px',
      boxSizing: 'border-box',
    }}
  >
    <div style={{ fontSize: '2rem' }}>{icon}</div>
    <div>
      <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>{title}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>{value}</div>
    </div>
  </div>
);

KpiCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node,
  color: PropTypes.string,
  textColor: PropTypes.string,
};

export default KpiCard;
