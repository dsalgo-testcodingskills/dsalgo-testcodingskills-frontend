import React, { useState } from 'react';
import UICard from '../../components/UI/UICard';
import UIStepper from '../../components/UI/UIStepper';
import UICallout from '../../components/UI/UICallout';
import { SUBSCRIPTION_STRINGS, COLORS, SUBSCRIPTION_STATUS } from './subscriptionConstants';
import { createAddOnOrder } from '../../Services/api';
import { toast } from 'react-toastify';
import CustomToast from '../../components/CustomToast/CustomToast';
import UILoader from '../../components/UI/UILoader';

const AddOnsTab = ({ subDetails, pricing, onUpdate }) => {
  const [testQty, setTestQty] = useState(5);
  const [questionQty, setQuestionQty] = useState(10);
  const [loading, setLoading] = useState(false);

  const isActive = subDetails && subDetails.length > 0 && subDetails[0].status === SUBSCRIPTION_STATUS.ACTIVE;

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePay = async (type, quantity) => {
    try {
      setLoading(true);
      const isLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!isLoaded) {
        toast(<CustomToast type="error" message="Payment gateway failed to load." />);
        return;
      }

      const res = await createAddOnOrder({ type, quantity: parseInt(quantity) });
      const { id, amount } = res.data;

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: amount,
        currency: 'INR',
        name: `Extra ${type === 'test' ? 'Tests' : 'Questions'}`,
        order_id: id,
        handler: async () => {
          toast(<CustomToast type="success" message="Add-on successful!" />);
          if (onUpdate) await onUpdate();
        },
        theme: { color: COLORS.PRIMARY }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
        toast(<CustomToast type="error" message="Add-on failed." />);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-ons-view">
      <div className="section-label">{SUBSCRIPTION_STRINGS.TABS.ADD_ONS}</div>
      
      <UICard>
        <div style={{ marginBottom: '4px', fontWeight: 500 }}>{SUBSCRIPTION_STRINGS.ADD_ONS.TITLE}</div>
        <div style={{ fontSize: '12px', color: COLORS.GRAY_600, marginBottom: '20px' }}>{SUBSCRIPTION_STRINGS.ADD_ONS.SUBTITLE}</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <UICard  bordered={true} padding="16px">
            <div className="plan-name" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <i className="fas fa-file-alt"></i> {SUBSCRIPTION_STRINGS.ADD_ONS.EXTRA_TESTS}
            </div>
            <div className="plan-price" style={{ fontSize: '20px' }}>
                ₹{pricing.pricePerTest} <span style={{ fontSize: '12px' }}>{SUBSCRIPTION_STRINGS.ADD_ONS.PER_UNIT}</span>
            </div>
            <div style={{ fontSize: '11px', color: COLORS.GRAY_400, marginBottom: '12px' }}>Added to your current period instantly</div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <UIStepper value={testQty} onChange={setTestQty} />
            </div>

            <div
              title={
                !isActive
                  ? "Your subscription is inactive"
                  : loading
                    ? "loading..."
                    : ""
              }
            >
              <button
                className="plan-btn plan-btn-primary"
                style={{ marginTop: '16px' }}
                onClick={() => handlePay('test', testQty)}
                disabled={!isActive || loading}
              >
                {SUBSCRIPTION_STRINGS.ADD_ONS.PAY} ₹{testQty * pricing.pricePerTest}
              </button>
            </div>
          </UICard>

          <UICard bordered={true} padding="16px">
            <div className="plan-name" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <i className="fas fa-question-circle"></i> {SUBSCRIPTION_STRINGS.ADD_ONS.EXTRA_QUESTIONS}
            </div>
            <div className="plan-price" style={{ fontSize: '20px' }}>
                ₹{pricing.pricePerQuestion} <span style={{ fontSize: '12px' }}>{SUBSCRIPTION_STRINGS.ADD_ONS.PER_UNIT}</span>
            </div>
            <div style={{ fontSize: '11px', color: COLORS.GRAY_400, marginBottom: '12px' }}>Added to your current period instantly</div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <UIStepper value={questionQty} onChange={setQuestionQty} />
            </div>
            <div
              title={
                !isActive
                  ? "Your subscription is inactive"
                  : loading
                    ? "loading..."
                    : ""
              }
            >
              <button
                className="plan-btn plan-btn-primary"
                style={{ marginTop: '16px' }}
                onClick={() => handlePay('question', questionQty)}
                disabled={!isActive || loading}
              >
                {SUBSCRIPTION_STRINGS.ADD_ONS.PAY} ₹{questionQty * pricing.pricePerQuestion}
              </button>
            </div>
          </UICard>
        </div>

        <UICallout variant="info" style={{ marginTop: '20px' }}>
            Add-ons require an active Pro subscription. They are non-refundable and expire at the end of your billing period.
        </UICallout>
      </UICard>
      <UILoader isLoading={loading} />
    </div>
  );
};

export default AddOnsTab;
