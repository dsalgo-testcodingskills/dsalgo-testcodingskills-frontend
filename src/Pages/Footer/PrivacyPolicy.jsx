import React from 'react';

function PrivacyPolicy() {
  return (
    <div className="privacy">
      <h5> Privacy Policy</h5>
      <ul>
        <li>
          {`SECTION 1 – WHAT DO WE DO WITH YOUR INFORMATION?
                    Code B (“we”, “us”, “our”) immensely respect customer and site visitor’s (“you”, “your”, “yours”) privacy and ensure to not misuse or sell your data to any third party. We'll only use your personal information to administer your account and to provide the products and services you requested from us. In order to provide you the content requested, we need to store and process your personal data. We do not and will not share the details with any third party.`}
        </li>
        <li>
          {`SECTION 2 – CONSENT:
            How do you get my consent?
            When you provide us with personal information during signup or during transaction, we imply that you consent to us to collect data for the specific reason.`}
        </li>
        <li>
          {`SECTION 3 – DISCLOSURE:
            We may disclose your personal information if we are required by law to do so or if you violate our Terms of Service.`}
        </li>
        <li>
          {`SECTION 4 – PAYMENT:
            We use Razorpay for processing payments. We/Razorpay do not store your card data on their servers. The data is encrypted through the Payment Card Industry Data Security Standard (PCI-DSS) when processing payment. Your purchase transaction data is only used as long as is necessary to complete your purchase transaction. After that is complete, your purchase transaction information is not saved. Our payment gateway adheres to the standards set by PCI-DSS as managed by the PCI Security Standards Council, which is a joint effort of brands like Visa, MasterCard, American Express and Discover.PCI-DSS requirements help ensure the secure handling of credit card information by our store and its service providers.For more insight, you may also want to read terms and conditions of razorpay on https://razorpay.com`}
        </li>
        <li>
          {`SECTION 5 – THIRD-PARTY SERVICES:
            In general, the third-party providers used by us will only collect, use and disclose your information to the extent necessary to allow them to perform the services they provide to us.`}
        </li>
        <li>
          {`SECTION 7 – COOKIES:
            We use cookies to maintain session of your user. It is not used to personally identify you on other websites.`}
        </li>
        <li>
          {` SECTION 8 - CHANGES TO THIS PRIVACY POLICY:
            We reserve the right to modify this privacy policy at any time, so please review it frequently. Changes and clarifications will take effect immediately upon their posting on the website. If we make material changes to this policy, we will notify you here that it has been updated, so that you are aware of what information we collect, how we use it, and under what circumstances, if any, we use and/or disclose it. If our company is acquired or merged with another company, your information may be transferred to the new owners so that we may continue to sell products to you.`}
        </li>
      </ul>
    </div>
  );
}

export default PrivacyPolicy;
