import CustomToast from '../../components/CustomToast/CustomToast';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { setLogout } from '../../Redux/Actions/dataAction';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { CloseButton, Modal } from 'react-bootstrap';
import {
  getUsers,
  createUser,
  updateUser,
  getOrgDetails,
} from '../../Services/api';
import CustomLoadingAnimation from '../../components/CustomLoadingAnimation';
import BootstrapTable from 'react-bootstrap-table-next';
import CustomPagination from '../../components/Pagination/CustomPagination';
import Select from 'react-select';
import '../Dashboard/TestStatus.scss';
import './UserManagement.scss';
import { Tooltip } from '@material-ui/core';
import Plans from '../MyPlans/Plans';

const roleOptions = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
];

const statusOptions = [
  { value: 1, label: 'Active' },
  { value: 2, label: 'Inactive' },
];

const UserManagement = () => {
  const defaultDetails = {
    name: '',
    emailId: '',

    role: 'user',
  };

  const createUserSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    emailId: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    role: Yup.string().required('Role is required'),
  });

  const editUserSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    role: Yup.string().required('Role is required'),
    status: Yup.string().required('Status is required'),
  });

  const [tests, setTests] = useState([]);
  const [Loading, SetLoading] = useState(true);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(defaultDetails);
  const [count, setCount] = useState(0);
  const [userCount, setUserCount] = useState(null);
  const [paymentPlan, setPaymentPlan] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    filter: {},
  });
  const dispatch = useDispatch();
  const { loginData } = useSelector((store) => store.dataReducer);

  useEffect(async () => {
    const userCountData = await getOrgDetails();
    setUserCount(userCountData.data?.orgDetails?.noOfUsers);
  }, [userCount]);

  const submitUser = async (values) => {
    try {
      SetLoading(true);
      const { name, emailId, role } = values;
      const request = {
        name,
        emailId,
        role,
      };
      const resp = await createUser(request);
      console.log('resp data create userrrrrrrrrr', resp.data);

      if (resp.data?.status === 423) {
        toast(<CustomToast type="error" message={resp.data.message} />);
      } else if (resp.data?.status === 400) {
        toast(<CustomToast type="error" message={resp.data.message} />);
      } else {
        setShowCreateUser(false);
        toast(<CustomToast type="success" message={'User Created'} />);
        window.location.reload(false);
      }
    } catch (error) {
      if (error === 'user limit exceeded') {
        setPaymentPlan(true);
      }
    } finally {
      SetLoading(false);
    }
  };

  const submitEditedUser = async (values) => {
    try {
      const { name, role, status, _id } = values;

      const request = {
        name: name,
        id: _id,
        role: role,
        status: status,
      };
      const resp = await updateUser(request);
      console.log('resp data create userrrrrrrrrr', resp.data);
      if (resp.data?.status === 423) {
        toast(<CustomToast type="error" message={resp.data.message} />);
      } else if (resp.data?.status === 400) {
        toast(<CustomToast type="error" message={resp.data.message} />);
      } else {
        setShowCreateUser(false);
        toast(<CustomToast type="success" message={'User updated'} />);
        window.location.reload(false);
      }
    } catch (error) {
      console.log(error);
      toast(<CustomToast type="error" message={error} />);
    }
  };

  const handlePagination = (page) => {
    setFilters({ ...filters, page: page });
  };

  const getdata = async () => {
    try {
      SetLoading(true);
      const resp = await getUsers(filters);
      setTests(resp.data?.data || []);
      setCount(resp.data?.count);
    } catch (error) {
      if (error.status === 455) {
        dispatch(setLogout());
      }
      toast(<CustomToast type="error" message={error.message} />);
    } finally {
      SetLoading(false);
    }
  };

  useEffect(() => {
    getdata();
  }, [filters]);

  const EmailFormatter = (cell) => {
    if (cell) {
      return cell;
    } else {
      return `N/A`;
    }
  };
  const nameFormatter = (cell) => {
    let name = cell.split(' ');
    let fullname = '';
    for (let a of name) {
      fullname += `${a ? a.charAt(0).toUpperCase() + a.slice(1) : ''} `;
    }
    return fullname;
  };
  const ConvertToDate = (cell) => {
    return `${moment(cell).format('DD/MM/YYYY')}`;
  };
  const rowcount = (cell, row, rowindex) => {
    return rowindex + (filters.page - 1) * filters.limit + 1;
  };

  const Action = (cell, row) => {
    const isLoggedUser = loginData?.id === row?._id;
    return (
      <div className="d-flex justify-content-center flex-row">
        <Tooltip title="Edit User" arrow>
          <span>
            <button
              disabled={isLoggedUser ? true : false}
              className={`actionIcon mx-2 ${
                isLoggedUser ? 'action-icon-color' : ''
              }`}
              onClick={() => {
                setCurrentUserData(row);
                setShowEditUser(true);
              }}
            >
              <i className="fas fa-edit"></i>
            </button>
          </span>
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
      dataField: 'emailId',
      text: 'Email Id',
      formatter: EmailFormatter,
      style: {
        paddingTop: '18px',
      },
    },
    {
      headerClasses: ' tableHeading',
      dataField: 'name',
      formatter: nameFormatter,
      text: 'Name',
      style: {
        paddingTop: '18px',
      },
    },
    {
      headerClasses: ' tableHeading',
      dataField: 'status',
      text: 'Status',
      formatter: (cell) => {
        return cell === 2 ? 'Inactive' : 'Active';
      },
      style: {
        paddingTop: '18px',
      },
    },
    {
      headerClasses: ' tableHeading',
      dataField: 'role',
      text: 'Role',
      style: {
        paddingTop: '18px',
      },
    },
    {
      headerClasses: 'tableHeading',
      dataField: 'createdAt',
      text: 'Created At',
      formatter: ConvertToDate,
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

  const getDropdownValueFromOptions = (options, value) =>
    options.find((option) => option.value === value);

  return (
    <>
      <CustomLoadingAnimation isLoading={Loading} />
      <div className="d-flex justify-content-between align-items-end">
        <label className="head">Dashboard &nbsp; / &nbsp; User</label>
        <p style={{ marginRight: '107px', color: 'red' }}></p>
      </div>

      {count > 0 ? (
        <div className="testStatus">
          <div className="testStatus__row">
            <div
              className="d-flex align-items-center"
              style={{ position: 'relative', flex: '1' }}
            ></div>
            <div
              className=" d-flex align-items-center justify-content-end"
              style={{ flex: '2' }}
            >
              <button
                className={'btns'}
                onClick={() => {
                  setShowCreateUser(true);
                }}
              >
                Create User
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
              <p className="text-centre py-5 fs-4">No user Created</p>
            )}
          </div>
          {count > 10 && (
            <CustomPagination
              filters={filters}
              totalItems={count}
              handlePagination={handlePagination}
            />
          )}
        </div>
      ) : (
        <div className="testStatus__empty">
          <div
            className="testStatus_empty-btn"
            style={{ margin: '20px', marginLeft: 'auto' }}
          >
            <button
              className="btns"
              onClick={() => {
                setShowCreateUser(true);
              }}
            >
              Create User
            </button>
          </div>
          <img src="/images/EmptyDashboard.svg" className="align-bottom" />
        </div>
      )}
      <Modal
        show={showEditUser}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter example-modal-sizes-title-lg"
        centered
      >
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
              Edit User
            </div>
          </Modal.Title>
          <CloseButton
            onClick={() => {
              setShowEditUser(false);
            }}
          />
        </Modal.Header>
        <Modal.Body className=" text-center">
          <Formik
            initialValues={currentUserData}
            validationSchema={editUserSchema}
            onSubmit={(values) => {
              submitEditedUser(values);
            }}
          >
            {({ values, setFieldValue }) => {
              return (
                <>
                  <Form>
                    <div
                      className="d-flex"
                      style={{
                        width: '100%',
                        flexDirection: 'column',
                        padding: '0 40px',
                      }}
                    >
                      <div
                        className=" my-3"
                        style={{
                          textAlign: 'left',
                        }}
                      >
                        <label className=" form-labels">Name</label>
                        <Field
                          name="name"
                          type="text"
                          className="form-control"
                        />
                        <ErrorMessage
                          name="name"
                          render={(msg) => (
                            <div className="text-danger">{msg}</div>
                          )}
                        />
                      </div>
                      <div className=" my-3 mb-4" style={{ textAlign: 'left' }}>
                        <label className="form-labels">Role</label>
                        <Select
                          value={getDropdownValueFromOptions(
                            roleOptions,
                            values.role,
                          )}
                          options={roleOptions}
                          onChange={(e) => {
                            setFieldValue('role', e.value);
                          }}
                        />
                        <ErrorMessage
                          name="number"
                          render={(msg) => (
                            <div className="text-danger">{msg}</div>
                          )}
                        />
                      </div>
                      <div className=" my-3 mb-4" style={{ textAlign: 'left' }}>
                        <label className="form-labels">Status</label>
                        <Select
                          value={getDropdownValueFromOptions(
                            statusOptions,
                            values.status,
                          )}
                          options={statusOptions}
                          onChange={(e) => {
                            setFieldValue('status', e.value);
                          }}
                        />
                        <ErrorMessage
                          name="number"
                          render={(msg) => (
                            <div className="text-danger">{msg}</div>
                          )}
                        />
                      </div>
                    </div>

                    <Modal.Footer className="d-flex">
                      <button
                        className="btns btns--white"
                        type="button"
                        onClick={() => setShowEditUser(false)}
                      >
                        Cancel
                      </button>
                      <button className="btns" type="submit">
                        Submit
                      </button>
                    </Modal.Footer>
                  </Form>
                </>
              );
            }}
          </Formik>
        </Modal.Body>
      </Modal>

      <Modal
        show={showCreateUser}
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
                Create User
              </div>
            </Modal.Title>
            <CloseButton
              onClick={() => {
                setShowCreateUser(false);
              }}
            />
          </Modal.Header>
          <Modal.Body className=" text-center">
            <Formik
              initialValues={defaultDetails}
              validationSchema={createUserSchema}
              onSubmit={(values) => {
                submitUser(values);
              }}
            >
              {({ values, setFieldValue }) => {
                return (
                  <Form>
                    <div
                      className="d-flex"
                      style={{
                        width: '100%',
                        flexDirection: 'column',
                        padding: '0 40px',
                      }}
                    >
                      <div
                        className=" my-3"
                        style={{
                          textAlign: 'left',
                        }}
                      >
                        <label className=" form-labels">Name</label>
                        <Field
                          name="name"
                          type="text"
                          className="form-control"
                        />
                        <ErrorMessage
                          name="name"
                          render={(msg) => (
                            <div className="text-danger">{msg}</div>
                          )}
                        />
                      </div>
                      <div className=" my-3 mb-4" style={{ textAlign: 'left' }}>
                        <label className="form-labels">Email</label>
                        <Field
                          name="emailId"
                          type="email"
                          className="form-control"
                        />
                        <ErrorMessage
                          name="emailId"
                          render={(msg) => (
                            <div className="text-danger">{msg}</div>
                          )}
                        />
                      </div>

                      <div className=" mb-2" style={{ textAlign: 'left' }}>
                        <label className="form-labels">Role</label>
                        <Select
                          value={getDropdownValueFromOptions(
                            roleOptions,
                            values.role,
                          )}
                          options={roleOptions}
                          onChange={(e) => setFieldValue('role', e.value)}
                        />
                      </div>
                    </div>

                    <Modal.Footer className="d-flex">
                      <button
                        className="btns btns--white"
                        type="button"
                        onClick={() => setShowCreateUser(false)}
                      >
                        Cancel
                      </button>
                      <button className="btns" type="submit">
                        Submit
                      </button>
                    </Modal.Footer>
                  </Form>
                );
              }}
            </Formik>
          </Modal.Body>
        </>
      </Modal>

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
    </>
  );
};

export default UserManagement;
