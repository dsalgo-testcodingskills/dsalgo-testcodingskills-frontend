import React from 'react';
import PropTypes from 'prop-types';

const UICallout = ({ 
  children, 
  variant = 'info', 
  icon,
  className = '',
  style = {}
}) => {
  const variants = {
    info: { bg: '#E6F1FB', border: '#378ADD', color: '#185FA5', defaultIcon: 'fas fa-info-circle' },
    warning: { bg: '#FAEEDA', border: '#EF9F27', color: '#BA7517', defaultIcon: 'fas fa-exclamation-triangle' },
    danger: { bg: '#FCEBEB', border: '#E24B4A', color: '#A32D2D', defaultIcon: 'fas fa-times-circle' },
    success: { bg: '#E1F5EE', border: '#24C5DA', color: '#085041', defaultIcon: 'fas fa-check-circle' }
  };

  const current = variants[variant] || variants.info;

  const calloutStyle = {
    background: current.bg,
    borderLeft: `2.5px solid ${current.border}`,
    borderRadius: '0 8px 8px 0',
    padding: '10px 14px',
    fontSize: '12px',
    color: current.color,
    lineHeight: '1.6',
    margin: '10px 0',
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
    ...style
  };

  const iconClass = icon || current.defaultIcon;

  return (
    <div className={`ui-callout ${className}`} style={calloutStyle}>
      <i className={iconClass} style={{ marginTop: '2px' }}></i>
      <div>{children}</div>
    </div>
  );
};

UICallout.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['info', 'warning', 'danger', 'success']),
  icon: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object
};

export default UICallout;
