import React from 'react';

const PageContainer = ({ title, sub, children }) => (
  <div className="sa-page">
    <div className="page-header" style={{ marginBottom: '0.2px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '600' }}>{title}</h2>
      {sub && <p style={{ color: '#718096' }}>{sub}</p>}
    </div>
    <div className="page-content">
      {children}
    </div>
  </div>
);

export default PageContainer;
