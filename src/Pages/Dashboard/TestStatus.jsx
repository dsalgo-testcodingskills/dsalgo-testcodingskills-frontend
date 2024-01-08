import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { CloseButton, Modal } from 'react-bootstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';
import moment from 'moment';
import CustomLoadingAnimation from '../../components/CustomLoadingAnimation';
import CustomToast from '../../components/CustomToast/CustomToast';
import { setFilterForTest, setLogout } from '../../Redux/Actions/dataAction';
import {
  getallTestSubmissions,
  GetTotalTestsCount,
  ResendEmail,
} from '../../Services/api';
import '../../App.scss';
import './TestStatus.scss';
import '../../assets/styles/button.scss';
import Plans from '../MyPlans/Plans';
import Pagination from '../../components/Pagination/Pagination';
import { Tooltip } from '@material-ui/core';

const statusOptions = [
  { label: 'ALL', value: '' },
  { label: 'PENDING', value: 'pending' },
  { label: 'COMPLETED', value: 'completed' },
];

const moderationStatusOptions = [
  { label: 'ALL', value: '' },
  { label: 'SHORTLISTED', value: 'shortlisted' },
  { label: 'REJECTED', value: 'rejected' },
  { label: 'NON-MODERATION', value: 'non-moderation' },
];

const testTypeOptions = [
  { label: 'All', value: '' },
  { label: 'Single', value: 'Single' },
  { label: 'Bulk Test', value: 'MultiLink' },
];

const TestStatus = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const { loginData, filterForTest } = useSelector(
    (store) => store.dataReducer,
  );
  const [tests, setTests] = useState([]);
  const [count, setCount] = useState(0);
  const [Loading, SetLoading] = useState(true);
  const [totalTests, setTotalTests] = useState(null);
  const [disableButton, setDisableButton] = useState(false);
  const [dataCount, setDataCount] = useState(0);
  const [paymentPlan, setPaymentPlan] = useState(false);
  const [paymentPending, setPaymentPending] = useState(false);

  const TOTAL_TESTS_COUNT_REF = useRef();
  const getSelectedValueForDropdown = useCallback((options, value) => {
    return options.find((x) => x.value === value) || null;
  }, []);

  const inputRef1 = useRef();
  const inputRef2 = useRef();
  const inputRef3 = useRef();
  const reset = () => {
    inputRef1.current.value = '';
    inputRef2.current.value = '';
    inputRef3.current.value = '';
    {
      dispatch(
        setFilterForTest({
          ...filterForTest,
          filter: {},
        }),
      );
    }
  };
  const handleInput = (e) => {
    if (e.target?.value.length > 2 || e.target?.value === '') {
      dispatch(
        setFilterForTest({
          ...filterForTest,
          page: 1,
          filter: {
            ...filterForTest?.filter,
            [e.target?.name]:
              e.target?.value === ''
                ? undefined
                : { $regex: e.target?.value, $options: 'i' },
          },
        }),
      );
    }
  };

  const EmailFormatter = (cell) => {
    if (cell) {
      return cell;
    } else {
      return `N/A`;
    }
  };

  const PhoneFormatter = (cell) => {
    if (cell) {
      return cell;
    } else {
      return `N/A`;
    }
  };

  const nameFormatter = (cell, row) => {
    return cell ? cell.charAt(0).toUpperCase() + cell.slice(1) : row.Title;
  };

  const shortlistFormatter = (cell) => {
    if (cell === 'shortlisted') {
      return <img src="/images/Modration.svg" />;
    } else if (cell === 'rejected') {
      return <i className="fas fa-times text-danger"></i>;
    } else {
      return 'N/A';
    }
  };

  const ConvertToDate = (cell) => {
    return `${moment(cell).format('DD/MM/YYYY HH:mm')}`;
  };

  const rowcount = (cell, row, rowindex) => {
    return rowindex + (filterForTest?.page - 1) * filterForTest?.limit + 1;
  };

  const Action = (cell, row) => {
    return (
      <div className="d-flex justify-content-center flex-row">
        <Tooltip title="Copy Link" arrow>
          <a
            className="actionIcon mx-2"
            onClick={() => {
              navigator.clipboard.writeText(
                `${window.location.origin}/student/${
                  row.TestType === 'MultiLink' ? 'UserINFO' : 'test'
                }/${cell}`,
              );
              toast(
                <CustomToast type="success" message={'Test link copied'} />,
              );
            }}
          >
            <i className="fas fa-link"></i>
          </a>
        </Tooltip>

        <Tooltip title="Resend Email" arrow>
          <a
            className="actionIcon mx-2"
            style={
              row.isExpired ||
              row.endDate < moment().valueOf() ||
              !row.emailId ||
              row?.status === 'completed'
                ? { pointerEvents: 'none', opacity: 0.2 }
                : {}
            }
            onClick={() => ResendMail(cell)}
          >
            <i className="fas fa-envelope"></i>
          </a>
        </Tooltip>
        <Tooltip title="Review" arrow>
          <a
            className="actionIcon  mx-2"
            href={`/admin/${
              row.TestType === 'MultiLink' ? 'testStatus' : 'testReview'
            }/${cell}`}
          >
            <i className="far fa-file-code"></i>
          </a>
        </Tooltip>
      </div>
    );
  };

  const columns = [
    {
      headerClasses: ' tableHeading',
      dataField: '',
      text: 'Sr',
      formatter: rowcount,
      className: 'dataHeading',
      style: {
        paddingTop: '18px',
      },
    },
    {
      headerClasses: ' tableHeading',
      dataField: 'studentName',
      text: 'Name',
      formatter: nameFormatter,
      style: {
        paddingTop: '18px',
      },
    },
    {
      headerClasses: ' tableHeading',
      dataField: 'emailId',
      text: 'Email Id',
      formatter: EmailFormatter,
      style: {
        paddingTop: '18px',
      },
    },
    {
      headerClasses: ' tableHeading',
      dataField: 'phone',
      text: 'Phone',
      formatter: PhoneFormatter,
      style: {
        paddingTop: '18px',
      },
    },
    {
      headerClasses: 'tableHeading',
      dataField: 'startDate',
      text: 'Start Date',
      formatter: ConvertToDate,
      style: {
        paddingTop: '18px',
      },
    },
    {
      headerClasses: 'tableHeading',
      dataField: 'endDate',
      text: 'End Date',
      formatter: ConvertToDate,
      style: {
        paddingTop: '18px',
      },
    },
    {
      headerClasses: ' tableHeading',

      dataField: 'testDuration',
      text: 'Time (mins)',
      style: {
        paddingTop: '18px',
      },
    },
    {
      headerClasses: ' tableHeading',
      dataField: 'status',
      text: 'Status',
      style: {
        textTransform: 'capitalize',
        paddingTop: '18px',
      },
    },
    {
      headerClasses: ' tableHeading',
      dataField: 'moderation.status',
      text: 'Moderation',
      formatter: shortlistFormatter,
      style: {
        paddingTop: '13px',
      },
    },
    {
      headerClasses: ' tableHeading',
      dataField: 'TestType',
      text: 'Test Type',
      style: {
        paddingTop: '18px',
      },
    },
    {
      headerClasses: 'text-center tableHeading',
      dataField: '_id',
      text: 'Actions',
      formatter: Action,
      style: {
        paddingTop: '12px',
      },
    },
  ];

  const getdata = async () => {
    try {
      SetLoading(true);
      const resp = await getallTestSubmissions(filterForTest);

      if (!TOTAL_TESTS_COUNT_REF.current && resp.data?.count) {
        TOTAL_TESTS_COUNT_REF.current = true;
        setDataCount(resp.data.count);
      }
      setTests(resp.data?.data || []);
      setCount(resp.data?.count);
    } catch (error) {
      if (error?.status === 455) {
        dispatch(setLogout());
      }
      toast(
        <CustomToast
          type="error"
          message={'Session expired. Please login again.'}
        />,
      );
    } finally {
      SetLoading(false);
    }
  };

  const ResendMail = async (cell) => {
    try {
      SetLoading(true);
      await ResendEmail(cell);
      toast(
        <CustomToast type="success" message={'Email resend successfull'} />,
      );
    } catch (error) {
      toast(<CustomToast type="error" message={error} />);
    } finally {
      SetLoading(false);
    }
  };

  const createTest = async () => {
    try {
      const result = await GetTotalTestsCount();
      if (result.data.totalTests <= 0 && loginData?.role === 'admin') {
        setPaymentPlan(true);
      } else {
        history.push('/admin/createTest');
      }
    } catch (error) {
      console.log('Error: while creating test', error);
      toast(<CustomToast type="error" message={error} />);
    }
  };

  useEffect(() => {
    getdata();
  }, [filterForTest]);

  useEffect(() => {
    const getCount = async () => {
      try {
        const totalTests = await GetTotalTestsCount();
        setTotalTests(totalTests.data?.totalTests);

        if (totalTests.data?.totalTests <= 0 && loginData?.role === 'user') {
          //disable button
          setDisableButton(true);
        }
      } catch (error) {
        console.log('Error: while getting total tests count', error);
      }
    };
    getCount();
    return () => {
      if (history.location.pathname.substring(0, 11) !== '/admin/test') {
        dispatch(
          setFilterForTest({
            ...filterForTest,
            filter: {},
          }),
        );
      }
    };
  }, []);

  return (
    <>
      <CustomLoadingAnimation isLoading={Loading} />
      <div className="dashboard-container">
        <div className="head">Dashboard &nbsp; / &nbsp; Test</div>
        {totalTests !== null && totalTests <= 5 && (
          <div className="total-tests">Total Tests Remaining: {totalTests}</div>
        )}
      </div>
      {dataCount > 0 ? (
        <div className="testStatus">
          <div className="testStatus__row">
            <div
              className="d-flex align-items-center"
              style={{ position: 'relative', flex: '1' }}
            >
              <input
                defaultValue={filterForTest.filter.emailId?.$regex}
                type="emailId"
                name="emailId"
                id="emailId"
                onChange={debounce(handleInput, 400)}
                placeholder="Email"
                value={filterForTest?.emailId}
                ref={inputRef1}
                className="form-control"
              />
              <div
                style={{
                  position: 'absolute',
                  right: '10px',
                  color: 'gray',
                  background: 'white',
                  textAlign: 'center',
                }}
              >
                <i className="fas fa-search"></i>
              </div>
            </div>
            <div
              className="d-flex align-items-center"
              style={{ position: 'relative', flex: '1' }}
            >
              <input
                defaultValue={filterForTest.filter.phone?.$regex}
                type="tel"
                name="phone"
                id="phone"
                ref={inputRef2}
                placeholder="Phone"
                value={filterForTest?.phone}
                onChange={debounce(handleInput, 400)}
                className="form-control"
              />
              <div
                style={{
                  position: 'absolute',
                  right: '10px',
                  color: 'gray',
                  background: 'white',
                  textAlign: 'center',
                }}
              >
                <i className="fas fa-search"></i>
              </div>
            </div>
            <div
              className="d-flex align-items-center"
              style={{ position: 'relative', flex: '1' }}
            >
              <input
                defaultValue={filterForTest.filter.studentName?.$regex}
                type="text"
                name="studentName"
                id="studentName"
                ref={inputRef3}
                placeholder="Name"
                value={filterForTest?.name}
                onChange={debounce(handleInput, 400)}
                className="form-control"
              />
              <div
                style={{
                  position: 'absolute',
                  right: '10px',
                  color: 'gray',
                  background: 'white',
                  textAlign: 'center',
                }}
              >
                <i className="fas fa-search"></i>
              </div>
            </div>
            <div
              className=" d-flex align-items-center"
              style={{ position: 'relative', flex: '1' }}
            >
              <Select
                className="w-100"
                placeholder="Test Status"
                options={statusOptions}
                value={getSelectedValueForDropdown(
                  statusOptions,
                  filterForTest?.filter['status'],
                )}
                onChange={(e) => {
                  dispatch(
                    setFilterForTest({
                      ...filterForTest,
                      page: 1,
                      filter: {
                        ...filterForTest.filter,
                        status: e?.value || undefined,
                      },
                    }),
                  );
                }}
              />
            </div>
            <div
              className=" d-flex align-items-center"
              style={{ position: 'relative', flex: '1' }}
            >
              <Select
                className="w-100"
                placeholder="Moderation"
                options={moderationStatusOptions}
                value={getSelectedValueForDropdown(
                  moderationStatusOptions,
                  filterForTest?.filter['moderation.status'],
                )}
                onChange={(e) => {
                  if (e.value === 'non-moderation') {
                    delete filterForTest.filter['moderation.status'];
                    dispatch(
                      setFilterForTest({
                        ...filterForTest,
                        page: 1,
                        filter: {
                          ...filterForTest.filter,
                          moderation: { $exists: false },
                        },
                      }),
                    );
                  } else {
                    delete filterForTest.filter['moderation'];
                    dispatch(
                      setFilterForTest({
                        ...filterForTest,
                        page: 1,
                        filter: {
                          ...filterForTest.filter,
                          'moderation.status': e?.value || undefined,
                        },
                      }),
                    );
                  }
                }}
              />
            </div>
            <div
              className=" d-flex align-items-center"
              style={{ position: 'relative', flex: '1' }}
            >
              <Select
                className="w-100"
                placeholder="Test Type"
                options={testTypeOptions}
                value={getSelectedValueForDropdown(
                  testTypeOptions,
                  filterForTest.filter['TestType'],
                )}
                onChange={(e) => {
                  dispatch(
                    setFilterForTest({
                      ...filterForTest,
                      page: 1,
                      filter: {
                        ...filterForTest.filter,
                        TestType: e?.value || undefined,
                      },
                    }),
                  );
                }}
              />
            </div>
            <div
              className=" d-flex align-items-center justify-content-end"
              style={{ position: 'relative', flex: '1' }}
            >
              <button
                className={
                  disableButton ? 'btns p-2 disable-button' : 'btns p-2'
                }
                onClick={reset}
              >
                Clear Filters
              </button>
            </div>
            <div
              className=" d-flex align-items-center justify-content-end"
              style={{ position: 'relative', flex: '1' }}
            >
              <button
                className={
                  disableButton ? 'btns p-2 disable-button' : 'btns p-2'
                }
                disabled={disableButton}
                onClick={() => {
                  createTest();
                }}
              >
                Create Test
              </button>
            </div>
          </div>
          <div className="table-responsive">
            {tests.length > 0 ? (
              <BootstrapTable
                classes="mt-4 mb-0"
                keyField="_id"
                data={tests}
                columns={columns}
              />
            ) : (
              <p className="text-center py-5 fs-4">No Tests</p>
            )}
          </div>

          {count > 10 && (
            <Pagination
              className="pagination-bar"
              currentPage={filterForTest?.page}
              totalCount={count}
              pageSize={filterForTest?.limit}
              onPageChange={(page) =>
                dispatch(
                  setFilterForTest({
                    ...filterForTest,
                    page: page,
                  }),
                )
              }
            />
          )}
        </div>
      ) : (
        <div className="testStatus__empty">
          <div className="testStatus__empty-btn">
            <button
              className="btns"
              onClick={() => {
                createTest();
              }}
            >
              Create Test
            </button>
          </div>
          <img
            src="/images/EmptyDashboard.svg"
            className="testStatus__empty-img"
          />
          <div className="testStatus__empty-description">
            <h1>Create your first test </h1>
          </div>
        </div>
      )}

      {/* subscription payment modal */}
      <Modal
        show={paymentPlan}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter example-modal-sizes-title-lg"
        centered
      >
        <Modal.Header>
          <Modal.Title
            id="contained-modal-title-vcenter"
            className="text-center"
          >
            <h4
              style={{
                fontWeight: '500',
                fontSize: '21px',
                lineHeight: '25px',
                textAlign: 'left',
              }}
            ></h4>{' '}
            Upgrade your plan
          </Modal.Title>
          <CloseButton
            onClick={() => {
              setPaymentPlan(false);
            }}
          />
        </Modal.Header>
        <Plans />
      </Modal>

      {/* subscription processing modal */}
      <Modal
        show={paymentPending}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter example-modal-sizes-title-lg"
        centered
      >
        <>
          <Modal.Header>
            <Modal.Title
              id="contained-modal-title-vcenter"
              className="text-center"
            >
              <div
                style={{
                  fontWeight: '500',
                  fontSize: '21px',
                  lineHeight: '25px',

                  color: '#000000',
                }}
              >
                Payment Status : &nbsp;{' '}
                <i
                  className="fas fa-hourglass-half"
                  style={{ color: '#FFAE42' }}
                ></i>{' '}
                Pending
              </div>
            </Modal.Title>
            <CloseButton
              onClick={() => {
                setPaymentPending(false);
              }}
            />
          </Modal.Header>
          <div style={{ padding: '50px', textAlign: 'center' }}>
            <h4
              style={{
                fontWeight: '400',
                fontSize: '16px',
                lineHeight: '19px',

                color: '#808593',
              }}
            >
              Your Payment is under processing, Please wait ...
            </h4>
          </div>
        </>
      </Modal>
    </>
  );
};

export default TestStatus;
