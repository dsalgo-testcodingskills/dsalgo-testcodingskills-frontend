import React, { useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import { useHistory } from 'react-router-dom';
import {
  sendForgotPasswordVerificationCode,
  verifyForgotPasswordVerificationCode,
} from '../../Services/api';
import CustomLoadingAnimation from '../../components/CustomLoadingAnimation';
import CustomToast from '../../components/CustomToast/CustomToast';
import './ForgotPassword.scss';
function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [verificationCodeSend, setSendVerificationCode] = useState(false);
  const [showPassword, setShowPassword] = useState("password")
  const [confirmPassword, setConfirmPassword] = useState("password")

  const history = useHistory();
  const sendCodeInitialDetails = {
    emailId: '',
  };

  const resetPasswordInitialDetails = {
    verificationCode: '',
    newPassword: '',
  };

  const sendCodeSchema = Yup.object().shape({
    emailId: Yup.string()
      .email('Invalid email address')
      .required('Email id is required'),
  });

  const resetPasswordSchema = Yup.object().shape({
    verificationCode: Yup.string()
      .min(6, '6 digits required for verification code')
      .required('Verification code is required'),
    newPassword: Yup.string()
      .min(8, 'Password length should be of 8 words')
      .max(16, 'Too Long password length should be between 8 to 15 words')
      .required('New Password is required!'),
  });

  const sendVerificationCode = async (values) => {
    try {
      
      await sendForgotPasswordVerificationCode(values);
      setSendVerificationCode(true);
    } catch (error) {
      toast(<CustomToast type="error" message={error} />);
    } finally {
      setLoading(false);
    }
  };

  const verifiyForgotPassword = async (values) => {
    if(values.confirmPassword !== values.newPassword) return;
    try {
      await verifyForgotPasswordVerificationCode(values);
      toast(
        <CustomToast
          type="success"
          message={'Password changed successfully'}
        />,
      );
      history.push('/login');
    } catch (error) {
      toast(<CustomToast type="error" message={error} />);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className=" forgotPassword px-4">
        {!verificationCodeSend ? (
          <Formik
            initialValues={sendCodeInitialDetails}
            validationSchema={sendCodeSchema}
            onSubmit={(values) => {
              sendVerificationCode(values);
            }}
          >
            <Form className="container d-flex flex-column">
              <div className="mt-5 mb-3">
                <label className="form-label forgotPassword__form-label">
                  Your Email address
                </label>
                <Field name="emailId" type="email" className="form-control" />
                <ErrorMessage
                  name="emailId"
                  render={(msg) => <div className="text-danger">{msg}</div>}
                />
              </div>

              <div className="d-flex justify-content-center">
                <button type="submit" className="btns my-5">
                  Send verification code
                </button>
              </div>
            </Form>
          </Formik>
        ) : (
          <Formik
            initialValues={resetPasswordInitialDetails}
            validationSchema={resetPasswordSchema}
            onSubmit={(values) => {
              verifiyForgotPassword(values);
            }}
          >
            <Form className="container d-flex flex-column">
              <div className="mt-5 mb-3">
                <label className="form-label forgotPassword__form-label">
                  Your Email address
                </label>
                <Field
                  name="emailId"
                  type="email"
                  className="form-control"
                  disabled
                />
                <ErrorMessage
                  name="emailId"
                  render={(msg) => <div className="text-danger">{msg}</div>}
                />
              </div>

              <div className="mb-3">
                <label className="form-label forgotPassword__form-label">
                  New Password
                </label>
                <div className='inputForPassword'>
                  <Field
                    name="newPassword"
                    type={showPassword}
                    className="form-control"
                  />
                  <i className={`fa fa-eye ${showPassword === "text" && "d-none"} `} onClick={() => { setShowPassword("text") }} ></i>
                  <i className={`fa fa-eye-slash ${showPassword === "password" && "d-none"} `} onClick={() => { setShowPassword('password') }} ></i>
                </div>
                <ErrorMessage
                  name="newPassword"
                  render={(msg) => <div className="text-danger">{msg}</div>}
                />
              </div>

              <div className="mb-3">
                <label className="form-label forgotPassword__form-label">
                  Confirm Password
                </label>
                <div className='inputForPassword'>
                  <Field
                    name="confirmPassword"
                    type={confirmPassword}
                    className="form-control"
                  />
                  <i className={`fa fa-eye ${confirmPassword === "text" && "d-none"} `} onClick={() => { setConfirmPassword("text") }} ></i>
                  <i className={`fa fa-eye-slash ${confirmPassword === "password" && "d-none"} `} onClick={() => { setConfirmPassword('password') }} ></i>
                </div>
                <ErrorMessage
                  name="newPassword"
                  render={(msg) => <div className="text-danger">{msg}</div>}
                />
              </div>

              <div>
                <label className="form-label forgotPassword__form-label">
                  Verification Code
                </label>
                  <Field
                    name="verificationCode"
                    type="password"
                    className="form-control"
                  />
                <ErrorMessage
                  name="verificationCode"
                  render={(msg) => <div className="text-danger">{msg}</div>}
                />
              </div>

              <div className="d-flex justify-content-center">
                <button type="submit" className="btns my-5">
                  Submit
                </button>
              </div>
            </Form>
          </Formik>
        )}
      </div>
      <CustomLoadingAnimation isLoading={loading} />
    </>
  );
}

export default ForgotPassword;
