import React from 'react';

function CancellationPolicy() {
  return (
    <div className="cancellation-policy">
      <h5>Cancellation/Refund Policy</h5>

      <h6>Monthly Subscription</h6>
      {`  By purchasing a Monthly Subscription, you agree to an initial and recurring Monthly Subscription fee at the then-current Monthly Subscription rate, and you accept responsibility for all recurring charges until you cancel your subscription. You may cancel your Monthly Subscription at any time, subject to the terms of our cancellation policy.`}
      <h6>Automatic Monthly Renewal Terms</h6>
      {` Once you subscribe Payment Gateway Provider will automatically process your Monthly Subscription fee in the next billing cycle. Payment Gateway Provider will continue to automatically process your Monthly Subscription fee each month at the then  current Monthly Subscription rate, until you cancel your subscription.`}
      <h6>Cancellation Policy</h6>
      {` You can cancel a monthly subscription anytime after 2 days prior to your next billing cycle date. However we recommend you to cancel your subscription atleast  3 days prior to your next billing cycle date to avoid automatic debit from your account. Cancellation can be done through option given in website.`}
      <h6>Refund Policy</h6>
      {` The refunds in accordance with the above guidelines shall be as per the following:
            The refund will be processed through payment gateway or any other online banking / electronic funds transfer system approved by Reserve Bank India and will reflect in same account of customer buying the Services from where customer has paid the transaction amount.`}
    </div>
  );
}

export default CancellationPolicy;
