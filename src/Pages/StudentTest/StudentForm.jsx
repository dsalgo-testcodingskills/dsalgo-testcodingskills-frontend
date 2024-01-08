import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useEffect, useState } from 'react';

import * as Yup from 'yup';
import { formatDate } from '../../utils/helper';
import { getTestAPI, submitStudentForm } from '../../Services/api';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router';

import './StudentForm.scss';
import {
  selectedTestToggle,
  webCamStatusUpdate,
} from '../../Redux/Actions/dataAction';
import CustomLoadingAnimation from '../../components/CustomLoadingAnimation';
const defaultDetails = {
  email: '',
  phone: '',
  studentName: '',
};
const schema = Yup.object().shape({
  studentName: Yup.string().required('Student Name is required'),
  tags: Yup.array().optional(),

  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  phone: Yup.string()
    .min(10, 'Phone number should contain 10 digits')
    .max(12, 'Phone number length should not be greater than 12')
    .required('Phone Number is required'),
});
function StudentForm() {
  const params = useParams();

  const dispatch = useDispatch();
  const { selectedTest } = useSelector((store) => store.dataReducer);
  console.log(selectedTest);
  const history = useHistory();
  const { testId } = useParams();
  const [Loading, SetLoading] = useState(false);
  const [error, setError] = useState({
    alertType: '',
    showStart: false,
    message: '',
  });
  const getTest = async (id) => {
    try {
      SetLoading(true);
      const resp = await getTestAPI(id);
      console.log(resp);
      if (
        resp?.data?.test?.webcamStatus !== undefined ||
        resp?.data?.test?.webcamStatus !== null
      ) {
        dispatch(webCamStatusUpdate(resp?.data?.test?.webcamStatus));
      }
      dispatch(selectedTestToggle(resp?.data?.test));

      if (resp?.data?.status === 'expired' || resp?.data?.status === 'late') {
        setError({
          alertType: 'info',
          showStart: false,
          message: 'Test link has expired',
        });
        return;
      }
      if (resp?.data?.test.status === 'completed') {
        setError({
          alertType: 'info',
          showStart: false,
          message: 'Your Test is submitted Successfully ',
        });
        return;
      }
      if (resp?.data?.status === 'wait') {
        setError({
          alertType: 'info',
          showStart: false,
          message: `<div className="h5">Welcome, ${
            resp?.data?.test?.emailId
          }</div>Your test is scheduled on <br/><strong>${formatDate(
            resp?.data?.test?.startDate,
            'long',
            'short',
          )}</strong><br/>Please check back later.`,
        });
        return;
      }
    } catch (error) {
      console.log(error);
      setError({
        alertType: 'danger',
        showStart: false,
        message:
          "<div className='h5 text-center'>Oops!!!</div>Something went wrong!!!<br/>Please try again.",
      });
    } finally {
      SetLoading(false);
    }
  };
  useEffect(() => {
    if (params.testId) {
      getTest(params.testId);
    }
  }, [params.testId]);
  const submitStudent = async (values) => {
    try {
      SetLoading(true);
      const request = {
        emailId: values.email,
        phone: values.phone,
        studentName: values.studentName,
      };
      const res = await submitStudentForm(request, testId);
      if (res.data.statusCode == 200) {
        setError({
          alertType: 'danger',
          showStart: false,
          message:
            "<div className='h5 text-center'></div>Test limit Exceeded !!<br/>Please contact the organization.",
        });
      }
      if (res?.data?.link) {
        history.push(res.data.link.match(/\/student.+/g)[0]);
      } else {
        setError({
          alertType: 'danger',
          showStart: false,
          message:
            "<div className='h5 text-center'></div>Something went Wrong!! <br/>Please contact the organization.",
        });
      }
    } catch (err) {
      console.log(err);
      setError({
        alertType: 'danger',
        showStart: false,
        message:
          "<div className='h5 text-center'>Oops!!!</div>Something went wrong!!!<br/>Please try again.",
      });
    } finally {
      SetLoading(false);
    }
  };
  return (
    <>
      <div className="align-items-center d-flex justify-content-center my-5 text-center">
        {!error?.message || (error?.message && error?.showStart) ? (
          <div className="studentForm">
            <p className="mt-3 studentForm__title">
              <strong>{selectedTest?.Title}</strong>
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                dangerouslySetInnerHTML={{ __html: selectedTest?.Description }}
              ></div>
            </div>
            <p className="mt-3">
              The test link is valid from&nbsp;
              {
                <strong>
                  {formatDate(selectedTest?.startDate, 'long', 'short')
                    .split(' at')
                    .join(',')}
                </strong>
              }
              {' to '}
              {
                <strong>
                  {formatDate(selectedTest?.endDate, 'long', 'short')
                    .split(' at')
                    .join(',')}
                </strong>
              }
            </p>
            <Formik
              enableReinitialize={true}
              initialValues={defaultDetails}
              validationSchema={schema}
              onSubmit={(values, { resetForm }) => {
                submitStudent(values);
                resetForm();
              }}
            >
              {() => (
                <Form className="container d-flex flex-column my-3">
                  <div className=" my-3 mb-5" style={{ textAlign: 'left' }}>
                    <label className="form-label">Name</label>
                    <Field
                      name="studentName"
                      type="text"
                      className="form-control"
                    />
                    <ErrorMessage
                      name="studentName"
                      render={(msg) => <div className="text-danger">{msg}</div>}
                    />
                  </div>
                  <div className="row my-6 justify-content-between">
                    <div className="col-6 ">
                      <label className="form-label">Email address</label>
                      <Field
                        name="email"
                        type="email"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="email"
                        render={(msg) => (
                          <div className="text-danger">{msg}</div>
                        )}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Phone number</label>
                      <Field name="phone" type="tel" className="form-control" />
                      <ErrorMessage
                        name="phone"
                        render={(msg) => (
                          <div className="text-danger">{msg}</div>
                        )}
                      />
                    </div>
                  </div>
                  <div className=" d-flex justify-content-center mt-5">
                    <button type="submit" className="btns px-4">
                      Proceed
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        ) : null}
        {error?.message ? (
          <div className="card-body text-center p-5">
            <div dangerouslySetInnerHTML={{ __html: error?.message }}></div>
          </div>
        ) : null}
      </div>
      <CustomLoadingAnimation isLoading={Loading} />
    </>
  );
}
export default StudentForm;
