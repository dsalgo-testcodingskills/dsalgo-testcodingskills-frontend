import React from 'react';
import PropTypes from 'prop-types';

const UICard = ({ 
  children, 
  className = '', 
  padding = '20px', 
  borderRadius = '12px', 
  bordered = true,
  background = '#fff',
  featured = false,
  featuredColor = '#24C5DA',
  style = {}
}) => {
  const cardStyle = {
    background,
    borderRadius,
    padding,
    border: featured 
      ? `2px solid ${featuredColor}` 
      : (bordered ? '0.5px solid rgba(0,0,0,0.12)' : 'none'),
    position: 'relative',
    ...style
  };

  return (
    <div className={`ui-card ${className}`} style={cardStyle}>
      {children}
    </div>
  );
};

UICard.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  padding: PropTypes.string,
  borderRadius: PropTypes.string,
  bordered: PropTypes.bool,
  background: PropTypes.string,
  featured: PropTypes.bool,
  featuredColor: PropTypes.string,
  style: PropTypes.object
};

export default UICard;
