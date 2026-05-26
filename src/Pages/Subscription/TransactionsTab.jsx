import React, { useState } from 'react';
import UICard from '../../components/UI/UICard';
import UIBadge from '../../components/UI/UIBadge';
import { SUBSCRIPTION_STRINGS, COLORS } from './subscriptionConstants';
import moment from 'moment';

const TransactionsTab = ({ paymentData, page, total, limit, onChangePage }) => {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'captured':
        return <UIBadge variant="teal">Paid</UIBadge>;
      case 'initiated':
        return <UIBadge variant="amber">Pending</UIBadge>;
      case 'failed':
        return <UIBadge variant="red">Failed</UIBadge>;
      default:
        return <UIBadge variant="gray">{status}</UIBadge>;
    }
  };

  const totalPages = Math.ceil(total / limit);

  const groupedData = paymentData?.reduce((acc, current) => {
    const orderId = current.order_id || 'manual';
    if (!acc[orderId]) {
      acc[orderId] = {
        ...current,
        items: [current]
      };
    } else {
      acc[orderId].items.push(current);
      if (current.status === 'captured') {
        acc[orderId].status = 'captured';
        acc[orderId].amount = current.amount;
        acc[orderId].createdAt = current.createdAt;
      }
    }
    return acc;
  }, {});

  const displayData = Object.values(groupedData || []);

  return (
    <div className="transactions-view">
      <div className="section-label">{SUBSCRIPTION_STRINGS.TABS.TRANSACTIONS}</div>

      <UICard padding="0" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>{SUBSCRIPTION_STRINGS.TRANSACTIONS.TITLE}</div>
          {total > 0 && (
            <div style={{ fontSize: '12px', color: COLORS.GRAY_600 }}>
              Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)} of {total}
            </div>
          )}
        </div>

        <table className="tx-table">
          <thead>
            <tr>
              <th>{SUBSCRIPTION_STRINGS.TRANSACTIONS.TABLE_HEADERS.SERIAL}</th>
              <th>{SUBSCRIPTION_STRINGS.TRANSACTIONS.TABLE_HEADERS.DATE}</th>
              <th>{SUBSCRIPTION_STRINGS.TRANSACTIONS.TABLE_HEADERS.DESCRIPTION}</th>
              <th>{SUBSCRIPTION_STRINGS.TRANSACTIONS.TABLE_HEADERS.AMOUNT}</th>
              <th>{SUBSCRIPTION_STRINGS.TRANSACTIONS.TABLE_HEADERS.STATUS}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {displayData.length > 0 ? displayData.map((tx, idx) => (
              <React.Fragment key={tx._id || idx}>
                <tr>
                  <td style={{ color: COLORS.GRAY_400 }}>{(page - 1) * limit + idx + 1}</td>
                  <td>{tx.createdAt ? moment(tx.createdAt).format('DD MMM YYYY') : '-'}</td>
                  <td>
                    {tx.notes?.type === 'add-on'
                      ? `Extra ${tx.notes?.itemType === 'test' ? 'Tests' : 'Questions'} (Qty: ${tx.notes?.quantity})`
                      : (tx.description || tx.notes?.purpose || 'Pro Plan Subscription')}
                  </td>
                  <td>₹{tx.amount ? (tx.amount / 100).toLocaleString() : '-'}</td>
                  <td>{getStatusBadge(tx.status)}</td>
                  <td>
                    <div className="tx-expand" onClick={() => toggleExpand(tx._id || idx)}>
                      <i className={`fas ${expandedId === (tx._id || idx) ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                      {SUBSCRIPTION_STRINGS.TRANSACTIONS.DETAILS}
                    </div>
                  </td>
                </tr>
                {expandedId === (tx._id || idx) && (
                  <tr>
                    <td colSpan="6" style={{ padding: '0 12px 12px', background: COLORS.GRAY_50 }}>
                      <div style={{ padding: '12px', fontSize: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                          <span style={{ color: COLORS.GRAY_600 }}>Order ID</span>
                          <span>{tx.order_id}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                          <span style={{ color: COLORS.GRAY_600 }}>{SUBSCRIPTION_STRINGS.TRANSACTIONS.EXPANDED.PAY_ID}</span>
                          <span>{tx.id || 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                          <span style={{ color: COLORS.GRAY_600 }}>{SUBSCRIPTION_STRINGS.TRANSACTIONS.EXPANDED.METHOD}</span>
                          <span>{tx.method || 'Card/UPI'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                          <span style={{ color: COLORS.GRAY_600 }}>Email</span>
                          <span>{tx.email}</span>
                        </div>

                        {tx.items.length > 1 && (
                          <div style={{ marginTop: '12px', borderTop: '1px solid #D3D1C7', paddingTop: '12px' }}>
                            <div style={{ fontSize: '11px', marginBottom: '8px', color: COLORS.GRAY_600 }}>PAYMENT ATTEMPTS</div>
                            {tx.items.map((item, i) => (
                              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '11px' }}>
                                <span>{moment(item.createdAt).format('DD MMM, HH:mm')} - ID: {item.id}</span>
                                {getStatusBadge(item.status)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: COLORS.GRAY_400 }}>
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {total > limit && (
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px',
            padding: '16px', borderTop: '0.5px solid rgba(0,0,0,.07)'
          }}>
            <button
              className="plan-btn plan-btn-secondary"
              style={{ margin: 0, width: 'auto', padding: '6px 12px' }}
              disabled={page === 1}
              onClick={() => onChangePage(page - 1)}
            >
              <i className="fas fa-chevron-left"></i> Previous
            </button>
            <span style={{ fontSize: '13px' }}>
              Page {page} of {totalPages}
            </span>
            <button
              className="plan-btn plan-btn-secondary"
              style={{ margin: 0, width: 'auto', padding: '6px 12px' }}
              disabled={page === totalPages}
              onClick={() => onChangePage(page + 1)}
            >
              Next <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </UICard>
    </div>
  );
};

export default TransactionsTab;
