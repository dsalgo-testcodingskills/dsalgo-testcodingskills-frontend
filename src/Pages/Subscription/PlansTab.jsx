import React, { useState } from 'react';
import { toast } from 'react-toastify';
import UICard from '../../components/UI/UICard';
import { SUBSCRIPTION_STRINGS, COLORS, SUBSCRIPTION_STATUS } from './subscriptionConstants';
import { createSubscription, updatePaymentStatus } from '../../Services/api';
import { RAZOR_PAY_PLAN_ID } from '../../utils/constants';
import CustomToast from '../../components/CustomToast/CustomToast';
import UITooltip from '../../components/UI/UITooltip';
import UICallout from '../../components/UI/UICallout';
import UITermsModal from '../../components/UI/UITermsModal';
import { Dialog } from '@material-ui/core';
import moment from 'moment';
import CustomLoadingAnimation from '../../components/CustomLoadingAnimation';

const PlansTab = ({ subDetails, onUpdate, planLimits }) => {
  const [loading, setLoading] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const activeSub = subDetails && subDetails.length > 0 && subDetails[0].status === SUBSCRIPTION_STATUS.ACTIVE ? subDetails[0] : null;
  const cancelledSub = subDetails && subDetails.length > 0 && subDetails[0].status === SUBSCRIPTION_STATUS.CANCELLED ? subDetails[0] : null;

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribeClick = () => {
    if (activeSub) {
      toast(<CustomToast type="info" message="You already have an active subscription." />);
      return;
    }
    if (cancelledSub) {
      setInfoOpen(true);
      return;
    }
    setTermsOpen(true);
  };

  const confirmSubscription = async (planId) => {
    setTermsOpen(false);
    try {
      setLoading(true);
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!res) {
        toast(<CustomToast type="error" message="Razorpay SDK failed to load." />);
        return;
      }

      const result = await createSubscription({ planId, termsAccepted: true });
      if (!result) return;

      const { id, notes } = result.data;
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        name: 'CODE B.',
        description: 'Plan Subscription',
        subscription_id: id,
        handler: async (response) => {
          if (response) {
            toast(<CustomToast type="success" message="Payment Successful" />);
            await updatePaymentStatus();
            if (onUpdate) await onUpdate();
          }
        },
        notes: notes,
        theme: { color: COLORS.PRIMARY }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const freeLimits = planLimits?.free || { tests: 20, users: 3, customQuestions: 0 };
  const paidLimits = planLimits?.paid || { tests: 100, users: 10, customQuestions: 20, amount: 1000 };

  return (
    <div className="plans-view">
      <div className="section-label">{SUBSCRIPTION_STRINGS.TABS.PLANS}</div>
      
      <div className="plans-grid">
        <UICard className="plan-card">
          <div className="plan-name">{SUBSCRIPTION_STRINGS.PLANS.STARTER}</div>
          <div className="plan-price">{SUBSCRIPTION_STRINGS.PLANS.FREE}</div>
          <div className="plan-cycle">Always available · no card needed</div>
          
          <div className="plan-feature">
            <i className="fas fa-check-circle"></i>
            <span>{freeLimits.tests} tests / 30 days</span>
          </div>
          <div className="plan-feature">
            <i className="fas fa-check-circle"></i>
            <span>{freeLimits.customQuestions} custom questions</span>
          </div>
          <div className="plan-feature">
            <i className="fas fa-check-circle"></i>
            <span>{freeLimits.users} users</span>
          </div>

          <div style={{ height: '40px', marginTop: '20px' }}></div>
          <p style={{ fontSize: '11px', color: COLORS.GRAY_400, textAlign: 'center', marginTop: '12px' }}>
            Resets every 30 days automatically
          </p>
        </UICard>

        <UICard className="plan-card" featured={true}>
            <div style={{ 
                position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)', 
                background: COLORS.PRIMARY, color: '#fff', fontSize: '10px', fontWeight: '500', 
                padding: '2px 12px', borderRadius: '20px', whiteSpace: 'nowrap', zIndex: 1
            }}>
                {SUBSCRIPTION_STRINGS.PLANS.MOST_POPULAR}
            </div>
          <div className="plan-name">{SUBSCRIPTION_STRINGS.PLANS.PRO}</div>
          <div className="plan-price">₹{paidLimits.amount?.toLocaleString() || '0'} <span>{SUBSCRIPTION_STRINGS.PLANS.PER_MONTH}</span></div>
          <div className="plan-cycle">
            Billed monthly · 
            <UITooltip text={`Your card will be charged ₹${paidLimits.amount?.toLocaleString() || '0'} automatically each month. Cancel anytime.`}>
                <span style={{ borderBottom: '1px dotted', cursor: 'help', marginLeft: '4px' }}>
                    {SUBSCRIPTION_STRINGS.PLANS.COMMITMENT}
                </span>
            </UITooltip>
          </div>
          
          <div className="plan-feature">
            <i className="fas fa-check-circle"></i>
            <span>{paidLimits.tests} tests / 30 days</span>
          </div>
          <div className="plan-feature">
            <i className="fas fa-check-circle"></i>
            <span>{paidLimits.customQuestions} custom questions</span>
          </div>
          <div className="plan-feature">
            <i className="fas fa-check-circle"></i>
            <span>{paidLimits.users} sub-users</span>
          </div>
          <div title={
            activeSub
              ? "You already have an active subscription"
              : loading
                ? "loading..."
                : ""
          }>
            <button
              className="plan-btn plan-btn-primary"
              onClick={handleSubscribeClick}
              disabled={loading || activeSub}
            >
              {activeSub ? 'Active Plan' : `${SUBSCRIPTION_STRINGS.PLANS.SUBSCRIBE} — ₹${paidLimits.amount.toLocaleString()} ${SUBSCRIPTION_STRINGS.PLANS.PER_MONTH}`}
            </button>
          </div>
          <p style={{ fontSize: '11px', color: COLORS.GRAY_400, textAlign: 'center', marginTop: '12px' }}>
            Total commitment: ₹{(paidLimits.amount * 12).toLocaleString()} · auto-debited monthly
          </p>
        </UICard>
      </div>

      <UICallout variant="info">
        {SUBSCRIPTION_STRINGS.PLANS.AUTO_DEBIT_HELP} You can cancel anytime; access continues until the current period ends. 
        <strong> If you cancel, Pro credits reset upon expiration.</strong>
      </UICallout>

      <UITermsModal 
        open={termsOpen} 
        onClose={() => setTermsOpen(false)} 
        onAccept={() => confirmSubscription(RAZOR_PAY_PLAN_ID)} 
      />

      <Dialog open={infoOpen} onClose={() => setInfoOpen(false)}>
        <div style={{ padding: '24px', maxWidth: '360px', textAlign: 'center' }}>
          <i className="fas fa-info-circle" style={{ fontSize: '32px', color: COLORS.BLUE, marginBottom: '16px' }}></i>
          <h5 style={{ marginBottom: '12px' }}>Subscription Active</h5>
          <p style={{ fontSize: '14px', color: COLORS.GRAY_600, lineHeight: 1.6 }}>
            You have a cancelled subscription that is still active until <strong>{cancelledSub?.current_end ? moment(cancelledSub.current_end * 1000).format('DD MMM YYYY') : '-'}</strong>. 
            You can resubscribe only after this period fully expires.
          </p>
          <button 
            className="plan-btn plan-btn-primary" 
            style={{ marginTop: '20px' }}
            onClick={() => setInfoOpen(false)}
          >
            Got it
          </button>
        </div>
      </Dialog>
      <CustomLoadingAnimation isLoading={loading} />
    </div>
  );
};

export default PlansTab;
