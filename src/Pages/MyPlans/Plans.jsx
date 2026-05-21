import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import CustomToast from '../../components/CustomToast/CustomToast';
import {
  createSubscription,
  getOrgDetails,
  updatePaymentStatus,
  getPlanLimits,
  getSubDetails,
} from '../../Services/api';
import './Plans.scss';
import { useHistory } from 'react-router';
import CustomLoadingAnimation from '../../components/CustomLoadingAnimation';
import { RAZOR_PAY_PLAN_ID } from '../../utils/constants';
import Dialog from "@material-ui/core/Dialog";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

function Plans() {
  const history = useHistory();
  const { testsCount } = useSelector((store) => store.dataReducer);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [planLimits, setPlanLimits] = useState(null);
  const [subDetails, setSubDetails] = useState(null);

  const handleOpen = (planId) => {
    setSelectedPlan(planId);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPlan(null);
  };

  const confirmPurchase = () => {
    setOpen(false);
    displayRazorpay(selectedPlan);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [orgResp, limitsResp, subResp] = await Promise.all([
        getOrgDetails(),
        getPlanLimits(),
        getSubDetails(),
      ]);
      setUser(orgResp.data);
      setPlanLimits(limitsResp.data);
      setSubDetails(subResp.data.data);
    } catch (error) {
      console.log('Error: while getting plans data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  //Generic Load script function
  function loadScript(src) {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  const displayRazorpay = async (planId) => {
    try {
      setLoading(true);

      const res = await loadScript(
        'https://checkout.razorpay.com/v1/checkout.js',
      );

      if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        return;
      }

      // creating a new order
      // const result = await makeOrder();
      const result = await createSubscription({ planId });

      if (!result) {
        alert('Server error. Are you online?');
        return;
      }

      // Getting the order details back
      // const { amount, id: order_id, currency } = result.data;
      const { id, notes } = result.data;

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
        name: 'CODE B.',
        description: 'Test Transaction',
        image: '/images/logo.png',
        subscription_id: id,

        handler: async function (response) {
          if (response) {
            toast(
              <CustomToast type="success" message={'Payment Successful'} />,
            );
            await updatePaymentStatus();
            await fetchData();
            history.push('/admin/myPlans');
          }
        },
        prefill: {
          name: user?.userInfo?.name,
          email: user?.userInfo?.emailId,
          contact: user?.userInfo?.contact || '1234567890',
        },

        notes: notes,
        theme: {
          color: '#61dafb',
        },
      };
      setLoading(false);
      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response) {
        alert(response.error.description);

        toast(<CustomToast type="error" message={'Fail Successful'} />);
      });
      paymentObject.open();
    } catch (error) {
      console.log('error :>> ', error);
      setLoading(false);
    }
  };
  return (
    <div className="plans">
      <div className="plans__plan plan-1">
        <p className="plans__plan-p">
          <b>Plan 1</b>
        </p>
        <h2> {planLimits?.free?.tests || 20} Test</h2>
        <p className="plans__plan-mon">in a month (30 days)</p>
        <h6>Free</h6>
        <button type="submit" className="plans__plan-disable">
          {' '}
          Current Plan
        </button>
        {(!subDetails || subDetails.length === 0) ? (
          testsCount > 0 ? (
            <p className="plans__plan-exp" style={{ color: '#24C5DA' }}>Active</p>
          ) : (
            <p className="plans__plan-exp">Expired</p>
          )
        ) : (
          <p className="plans__plan-exp">Expired</p>
        )}
      </div>
      <div className="plans__plan plan-1">
        <p className="plans__plan-p">
          <b>Plan 2</b>
        </p>
        <h2> {planLimits?.paid?.tests || 100} Test</h2>
        <p className="plans__plan-mon">in a month (30 days)</p>
        <p className="plans__plan-p">
          Create {planLimits?.paid?.customQuestions || 20} custom questions
        </p>
        <p className="plans__plan-p">
          Create {planLimits?.paid?.users || 10} users
        </p>
        <h6>
          Rs 1000 <span>/ Month</span>
        </h6>
        <button type="submit" className="btns" onClick={() => handleOpen(RAZOR_PAY_PLAN_ID)}>Get Started</button>
      </div>
    <Dialog open={open} onClose={handleClose}>
        <div
          className="dialog-box"
          style={{
            padding: "20px",
            textAlign: "center",
            position: "relative",
          }}
        >
          <IconButton
            onClick={handleClose}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
            }}
          >
            <CloseIcon />
          </IconButton>

          <h5>Confirm Subscription</h5>
          <p>Are you sure you want to subscribe to this plan?</p>

          <div style={{ marginTop: "20px" }}>
            <button
              className="btns"
              onClick={confirmPurchase}
              style={{ marginRight: "10px" }}
            >
              Yes, proceed
            </button>
          </div>
        </div>
      </Dialog>
      <CustomLoadingAnimation isLoading={loading} />
    </div>
  );
}

export default Plans;
