import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Dialog } from '@material-ui/core';

const UITermsModal = ({ open, onClose, onAccept }) => {
  const [accepted, setAccepted] = useState(false);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm">
      <div style={{ padding: '28px', fontFamily: 'Rubik, sans-serif' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>Terms & Conditions</h3>
        <div style={{ 
          fontSize: '13px', 
          lineHeight: '1.6', 
          color: '#5F5E5A', 
          maxHeight: '300px', 
          overflowY: 'auto',
          padding: '12px',
          background: '#F1EFE8',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <p>By subscribing to the Pro plan, you agree to the following:</p>
          <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
            <li>Subscription is valid for 12 months with monthly auto-debit.</li>
            <li>Total commitment is for 12 billing cycles.</li>
            <li>Credits (Tests & Questions) are added every 30 days upon successful payment.</li>
            <li>Unused credits roll over to the following month as long as the subscription is active.</li>
            <li>Cancellation stops future debits, but access continues until the current cycle ends.</li>
            <li>Upon full expiration after cancellation, account reverts to Free tier and all Pro credits are reset.</li>
          </ul>
        </div>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer', marginBottom: '24px' }}>
          <input 
            type="checkbox" 
            checked={accepted} 
            onChange={(e) => setAccepted(e.target.checked)} 
            style={{ width: '16px', height: '16px', accentColor: '#24C5DA' }}
          />
          I have read and agree to the 12-month subscription terms.
        </label>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={onClose}
            style={{ 
              flex: 1, padding: '10px', borderRadius: '8px', border: '0.5px solid #D3D1C7', 
              background: 'transparent', cursor: 'pointer', fontSize: '14px' 
            }}
          >
            Cancel
          </button>
          <button 
            disabled={!accepted}
            onClick={onAccept}
            style={{ 
              flex: 1, padding: '10px', borderRadius: '8px', border: 'none', 
              background: accepted ? '#24C5DA' : '#D3D1C7', color: '#fff', 
              cursor: accepted ? 'pointer' : 'not-allowed', fontSize: '14px', fontWeight: 500
            }}
          >
            Accept & Proceed
          </button>
        </div>
      </div>
    </Dialog>
  );
};

UITermsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAccept: PropTypes.func.isRequired
};

export default UITermsModal;
