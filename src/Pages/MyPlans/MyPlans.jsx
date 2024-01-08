import React, { useEffect, useState } from 'react';
import './MyPlans.scss';
import {
  cancelSubscriptions,
  getPaymentDetails,
  getSubDetails,
  GetTotalTestsCount,
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

const MyPlans = () => {
  const dispatch = useDispatch();
  const { testsCount } = useSelector((store) => store.dataReducer);

  const [subDetails, setSubDetails] = useState([]);
  const history = useHistory();

  const [paymentData, setpaymentData] = useState([]);
  const [Loading, SetLoading] = useState(false);
  const [open, setopen] = useState(false);

  useEffect(async () => {
    try {
      SetLoading(true);
      const subData = await getSubDetails();
      setSubDetails(subData.data.data);
      console.log(subData.data.data);
      const result = await GetTotalTestsCount();
      dispatch(setTestsCount(result.data.totalTests));
      const resp = await getPaymentDetails();
      setpaymentData(resp.data.data);
    } catch (err) {
      console.log(err);
    } finally {
      SetLoading(false);
    }
  }, []);

  const handleClose = () => {
    setopen(false);
  };

  const handleOpen = () => {
    setopen(true);
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
        <div className="my-4">
          <div className="row">
            {subDetails && (
              <div className=" myPlans__active col-9">
                <h4>
                  <label>Current Plan :</label>
                  <span
                    style={{ color: '#24C5DA', textTransform: 'capitalize' }}
                  >
                    {' '}
                    {subDetails[0]?.status == 'active'
                      ? 'Active'
                      : subDetails[0]?.status == 'initiated'
                      ? 'Pending'
                      : '-'}{' '}
                  </span>
                </h4>
                <p>
                  <label>Remaining Test : </label> <span> {testsCount}</span>
                </p>
                <p>
                  <label>Expire in : </label>
                  {console.log(subDetails[0]?.end_at * 1000)}
                  <sapn>
                    {subDetails[0]?.end_at
                      ? `${moment(subDetails[0]?.end_at * 1000).format(
                          'DD/MM/YYYY',
                        )}`
                      : '-'}
                  </sapn>
                </p>
              </div>
            )}
            <div className="col-3">
              <button className="btns" onClick={handleOpen}>
                Cancel Plan
              </button>
            </div>
          </div>

          <BootstrapTable
            classes="mt-5"
            keyField="_id"
            data={paymentData.length > 0 ? paymentData : subDetails}
            columns={paymentData.length > 0 ? columns : columnsSubscription}
          />
        </div>
      </div>
      <CustomLoadingAnimation isLoading={Loading} />
    </>
  );
};

export default MyPlans;
