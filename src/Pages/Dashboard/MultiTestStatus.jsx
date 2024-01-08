import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import BootstrapTable from 'react-bootstrap-table-next';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';
import moment from 'moment';
import CustomLoadingAnimation from '../../components/CustomLoadingAnimation';
import CustomToast from '../../components/CustomToast/CustomToast';
import {
  setLogout,
  setFilterForMultiTest,
} from '../../Redux/Actions/dataAction';
import { getallMultiTestSubmissions, ResendEmail } from '../../Services/api';
import './MultiTestStatus.scss';
import Pagination from '../../components/Pagination/Pagination';

const statusOptions = [
  { label: 'ALL', value: '' },
  { label: 'PENDING', value: 'pending' },
  { label: 'COMPLETED', value: 'completed' },
];

const moderationStatusOptions = [
  { label: 'ALL', value: '' },
  { label: 'SHORTLISTED', value: 'shortlisted' },
  { label: 'REJECTED', value: 'rejected' },
];

const MultiTestStatus = () => {
  const history = useHistory();
  const params = useParams();
  const { filterForMultiTest } = useSelector((store) => store.dataReducer);
  const dispatch = useDispatch();

  const [data, setData] = useState([]);
  const [tests, setTests] = useState([]);
  const [count, setCount] = useState(0);
  const [Loading, SetLoading] = useState(true);
  const [dataCount, setDataCount] = useState(0);

  const inputRef1 = useRef();
  const inputRef2 = useRef();
  const inputRef3 = useRef();
  const reset = () => {
    inputRef1.current.value = '';
    inputRef2.current.value = '';
    inputRef3.current.value = '';
    {
      dispatch(
        setFilterForMultiTest({
          ...filterForMultiTest,
          page: 1,
          filter: {},
        }),
      );
    }
  };
  const TOTAL_TESTS_COUNT_REF = useRef();

  const getSelectedValueForDropdown = useCallback((options, value) => {
    return options.find((x) => x.value === value) || null;
  }, []);

  const handleInput = (e) => {
    if (e.target?.value.length > 2 || e.target?.value === '') {
      dispatch(
        setFilterForMultiTest({
          ...filterForMultiTest,
          page: 1,
          filter: {
            ...filterForMultiTest?.filter,
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

  const shortlistFormatter = (cell) => {
    if (cell === 'shortlisted') {
      return <img src="/images/Modration.svg" />;
    } else if (cell === 'rejected') {
      return <i className="fas fa-times text-danger"></i>;
    } else {
      return 'N/A';
    }
  };

  const messageFormatter = (cell) => {
    if (cell) {
      return cell;
    } else {
      return 'N/A';
    }
  };

  const ConvertToDate = (cell) => {
    return `${moment(cell).format('DD/MM/YYYY HH:mm')}`;
  };

  const rowcount = (cell, row, rowindex) => {
    return (
      rowindex + (filterForMultiTest?.page - 1) * filterForMultiTest?.limit + 1
    );
  };

  const Action = (cell, row) => {
    return (
      <div className="d-flex justify-content-center flex-row">
        <a
          className="actionIcon mx-2"
          title="Review"
          onClick={() => {
            history.push(`/admin/testReview/${cell}`);
          }}
        >
          <i className="far fa-file-code"></i>
        </a>

        <a
          className="actionIcon mx-2"
          title="Resend Email"
          onClick={() => ResendMail(cell)}
          style={
            row.isExpired ||
            row.endDate < moment().valueOf() ||
            !row.emailId ||
            row.status === 'completed'
              ? { pointerEvents: 'none', opacity: 0.2 }
              : {}
          }
        >
          <i className="fas fa-envelope"></i>
        </a>
        <button
          className="actionIcon mx-2"
          title="Copy Link"
          onClick={() => {
            navigator.clipboard.writeText(
              `${window.location.origin}/student/test/${cell}`,
            );
            toast(<CustomToast type="success" message={'Test link copied'} />);
          }}
        >
          <i className="fas fa-link"></i>
        </button>
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
      headerClasses: ' tableHeading ',
      dataField: 'moderation.message',
      text: 'Notes',
      formatter: messageFormatter,
      style: {
        maxWidth: '8rem',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
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
      const resp = await getallMultiTestSubmissions(
        params.Id,
        filterForMultiTest,
      );
      if (!TOTAL_TESTS_COUNT_REF.current && resp.data?.childTest?.count) {
        TOTAL_TESTS_COUNT_REF.current = true;
        setDataCount(resp.data.childTest?.count);
      }
      setTests(resp.data.childTest?.data || []);
      setCount(resp.data.childTest?.count);
      setData(resp.data.ParentTest);
    } catch (error) {
      if (error.status === 455) {
        dispatch(setLogout());
      }
      toast(<CustomToast type="error" message={error.message} />);
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

  useEffect(() => {
    getdata();
  }, [filterForMultiTest]);

  return (
    <>
      <CustomLoadingAnimation isLoading={Loading} />
      <label className="head">
        <span
          onClick={() => history.push('/admin/testStatus')}
          style={{ cursor: 'pointer' }}
        >
          Dashboard
        </span>
        &nbsp; / &nbsp; Test Status
      </label>
      {dataCount > 0 ? (
        <div className="multiTestStatus">
          <div className="d-flex mb-4">
            <button
              className="btns rounded-pill p-2"
              onClick={() => history.goBack()}
            >
              <i className="fas fa-arrow-left"></i>&nbsp;&nbsp;Go Back
            </button>
          </div>
          <div className="multiTestStatus__header">
            <div className="my-2">
              {' '}
              <h4>{data.Title}</h4>
              <div style={{ fontSize: '15px', maxWidth: '50%' }}>
                <div
                  dangerouslySetInnerHTML={{ __html: data.Description }}
                ></div>
              </div>
            </div>
          </div>
          <div className="multiTestStatus__row">
            <div
              className="d-flex align-items-center"
              style={{ position: 'relative', flex: '1' }}
            >
              <input
                defaultValue={filterForMultiTest.filter.emailId?.$regex}
                type="email"
                name="emailId"
                id="emailId"
                ref={inputRef1}
                onChange={debounce(handleInput, 400)}
                placeholder="Search Email"
                value={filterForMultiTest?.emailId}
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
                defaultValue={filterForMultiTest.filter.studentName?.$regex}
                type="text"
                name="studentName"
                id="studentName"
                ref={inputRef2}
                onChange={debounce(handleInput, 400)}
                placeholder="Search Name"
                value={filterForMultiTest?.studentName}
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
              <input
                defaultValue={filterForMultiTest.filter.phone?.$regex}
                type="tel"
                name="phone"
                id="phone"
                ref={inputRef3}
                placeholder="Search Phone"
                value={filterForMultiTest?.phone}
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
                  filterForMultiTest?.filter['status'],
                )}
                onChange={(e) => {
                  dispatch(
                    setFilterForMultiTest({
                      ...filterForMultiTest,
                      page: 1,
                      filter: {
                        ...filterForMultiTest?.filter,
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
                placeholder="Moderation Status"
                options={moderationStatusOptions}
                value={getSelectedValueForDropdown(
                  moderationStatusOptions,
                  filterForMultiTest?.filter['moderation.status'],
                )}
                onChange={(e) => {
                  dispatch(
                    setFilterForMultiTest({
                      ...filterForMultiTest,
                      page: 1,
                      filter: {
                        ...filterForMultiTest?.filter,
                        'moderation.status': e?.value || undefined,
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
              <button className="btns p-2" onClick={reset}>
                Clear Filters
              </button>
            </div>
          </div>
          <div className="table-responsive">
            {tests.length > 0 ? (
              <BootstrapTable
                classes="mt-5"
                keyField="_id"
                data={tests}
                columns={columns}
              />
            ) : (
              <p className="text-center py-5 fs-4">No Tests</p>
            )}
          </div>
          {dataCount > 10 && (
            <Pagination
              className="pagination-bar"
              currentPage={filterForMultiTest?.page}
              totalCount={count}
              pageSize={filterForMultiTest?.limit}
              onPageChange={(page) =>
                dispatch(
                  setFilterForMultiTest({
                    ...filterForMultiTest,
                    page: page,
                  }),
                )
              }
            />
          )}
        </div>
      ) : (
        <div className="testStatus__empty ">
          <button
            className="btn btn-secondary rounded-pill m-4 align-self-baseline"
            onClick={() => history.goBack()}
          >
            <i className="fas fa-arrow-left"></i>&nbsp;&nbsp;Go Back
          </button>
          <img
            src="/images/EmptyDashboard.svg"
            className="testStatus__empty-img mt-5"
          />
          <div className="testStatus__empty-description">
            <h1>There are no test submitted via this link yet</h1>
          </div>
        </div>
      )}
    </>
  );
};

export default MultiTestStatus;
