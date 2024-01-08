import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import CustomToast from '../../components/CustomToast/CustomToast';
import {
  verificationCompleteToggle,
} from '../../Redux/Actions/dataAction';
import {
  createOrganization,
} from '../../Services/api';
import CustomLoadingAnimation from '../../components/CustomLoadingAnimation';
import { useHistory } from 'react-router-dom';

function Register() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const defaultDetails = {
    organizationName: '',
    emailId: '',
    name: '',
    password: '',
    confirmpassword: '',
  };
  const schema = Yup.object().shape({
    organizationName: Yup.string()
      .min(2, 'Organization Name atleast contains 2 character')
      .max(45, 'character limit exceeds')
      .required('Organization name is required'),
    emailId: Yup.string()
      .email('Invalid email address')
      .required('Email id is required'),
    name: Yup.string().min(2).max(30).required('Name is required'),
    password: Yup.string().min(8).max(15).required('Password is required'),
    confirmpassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Mismatched passwords')
      .required('Please confirm your password'),
  });
  const registerUser = async (values) => {
    try {
      setLoading(true);
      let createResp = await createOrganization(values);
      if (createResp.data.status === 400) {
        toast(<CustomToast type="warning" message={createResp.data.message} />);
      } else {
        dispatch(
          verificationCompleteToggle({
            emailId: values.emailId,
            password: values.password,
          }),
        );
        toast(
          <CustomToast
            type="success"
            message="Verification code sent on your Email id"
          />,
        );
        history.push('/verify');
      }
    } catch (error) {
      toast(<CustomToast type="error" message={error} />);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login">
        <div className="login__left">
          <div className="login__left-banner">
            <h1 className="login__left-title">Key Highlights</h1>
            <ul className="login__left-list">
              <li>High quality pre defined coding challenges.</li>
              <li>Create custom coding challenges.</li>
              <li>Random capture of code and image of user.</li>
            </ul>
            <img src="/images/loginImg.png" />
          </div>
        </div>
        <div className="login__right">
          <Formik
            initialValues={defaultDetails}
            validationSchema={schema}
            onSubmit={(values) => {
              registerUser(values);
            }}
          >
            <Form className="login__right-form">
              <div className=" my-1 mb-4" style={{ textAlign: 'left' }}>
                <label className="form-label">Name</label>
                <Field name="name" type="text" className="form-control" />
                <ErrorMessage
                  name="name"
                  render={(msg) => <div className="text-danger">{msg}</div>}
                />
              </div>
              <div className=" my-1 mb-4" style={{ textAlign: 'left' }}>
                <label className="form-label">Email</label>
                <Field name="emailId" type="email" className="form-control" />
                <ErrorMessage
                  name="emailId"
                  render={(msg) => <div className="text-danger">{msg}</div>}
                />
              </div>

              <div className=" my-1 mb-4" style={{ textAlign: 'left' }}>
                <label className="form-label">Organization Name</label>
                <Field
                  name="organizationName"
                  type="text"
                  className="form-control"
                />
                <ErrorMessage
                  name="organizationName"
                  render={(msg) => <div className="text-danger">{msg}</div>}
                />
              </div>

              <div className=" my-1 mb-4" style={{ textAlign: 'left' }}>
                <label className="form-label">Password</label>

                <Field
                  name="password"
                  type="password"
                  className="form-control"
                />
                <ErrorMessage
                  name="password"
                  render={(msg) => <div className="text-danger">{msg}</div>}
                />
              </div>
              <div className=" my-1 mb-4" style={{ textAlign: 'left' }}>
                <label className="form-label">Confirm Password</label>
                <Field
                  name="confirmpassword"
                  type="password"
                  className="form-control"
                />
                <ErrorMessage
                  name="confirmpassword"
                  render={(msg) => <div className="text-danger">{msg}</div>}
                />
              </div>

              <div className="roles mt-3">
                <h6>Password must contain</h6>
                <ul>
                  <li>Password must be of 8 characters</li>
                  <li>Password must have at least 1 number</li>
                  <li> Have at least 1 special character</li>
                  <li>Have at least 1 uppercase character</li>
                  <li> Have at least 1 lowercase character</li>
                </ul>
              </div>

              <button
                type="submit"
                className="btns px-4"
                style={{ width: '400px' }}
              >
                Sign up
              </button>
              <label
                className="form-forget"
                style={{
                  marginTop: '20px',
                  marginLeft: '260px',
                }}
                onClick={() => {
                  history.push('/verify');
                }}
              >
                Verify your account?
              </label>
              <div className="login__right-partition">
                <label className="form-label">
                  Sign In with your social account
                </label>
              </div>
              <label
                className="form-forget"
                style={{ marginTop: '20px' }}
                onClick={() => {
                  history.push('/login');
                }}
              >
                Already have an account?
              </label>
            </Form>
          </Formik>
        </div>
      </div>

      <CustomLoadingAnimation isLoading={loading} />
    </>
  );
}

export default Register;
