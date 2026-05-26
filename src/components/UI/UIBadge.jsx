import React from 'react';
import PropTypes from 'prop-types';

const UIBadge = ({ 
  children, 
  variant = 'teal', 
  className = '',
  pill = true,
  style = {}
}) => {
  const variants = {
    teal: { bg: '#E1F5EE', color: '#085041' },
    amber: { bg: '#FAEEDA', color: '#BA7517' },
    red: { bg: '#FCEBEB', color: '#A32D2D' },
    blue: { bg: '#E6F1FB', color: '#185FA5' },
    purple: { bg: '#EEEDFE', color: '#3C3489' },
    gray: { bg: '#F1EFE8', color: '#5F5E5A' }
  };

  const currentVariant = variants[variant] || variants.gray;

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '11px',
    fontWeight: '400',
    padding: pill ? '3px 9px' : '4px 8px',
    borderRadius: pill ? '20px' : '4px',
    letterSpacing: '.04em',
    background: currentVariant.bg,
    color: currentVariant.color,
    ...style
  };

  return (
    <span className={`ui-badge ${className}`} style={badgeStyle}>
      {children}
    </span>
  );
};

UIBadge.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['teal', 'amber', 'red', 'blue', 'purple', 'gray']),
  className: PropTypes.string,
  pill: PropTypes.bool,
  style: PropTypes.object
};

export default UIBadge;
