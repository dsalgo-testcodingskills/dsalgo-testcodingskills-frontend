import React, { useState, useEffect } from 'react';
import { getPlanLimits } from '../../Services/api';

function Pricing() {
  const [planLimits, setPlanLimits] = useState({
    free: { tests: 20, users: 3, customQuestions: 0 },
    paid: { tests: 100, users: 10, customQuestions: 20 },
  });

  useEffect(() => {
    const fetchPlanLimits = async () => {
      try {
        const response = await getPlanLimits();
        setPlanLimits(response.data);
      } catch (error) {
        console.error('Failed to fetch plan limits:', error);
      }
    };
    fetchPlanLimits();
  }, []);

  return (
    <div className="pricing">
      <h5>Pricing</h5>
      <h6>DSAlgo Free Plan</h6>
      Maximum {planLimits.free.tests} test for 1 month<br></br>
      Maximum Users: {planLimits.free.users}<br></br>
      No Custom Questions allowed.
      <h6>DSAlgo Paid Plan</h6>
      Maximum {planLimits.paid.tests} test for 1 month<br></br>
      Maximum Users: {planLimits.paid.users}<br></br>
      {planLimits.paid.customQuestions} Custom Questions allowed.<br></br>
      Price: Rs.{planLimits.paid.amount} (INR) per month.<br></br>
      <br></br>
      <b>Note</b>: Users here means person who can create tests which include
      (admin and users).
    </div>
  );
}

export default Pricing;
