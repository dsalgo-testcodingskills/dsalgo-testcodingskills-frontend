import React, { useState } from 'react';
import { toast } from 'react-toastify';
import CustomToast from '../../components/CustomToast/CustomToast';
import {
  createSubscription,
  getOrgDetails,
  updatePaymentStatus,
} from '../../Services/api';
import './Plans.scss';
import { useHistory } from 'react-router';
import { useEffect } from 'react';
import CustomLoadingAnimation from '../../components/CustomLoadingAnimation';

function Plans() {
  const history = useHistory();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const getOrganization = async () => {
    try {
      let resp = await getOrgDetails();
      setUser(resp.data);
    } catch (error) {
      console.log('Error: while getting organization details', error);
    }
  };

  useEffect(() => {
    getOrganization();
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
        key: process.env.REACT_APP_RAZORPAY_SECRET_ID, // Enter the Key ID generated from the Dashboard
        name: 'CODE B.',
        description: 'Test Transaction',
        image: '/images/logo.png',
        subscription_id: id,

        handler: async function (response) {
          if (response) {
            toast(
              <CustomToast type="success" message={'Payment Successfull'} />,
            );
            history.push('/admin/myPlans');
            window.location.reload();
          }

          await updatePaymentStatus();
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

        toast(<CustomToast type="error" message={'Fail Successfull'} />);
      });
      paymentObject.open();
    } catch (error) {
      console.log('error :>> ', error);
    }
  };
  return (
    <div className="plans">
      <div className="plans__plan plan-1">
        <p className="plans__plan-p">
          <b>Plan 1</b>
        </p>
        <h2> 20 Test</h2>
        <p className="plans__plan-mon">in a month (30 days)</p>
        <h6>Free</h6>
        <button type="submit" className="plans__plan-disable">
          {' '}
          Current Plan
        </button>
        <p className="plans__plan-exp">Expired</p>
      </div>
      <div className="plans__plan plan-1">
        <p className="plans__plan-p">
          <b>Plan 2</b>
        </p>
        <h2> 100 Test</h2>
        <p className="plans__plan-mon">in a month (30 days)</p>
        <p className="plans__plan-p">Create 20 custom questions</p>
        <p className="plans__plan-p">Create 10 users</p>
        <h6>
          Rs 1000 <span>/ Month</span>
        </h6>
        <button
          type="submit"
          className="btns"
          onClick={() => {
            displayRazorpay('plan_KK6q6XSSFCRx0z');
          }}
        >
          {' '}
          Get Started
        </button>
      </div>
      <CustomLoadingAnimation isLoading={loading} />
    </div>
  );
}

export default Plans;
