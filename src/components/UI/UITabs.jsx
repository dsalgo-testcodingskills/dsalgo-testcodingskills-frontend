import React from 'react';
import PropTypes from 'prop-types';
import { COLORS } from '../../Pages/Subscription/subscriptionConstants';

const UITabs = ({ 
  tabs, 
  activeTab, 
  onChange, 
  className = ''
}) => {
  const tabRowStyle = {
    display: 'flex',
    gap: '2px',
    background: COLORS.BLUE_LT,
    borderRadius: '10px',
    padding: '3px',
    marginBottom: '24px'
  };

  const getTabStyle = (isActive) => ({
    flex: 1,
    textAlign: 'center',
    padding: '8px 4px',
    fontSize: '13px',
    borderRadius: '8px',
    cursor: 'pointer',
    color: isActive ? '#2C2C2A' : '#888780',
    background: isActive ? '#fff' : 'transparent',
    fontWeight: isActive ? '500' : '400',
    border: isActive ? '0.5px solid rgba(0,0,0,.1)' : 'none',
    transition: 'all .15s'
  });

  return (
    <div className={`ui-tabs ${className}`} style={tabRowStyle}>
      {tabs.map((tab) => (
        <div 
          key={tab.id}
          style={getTabStyle(activeTab === tab.id)}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </div>
      ))}
    </div>
  );
};

UITabs.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
  })).isRequired,
  activeTab: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default UITabs;
