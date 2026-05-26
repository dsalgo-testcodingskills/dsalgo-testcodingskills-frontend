import React from 'react';
import PropTypes from 'prop-types';

const UILoader = ({ isLoading, message = 'Loading...' }) => {
  if (!isLoading) return null;

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    transition: 'opacity 0.3s ease'
  };

  const spinnerStyle = {
    width: '48px',
    height: '48px',
    border: '4px solid #F1EFE8',
    borderTop: '4px solid #24C5DA',
    borderRadius: '50%',
    animation: 'ui-spin 1s linear infinite',
    marginBottom: '16px'
  };

  const messageStyle = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#2C2C2A',
    letterSpacing: '0.02em'
  };

  return (
    <>
      <style>
        {`
          @keyframes ui-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={overlayStyle}>
        <div style={spinnerStyle}></div>
        <div style={messageStyle}>{message}</div>
      </div>
    </>
  );
};

UILoader.propTypes = {
  isLoading: PropTypes.bool,
  message: PropTypes.string
};

export default UILoader;
