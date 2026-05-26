import React, { useState } from 'react';
import PropTypes from 'prop-types';

const UITooltip = ({ 
  children, 
  text, 
  position = 'top',
  className = ''
}) => {
  const [visible, setVisible] = useState(false);

  const containerStyle = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center'
  };

  const tooltipStyle = {
    position: 'absolute',
    background: '#2C2C2A',
    color: '#fff',
    fontSize: '11px',
    padding: '5px 9px',
    borderRadius: '5px',
    zIndex: 100,
    width: 'max-content',
    maxWidth: '200px',
    textAlign: 'center',
    visibility: visible ? 'visible' : 'hidden',
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.2s',
    ...(position === 'top' && { bottom: '120%', left: '50%', transform: 'translateX(-50%)' }),
    ...(position === 'bottom' && { top: '120%', left: '50%', transform: 'translateX(-50%)' }),
    ...(position === 'left' && { right: '120%', top: '50%', transform: 'translateY(-50%)' }),
    ...(position === 'right' && { left: '120%', top: '50%', transform: 'translateY(-50%)' }),
  };

  return (
    <div 
      className={`ui-tooltip-wrap ${className}`} 
      style={containerStyle}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      <div style={tooltipStyle}>
        {text}
      </div>
    </div>
  );
};

UITooltip.propTypes = {
  children: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired,
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  className: PropTypes.string
};

export default UITooltip;
