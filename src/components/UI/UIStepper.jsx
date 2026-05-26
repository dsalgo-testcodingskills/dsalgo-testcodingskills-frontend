import React from 'react';
import PropTypes from 'prop-types';

const UIStepper = ({ 
  value, 
  onChange, 
  min = 1, 
  max = 999,
  unitLabel = '',
  className = ''
}) => {
  const rowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const btnStyle = {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    border: '0.5px solid rgba(0,0,0,.2)',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    outline: 'none',
    userSelect: 'none'
  };

  const valStyle = {
    fontSize: '14px',
    fontWeight: '500',
    minWidth: '22px',
    textAlign: 'center'
  };

  const unitStyle = {
    fontSize: '12px',
    color: '#888780'
  };

  return (
    <div className={`ui-stepper ${className}`} style={rowStyle}>
      <button 
        type="button"
        style={btnStyle} 
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        <i className="fas fa-minus" style={{ fontSize: '10px' }}></i>
      </button>
      <span style={valStyle}>{value}</span>
      <button 
        type="button"
        style={btnStyle} 
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        <i className="fas fa-plus" style={{ fontSize: '10px' }}></i>
      </button>
      {unitLabel && <span style={unitStyle}>{unitLabel}</span>}
    </div>
  );
};

UIStepper.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  unitLabel: PropTypes.string,
  className: PropTypes.string
};

export default UIStepper;
