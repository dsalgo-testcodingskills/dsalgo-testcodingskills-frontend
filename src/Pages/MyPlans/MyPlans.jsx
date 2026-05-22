import React, { useEffect, useState } from 'react';
import './MyPlans.scss';
import {
  cancelSubscriptions,
  getPaymentDetails,
  getSubDetails,
  GetTotalTestsCount,
  createTopUpOrder,
  getPricing,
} from '../../Services/api';
import { useDispatch, useSelector } from 'react-redux';
import { setTestsCount } from '../../Redux/Actions/dataAction';

import { useHistory } from 'react-router-dom';
import BootstrapTable from 'react-bootstrap-table-next/lib/src/bootstrap-table';
import CustomLoadingAnimation from '../../components/CustomLoadingAnimation';
import moment from 'moment';
import { Dialog } from '@material-ui/core';
import CustomToast from '../../components/CustomToast/CustomToast';
import { toast } from 'react-toastify';
import Plans from './Plans';
import { subscriptionStatus } from '../../utils/constants';

const MyPlans = () => {
  const dispatch = useDispatch();
  const { testsCount } = useSelector((store) => store.dataReducer);

  const [subDetails, setSubDetails] = useState([]);
  const history = useHistory();

  const [paymentData, setpaymentData] = useState([]);
  const [Loading, SetLoading] = useState(false);
  const [open, setopen] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpType, setTopUpType] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [pricing, setPricing] = useState({ pricePerTest: 10, pricePerQuestion: 5 });

  const fetchData = async () => {
    try {
      SetLoading(true);
      const [subData, result, resp, priceRes] = await Promise.all([
        getSubDetails(),
        GetTotalTestsCount(),
        getPaymentDetails(),
        getPricing().catch(() => ({ data: { pricePerTest: 10, pricePerQuestion: 5 } }))
      ]);
      setSubDetails(subData.data.data);
      dispatch(setTestsCount(result.data.totalTests));
      setpaymentData(resp.data.data);
      setPricing(priceRes.data);
    } catch (err) {
      console.log(err);
    } finally {
      SetLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClose = () => {
    setopen(false);
  };

  const handleOpen = () => {
    setopen(true);
  };

  const renderStatus = (sub) => {
    if (!sub) return null;
    const isCancelled = sub.status === 'cancelled';
    const style = {
      padding: '4px 10px',
      borderRadius: '4px',
      fontSize: '0.85rem',
      fontWeight: '500',
      display: 'inline-block',
      color: isCancelled ? '#856404' : '#2e7d32',
    };
    return (
      <span style={style}>
        {sub.status === 'active' ? 'Active' : `Cancelled (Active until ${sub.endDateString})`}
      </span>
    );
  };

  //Display RazorPay Window

  const rowcount = (cell, row, rowindex) => {
    return rowindex + 1;
  };

  const amount = (cell) => {
    return cell / 100;
  };

  const dateFormat = (cell) => {
    return cell.substring(0, 10);
  };

  function loadScript(src) {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  const handleTopUpOpen = (type) => {
    setTopUpType(type);
    setTopUpOpen(true);
  };

  const handleTopUpClose = () => {
    setTopUpOpen(false);
    setQuantity(1);
    setTopUpType(null);
  };

  const executeTopUp = async () => {
    if (!quantity || quantity < 1) return;
    setTopUpOpen(false);
    
    try {
      SetLoading(true);
      const isLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!isLoaded) {
        toast(<CustomToast type="error" message="Payment gateway failed to load." />);
        return;
      }

      const res = await createTopUpOrder({ type: topUpType, quantity: parseInt(quantity) });
      const { id, amount } = res.data;

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: amount,
        currency: 'INR',
        name: `CODE B. Add-on (${topUpType})`,
        order_id: id,
        handler: async (response) => {
          toast(<CustomToast type="success" message="Add-on successful!" />);
          await fetchData();
        },
        theme: { color: '#61dafb' }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast(<CustomToast type="error" message="Add-on failed." />);
    } finally {
      SetLoading(false);
    }
  };


  const upiFunc = () => '-';

  const ammountFunc = () => 10000;

  const statusFormat = (cell) => {
    if (cell == 'captured') {
      return <span style={{ color: '#24C5DA' }}>Successfull</span>;
    }

    if (cell == 'initiated') {
      return <span style={{ color: '#FFAE42' }}>Pending</span>;
    } else {
      return <span style={{ color: '#24C5DA' }}>Active</span>;
    }
  };

  const cancelSubscription = async () => {
    await cancelSubscriptions();
    setopen(false);
    await fetchData(); 
    toast(
      <CustomToast
        type="success"
        message="Your subscription has been cancelled successfully."
      />,
    );
  };

  const columns = [
    {
      headerClasses: 'tableHeading ',
      dataField: '',
      text: 'Serial Number',
      formatter: rowcount,
      style: {
        paddingTop: '18px',
        width: '10%',
      },
    },
    {
      headerClasses: ' tableHeading',
      dataField: 'createdAt',
      text: 'Date',
      formatter: dateFormat,
      style: {
        paddingTop: '18px',
      },
    },
    {
      headerClasses: ' tableHeading',
      dataField: 'method',
      text: 'Payment method',
      style: {
        paddingTop: '18px',
      },
    },
    {
      headerClasses: ' tableHeading',
      dataField: 'amount',
      text: 'Amount (in Rs)',
      formatter: amount,
      style: {
        paddingTop: '18px',
      },
    },
    {
      headerClasses: ' tableHeading',
      dataField: 'status',
      text: 'Status',
      formatter: statusFormat,
      style: {
        paddingTop: '18px',
      },
    },
  ];

  const columnsSubscription = [
    {
      headerClasses: 'tableHeading ',
      dataField: '',
      text: 'Serial Number',
      formatter: rowcount,
      style: {
        paddingTop: '18px',
        width: '10%',
      },
    },
    {
      headerClasses: ' tableHeading',
      dataField: 'createdAt',
      text: 'Date',
      formatter: dateFormat,
      style: {
        paddingTop: '18px',
      },
    },
    {
      headerClasses: ' tableHeading',
      text: 'Payment method',
      formatter: upiFunc,
      style: {
        paddingTop: '18px',
      },
    },
    {
      headerClasses: ' tableHeading',
      text: 'Amount',
      formatter: ammountFunc,
      style: {
        paddingTop: '18px',
      },
    },
    {
      headerClasses: ' tableHeading',
      dataField: 'status',
      formatter: statusFormat,
      text: 'Status',
      style: {
        paddingTop: '18px',
      },
    },
  ];

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <div className="dialog-box">
          <h5 style={{ color: 'red' }}>Are you sure?</h5>
          <p>
            Do you really want to cancel your Subscription?<br></br> This action
            cannot be undone
          </p>
          <button className="cancelBtn" onClick={cancelSubscription}>
            Yes, I am sure
          </button>
          <button className="gobackBtn" onClick={handleClose}>
            Go Back
          </button>
        </div>
      </Dialog>
      <Dialog open={topUpOpen} onClose={handleTopUpClose}>
        <div className="dialog-box" style={{ padding: '20px', textAlign: 'center', minWidth: '340px' }}>
          <button aria-label="close" onClick={handleTopUpClose} style={{ position: 'absolute', right: '10px', top: '8px', background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
          <h5>Add {topUpType === 'test' ? 'Tests' : 'Questions'}</h5>
          <div style={{ margin: '10px 0', color: '#333' }}>
            <div>Unit price: ₹{topUpType === 'test' ? pricing.pricePerTest : pricing.pricePerQuestion}</div>
            <div style={{ marginTop: '6px', fontWeight: 600 }}>Total: ₹{(topUpType === 'test' ? pricing.pricePerTest : pricing.pricePerQuestion) * quantity}</div>
          </div>
          <input 
            type="number" 
            min="1" 
            value={quantity} 
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
            style={{ padding: '8px', margin: '10px 0', width: '80%' }}
          />
          <div style={{ marginTop: '10px' }}>
            <button className="btns" onClick={executeTopUp} style={{ background: '#24C5DA', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '4px' }}>Proceed to Pay</button>
          </div>
        </div>
      </Dialog>
      <label className="head">
        <span
          onClick={() => history.push('/admin/testStatus')}
          style={{ cursor: 'pointer' }}
        >
          Dashboard
        </span>
        / Plan
      </label>

      <div className="myPlans__content">
        {subDetails && subDetails.length > 0 && ![subscriptionStatus.CREATED].includes(subDetails[0]?.status) && ![subscriptionStatus.CANCELLED].includes(subDetails[0]?.status) ? (
        <div className="my-4">
          <div className="row">
              <div className=" myPlans__active col-9">
                <h4>
                  <label>Plan Status :</label>
                  {renderStatus(subDetails[0])}
                </h4>
                <p>
                  <label>Remaining Test : </label> <span> {testsCount}</span>
                </p>
                <p>
                  <label>Current Month Billing Date : </label>
                  <span>
                    {subDetails[0]?.current_start
                      ? `${moment(subDetails[0]?.current_start * 1000).format(
                          'DD/MM/YYYY',
                        )}`
                      : '-'}
                  </span>
                </p>
                {subDetails[0]?.status === 'active' && (
                  <p>
                    <label>Next payment Date : </label>
                    <span>
                      {subDetails[0]?.current_end
                        ? `${moment(subDetails[0]?.current_end * 1000).format(
                          'DD/MM/YYYY',
                        )}`
                      : '-'}
                  </span>
                </p>
                )}
                {/* <p>
                  <label>Renewal/Expiry Date : </label>
                  <span>
                    {subDetails[0]?.end_at
                      ? `${moment(subDetails[0]?.end_at * 1000).format(
                          'DD/MM/YYYY',
                        )}`
                      : '-'}
                  </span>
                </p> */}
              </div>
            <div className="col-3">
                <button className="btns" onClick={handleOpen}>
                  Cancel Plan
                </button>
              </div>
            </div>
            
            <div className="top-up-section" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <h5 style={{ marginBottom: '15px' }}>Need more resources?</h5>
              <button 
                className="btns" 
                onClick={() => handleTopUpOpen('test')} 
                style={{ marginRight: '10px', background: '#24C5DA', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '4px' }}
              >
                Buy Extra Tests
              </button>
              <button 
                className="btns" 
                onClick={() => handleTopUpOpen('question')} 
                style={{ background: '#24C5DA', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '4px' }}
              >
                Buy Extra Questions
              </button>
          </div>

          <BootstrapTable
            classes="mt-5"
            keyField="_id"
            data={paymentData.length > 0 ? paymentData : subDetails}
            columns={paymentData.length > 0 ? columns : columnsSubscription}
          />
        </div>
        ) : (
          <div className="my-4">
            <Plans subDetails={subDetails} planLimits={null} onUpdate={fetchData} />
          </div>
        )}
      </div>
      <CustomLoadingAnimation isLoading={Loading} />
    </>
  );
};

export default MyPlans;
