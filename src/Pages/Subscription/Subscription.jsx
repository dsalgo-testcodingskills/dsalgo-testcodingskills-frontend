import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import UITabs from '../../components/UI/UITabs';
import PlansTab from './PlansTab';
import MySubscriptionTab from './MySubscriptionTab';
import AddOnsTab from './AddOnsTab';
import TransactionsTab from './TransactionsTab';
import { SUBSCRIPTION_STRINGS } from './subscriptionConstants';
import './Subscription.scss';
import {
  getSubDetails,
  GetTotalTestsCount,
  getPaymentDetails,
  getPricing,
  cancelSubscriptions,
  getPlanLimits,
  getOrgDetails,
} from '../../Services/api';
import { setTestsCount } from '../../Redux/Actions/dataAction';
import { toast } from 'react-toastify';
import CustomToast from '../../components/CustomToast/CustomToast';
import CustomLoadingAnimation from '../../components/CustomLoadingAnimation';

const Subscription = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { testsCount } = useSelector((store) => store.dataReducer);

  const [activeTab, setActiveTab] = useState('plans');
  const [loading, setLoading] = useState(false);
  const [subDetails, setSubDetails] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [pricing, setPricing] = useState({ pricePerTest: 10, pricePerQuestion: 5 });
  const [planLimits, setPlanLimits] = useState(null);
  const [orgMetrics, setOrgMetrics] = useState(null);
  const [txPage, setTxPage] = useState(1);
  const [txTotal, setTxTotal] = useState(0);
  const [txLimit] = useState(10);

  const tabs = [
    { id: 'plans', label: SUBSCRIPTION_STRINGS.TABS.PLANS },
    { id: 'my-sub', label: SUBSCRIPTION_STRINGS.TABS.MY_SUBSCRIPTION },
    { id: 'add-ons', label: SUBSCRIPTION_STRINGS.TABS.ADD_ONS },
    { id: 'transactions', label: SUBSCRIPTION_STRINGS.TABS.TRANSACTIONS },
  ];

  const fetchTransactions = async (page = 1) => {
    try {
      setLoading(true);
      const res = await getPaymentDetails(page, txLimit);
      setPaymentData(res.data.paymentDetails);
      setTxTotal(res.data.total);
      setTxPage(res.data.page);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subData, testsData, pricingResp, limitsResp,orgData] = await Promise.all([
        getSubDetails(),
        GetTotalTestsCount(),
        getPricing().catch(() => ({ data: { pricePerTest: 10, pricePerQuestion: 5 } })),
        getPlanLimits().catch(() => null),
        getOrgDetails()
      ]);

      setSubDetails(subData.data.data);
      setOrgMetrics(orgData.data.orgDetails);
      dispatch(setTestsCount(testsData.data.totalTests));
      setPricing(pricingResp.data);
      if (limitsResp) setPlanLimits(limitsResp.data);

      await fetchTransactions(1);
    } catch (err) {
      console.error('Error fetching subscription data:', err);
      toast(<CustomToast type="error" message="Failed to load subscription data." />);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancelSub = async () => {
    try {
      setLoading(true);
      await cancelSubscriptions();
      await fetchData();
      toast(<CustomToast type="success" message="Subscription cancelled successfully." />);
    } catch (err) {
      toast(<CustomToast type="error" message="Cancellation failed." />);
    } finally {
      setLoading(false);
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'plans':
        return <PlansTab subDetails={subDetails} onUpdate={fetchData} planLimits={planLimits} />;
      case 'my-sub':
        return (
          <MySubscriptionTab 
            subDetails={subDetails} 
            orgMetrics={orgMetrics} 
            onCancel={handleCancelSub} 
            planLimits={planLimits}
          />
        );
      case 'add-ons':
        return <AddOnsTab subDetails={subDetails} pricing={pricing} onUpdate={fetchData} />;
      case 'transactions':
        return (
          <TransactionsTab 
            paymentData={paymentData} 
            page={txPage}
            total={txTotal}
            limit={txLimit}
            onChangePage={fetchTransactions}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="subscription-page">
      <div className="header-row">
        <div>
          <label className="breadcrumb-nav" style={{ fontSize: '12px', color: '#888780', cursor: 'pointer' }} onClick={() => history.push('/admin/testStatus')}>
            Dashboard /{' '} {SUBSCRIPTION_STRINGS.TITLE}
          </label>
          <h1 className="page-title">{SUBSCRIPTION_STRINGS.TITLE}</h1>
          <p className="page-sub">{SUBSCRIPTION_STRINGS.SUBTITLE}</p>
        </div>
      </div>

      <UITabs 
        tabs={tabs} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      <div className="tab-content">
        {renderActiveTab()}
      </div>

      <CustomLoadingAnimation isLoading={loading} />
    </div>
  );
};

export default Subscription;