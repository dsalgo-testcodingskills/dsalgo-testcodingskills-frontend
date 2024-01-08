import React, { useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import { useDispatch, useSelector } from 'react-redux';

import {
  AuthenticateUser,
  codeVerification,
  resendCode,
} from '../../Services/api';
import CustomLoadingAnimation from '../../components/CustomLoadingAnimation';
import CustomToast from '../../components/CustomToast/CustomToast';
import {
  loginToggle,
  registrationCompleteToggle,
  tokenDataToggle,
} from '../../Redux/Actions/dataAction';

import { useHistory } from 'react-router-dom';
import './VerifyCode.scss';
function VerifyCode() {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { verificationComplete } = useSelector((store) => store.dataReducer);
  const history = useHistory();
  const defaultDetails = {
    emailId: verificationComplete ? verificationComplete.emailId : '',
    verificationCode: '',
  };

  const schema = Yup.object().shape({
    emailId: Yup.string()
      .email('Invalid email address')
      .required('Email id is required'),
    verificationCode: Yup.string()
      .min(6, '6 digits required for verification code')
      .required('Verification code is required'),
  });
  console.log('verification', verificationComplete);
  const verifyCode = async (values) => {
    try {
      setLoading(true);
      const resp = await codeVerification(values);
      toast(
        <CustomToast type="success" message="Account verified successfully" />,
      );
      console.log(resp);
      if (verificationComplete) {
        console.log('verification', verificationComplete);
        const res = await AuthenticateUser(verificationComplete);
        console.log(res);
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
        dispatch(tokenDataToggle(tokenData));
        dispatch(registrationCompleteToggle());
        history.push('/admin/testStatus');
      } else {
        history.push('/login');
      }
    } catch (error) {
      toast(<CustomToast type="error" message={error} />);
    } finally {
      setLoading(false);
    }
  };

  const ResendCode = async () => {
    try {
      setLoading(true);
      const request = {
        emailId: verificationComplete.emailId,
      };

      await resendCode(request);
      toast(
        <CustomToast
          type="success"
          message="Verification code resent successfully"
        />,
      );
    } catch (error) {
      toast(<CustomToast type="error" message={error} />);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className=" verifyCode px-4">
        <Formik
          initialValues={defaultDetails}
          validationSchema={schema}
          onSubmit={(values) => {
            verifyCode(values);
          }}
        >
          <Form className="container d-flex flex-column">
            <div className="mt-5 mb-3">
              <label className="form-label verifyCode__form-label">
                Your Email address
              </label>
              <Field name="emailId" type="email" className="form-control" />
              <ErrorMessage
                name="emailId"
                render={(msg) => <div className="text-danger">{msg}</div>}
              />
            </div>

            <div>
              <label className="form-label verifyCode__form-label">
                Verification Code
              </label>
              <Field
                name="verificationCode"
                type="text"
                className="form-control"
              />
              <ErrorMessage
                name="verificationCode"
                render={(msg) => <div className="text-danger">{msg}</div>}
              />
            </div>

            <div className="d-flex justify-content-center">
              <button type="submit" className="btns my-3">
                Submit
              </button>
            </div>
          </Form>
        </Formik>

        <div className="container d-flex justify-content-end">
          <label
            className="form-forget"
            style={{ marginTop: '20px' }}
            onClick={ResendCode}
          >
            Resend Code
          </label>
        </div>
      </div>
      <CustomLoadingAnimation isLoading={loading} />
    </>
  );
}

export default VerifyCode;
