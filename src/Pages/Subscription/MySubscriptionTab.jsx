import React, { useState } from 'react';
import UICard from '../../components/UI/UICard';
import UIBadge from '../../components/UI/UIBadge';
import UICallout from '../../components/UI/UICallout';
import { SUBSCRIPTION_STRINGS, SUBSCRIPTION_STATUS, COLORS } from './subscriptionConstants';
import moment from 'moment';
import { Dialog } from '@material-ui/core';

const MySubscriptionTab = ({ subDetails, orgMetrics, onCancel, planLimits }) => {
  const [open, setOpen] = useState(false);
  const activeSub = subDetails && subDetails.length > 0 && subDetails[0].status !== SUBSCRIPTION_STATUS.CREATED ? subDetails[0] : null; // If the status is created, we treat the user as being on the Free Starter Plan in the UI, and don't show any active subscription card.

  const freeLimits = planLimits?.free || { tests: 20, users: 3, customQuestions: 0 };
  const paidLimits = planLimits?.paid || { tests: 100, users: 10, customQuestions: 20, amount: 1000 };

  const isCancelled = activeSub?.status === SUBSCRIPTION_STATUS.CANCELLED;
  const testsMax = activeSub ? paidLimits.tests : freeLimits.tests;

  return (
    <div className="my-sub-view">
      {!activeSub ? (
      <UICard className="empty-state-card" style={{ marginTop: '24px' }}>
        <div className="empty-state">
          <div className="empty-icon"><i className="fas fa-calendar-times"></i></div>
          <div className="empty-title">{SUBSCRIPTION_STRINGS.MY_SUB.NO_ACTIVE}</div>
          <p className="page-sub" style={{ textAlign: 'center' }}>
            You&apos;re on the free Starter plan.<br />Upgrade to Pro to unlock more tests, questions and users.
          </p>
          <div style={{ marginTop: '24px', textAlign: 'left', maxWidth: '350px', margin: '24px auto 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span className="plan-name" style={{ fontSize: '13px' }}>Available Tests:</span>
              <span style={{ fontWeight: 500 }}>{orgMetrics?.availableTests ?? freeLimits.tests}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="plan-name" style={{ fontSize: '13px' }}>Available Custom Questions:</span>
              <span style={{ fontWeight: 500 }}>{orgMetrics?.availableCustomQuestions ?? freeLimits.customQuestions}</span>
            </div>
          </div>
        </div>
      </UICard>
    ) : (
    <>
      <div className="section-label">{SUBSCRIPTION_STRINGS.TABS.MY_SUBSCRIPTION}</div>
      
      <UICard>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div className="plan-name" style={{ marginBottom: '4px' }}>Plan</div>
            <div style={{ fontSize: '16px', fontWeight: 500 }}>Pro · ₹{paidLimits.amount?.toLocaleString()}/month</div>
          </div>
          <UIBadge variant={isCancelled ? 'amber' : 'teal'}>
            <i className={`fas ${isCancelled ? 'fa-exclamation-circle' : 'fa-check'}`}></i>
            {isCancelled ? `Cancelled (Access until ${activeSub.endDateString || moment(activeSub.current_end * 1000).format('DD MMM YYYY')})` : SUBSCRIPTION_STRINGS.MY_SUB.ACTIVE}
          </UIBadge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '32px' }}>
          <div>
            <div className="plan-name" style={{ fontSize: '10px' }}>{SUBSCRIPTION_STRINGS.MY_SUB.PERIOD_START}</div>
            <div style={{ fontSize: '14px', fontWeight: 500 }}>
              {activeSub.current_start ? moment(activeSub.current_start * 1000).format('DD MMM YYYY') : '-'}
            </div>
          </div>
          <div>
            <div className="plan-name" style={{ fontSize: '10px' }}>{SUBSCRIPTION_STRINGS.MY_SUB.NEXT_DEBIT}</div>
            <div style={{ fontSize: '14px', fontWeight: 500 }}>
              {activeSub.current_end ? moment(activeSub.current_end * 1000).format('DD MMM YYYY') : '-'}
            </div>
          </div>
          <div>
            <div className="plan-name" style={{ fontSize: '10px' }}>{SUBSCRIPTION_STRINGS.MY_SUB.MONTHS_PAID}</div>
            <div style={{ fontSize: '14px', fontWeight: 500 }}>{activeSub.paid_count}</div>
          </div>
          <div>
            <div className="plan-name" style={{ fontSize: '10px' }}>{SUBSCRIPTION_STRINGS.MY_SUB.MONTHS_LEFT}</div>
            <div style={{ fontSize: '14px', fontWeight: 500 }}>{activeSub.remaining_count}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
            <span className="plan-name" style={{ fontSize: '13px' }}>Available Tests</span>
            <span style={{ fontWeight: 500, fontSize: '15px' }}>{orgMetrics?.availableTests ?? 0}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px' }}>
            <span className="plan-name" style={{ fontSize: '13px' }}>Available Custom Questions</span>
            <span style={{ fontWeight: 500, fontSize: '15px' }}>{orgMetrics?.availableCustomQuestions ?? 0}</span>
          </div>
        </div>

        {(orgMetrics?.availableTests < (testsMax * 0.1)) && (
          <UICallout variant="warning">
            You&apos;re running low on tests. Consider buying an add-on or upgrading your plan to avoid interruption.
          </UICallout>
        )}

        {!isCancelled && (
          <div className="cancel-link" onClick={() => setOpen(true)} style={{ marginTop: '16px' }}>
            {SUBSCRIPTION_STRINGS.MY_SUB.CANCEL_LINK}
          </div>
        )}
      </UICard>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <div style={{ padding: '24px', maxWidth: '360px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', background: COLORS.RED_LT, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fas fa-exclamation-triangle" style={{ color: COLORS.RED, fontSize: '20px' }}></i>
                </div>
                <h5 style={{ margin: 0, fontWeight: 500 }}>Cancel subscription?</h5>
             </div>
          <p style={{ fontSize: '14px', color: COLORS.GRAY_600, marginBottom: '24px' }}>
            Your Pro access continues until <strong>{activeSub.current_end ? moment(activeSub.current_end * 1000).format('DD MMM YYYY') : '-'}</strong>. After that, you&apos;ll revert to the free Starter plan. This action cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
                className="plan-btn plan-btn-secondary" 
                style={{ margin: 0, flex: 1 }} 
                onClick={() => setOpen(false)}
            >
                Keep plan
            </button>
            <button 
                className="plan-btn" 
                style={{ margin: 0, flex: 1, background: COLORS.RED_MD, color: '#fff' }} 
                onClick={() => { onCancel(); setOpen(false); }}
            >
                Yes, cancel
            </button>
          </div>
        </div>
      </Dialog>
        </>
      )}
    </div>
  );
};

export default MySubscriptionTab;
