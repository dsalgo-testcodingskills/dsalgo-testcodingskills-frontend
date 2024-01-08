import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import CustomToast from '../../components/CustomToast/CustomToast';
//
import {
  loginToggle,
  tokenDataToggle,
  verificationCompleteToggle,
} from '../../Redux/Actions/dataAction';
import { AuthenticateUser, resendCode } from '../../Services/api';
import CustomLoadingAnimation from '../../components/CustomLoadingAnimation';
import { useHistory } from 'react-router-dom';
import './Login.scss';
function Login() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState('password');

  const history = useHistory();
  const defaultDetails = {
    email: '',
    password: '',
  };
  const schema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string().required('Password is required'),
  });

  const doLogin = async (values) => {
    try {
      setLoading(true);
      const res = await AuthenticateUser({
        emailId: values.email,
        password: values.password,
      });
      if (res) {
        let orgData = {
          emailId: res.data.idToken.payload.email,
          organisationId: res.data.idToken.payload['custom:orgId'],
          name: res.data.idToken.payload.name,
          role: res.data.idToken.payload['custom:role'],
          id: res.data.idToken.payload.nickname,
        };
        let tokenData = {
          accessToken: { jwtToken: res.data.accessToken.jwtToken },
          idToken: { jwtToken: res.data.idToken.jwtToken },
        };
        dispatch(loginToggle(orgData));
        console.log('Successfully login');
        dispatch(tokenDataToggle(tokenData));
        history.push('/admin/testStatus');
      }
    } catch (error) {
      if (error == 'User is not confirmed.') {
        dispatch(
          verificationCompleteToggle({
            emailId: values.email,
            password: values.password,
          }),
        );

        const request = {
          emailId: values.email,
        };
        await resendCode(request);
        toast(
          <CustomToast
            type="success"
            message="Verification code sent on your Email id"
          />,
        );
        history.push('/verify');
      } else {
        toast(<CustomToast type="error" message={error} />, {
          autoClose: 3000,
        });
      }
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
              doLogin(values);
            }}
          >
            <Form className="login__right-form">
              <div className=" my-3 mb-5" style={{ textAlign: 'left' }}>
                <label className="form-label">Email</label>
                <Field name="email" type="email" className="form-control" />
                <ErrorMessage
                  name="email"
                  render={(msg) => <div className="text-danger">{msg}</div>}
                />
              </div>
              <div className=" my-3 mb-5" style={{ textAlign: 'left' }}>
                <div className="d-flex justify-content-between">
                  <label className="form-label">Password</label>
                  <label
                    className="form-forget"
                    onClick={() => {
                      history.push('/forgotPassword');
                    }}
                  >
                    {' '}
                    Forgot Password?
                  </label>
                </div>{' '}
                <div className="inputForPassword">
                  <Field
                    name="password"
                    type={showPassword}
                    className="form-control"
                  />
                  <i
                    className={`fa fa-eye ${
                      showPassword === 'text' && 'd-none'
                    } `}
                    onClick={() => {
                      setShowPassword('text');
                    }}
                  ></i>
                  <i
                    className={`fa fa-eye-slash ${
                      showPassword === 'password' && 'd-none'
                    } `}
                    onClick={() => {
                      setShowPassword('password');
                    }}
                  ></i>
                </div>
                <ErrorMessage
                  name="password"
                  render={(msg) => <div className="text-danger">{msg}</div>}
                />
              </div>

              <button
                type="submit"
                className="btns px-4"
                style={{ width: '400px' }}
              >
                Sign in
              </button>
              <div className="redirectLabelDiv">
                <label
                  className="form-forget"
                  style={{ marginTop: '20px' }}
                  onClick={() => {
                    history.push('/changePassword');
                  }}
                >
                  {/* Activate account */}
                </label>
                <label
                  className="form-forget"
                  style={{ marginTop: '20px' }}
                  onClick={() => {
                    history.push('/verify');
                  }}
                >
                  Verify your account?
                </label>
              </div>
              <div className="login__right-partition">
                <label className="form-label">
                  Sign In with your social account
                </label>
              </div>
              <label
                className="form-forget"
                style={{ marginTop: '20px' }}
                onClick={() => {
                  history.push('/register');
                }}
              >
                Don&apos;t have an account yet?
              </label>
            </Form>
          </Formik>
        </div>
      </div>
      <CustomLoadingAnimation isLoading={loading} />
    </>
  );
}

export default Login;
