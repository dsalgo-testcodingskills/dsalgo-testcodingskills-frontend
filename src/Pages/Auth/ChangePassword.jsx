import React, { useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import {
  changepassword,
  resendCode,
} from '../../Services/api';
import CustomToast from '../../components/CustomToast/CustomToast';
import { useParams, useHistory } from 'react-router-dom';
import './ChangePassword.scss';
import CustomLoadingAnimation from '../../components/CustomLoadingAnimation';
import { useDispatch } from 'react-redux';
import {
  loginToggle,
  tokenDataToggle,
  verificationCompleteToggle,
} from '../../Redux/Actions/dataAction';

function ChangePassword() {
  let { emailId, password } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const defaultDetails = {
    email: emailId,
    oldpassword: password,
    newpassword: '',
    confirmpassword: '',
  };
  const [showPassword, setShowPassword] = useState('password');
  const [confirmPassword, setConfirmPassword] = useState('password');
  const [Loading, setLoading] = useState(false);

  const schema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email id is required'),

    oldpassword: Yup.string().min(8).max(15).required('Password is required'),
    newpassword: Yup.string()
      .min(8)
      .max(15)
      .required('Please confirm your password'),
    confirmpassword: Yup.string()
      .oneOf([Yup.ref('newpassword')], 'Mismatched passwords')
      .required('Please confirm your password'),
  });

  const ChangePass = async (email, oldpassword, newpassword) => {
    try {
      setLoading(true);
      const request = {
        emailId: email,
        oldPassword: oldpassword,
        newPassword: newpassword,
      };
      const {data} = await changepassword(request);
      if (data.message === "Success") {
        let orgData = {
          emailId: data.data.idToken.payload.email,
          organisationId: data.data.idToken.payload['custom:orgId'],
          name: data.data.idToken.payload.name,
          role: data.data.idToken.payload['custom:role'],
          id: data.data.idToken.payload.nickname,
        };
        let tokenData = {
          accessToken: { jwtToken: data.data.accessToken.jwtToken },
          idToken: { jwtToken: data.data.idToken.jwtToken },
        };
        dispatch(loginToggle(orgData));
        console.log('Successfully login');
        dispatch(tokenDataToggle(tokenData));
        history.push('/admin/testStatus');
      }
      toast(
        <CustomToast type="success" message="Password updated successfully" />,
      );
    } catch (error) {
      if (error == 'User is not confirmed.') {
        dispatch(
          verificationCompleteToggle({
            emailId: email,
            password: password,
          }),
        );
        const request = {
          emailId: email,
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
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="row changePassword">
      <CustomLoadingAnimation isLoading={Loading} />
      <div className="col-md-6" style={{ padding: '0px' }}>
        <div className="changePassword__left">
          <div className="changePassword__left-banner">
            <h1 className="changePassword__left-title">Key Highlights</h1>
            <ul className="changePassword__left-list">
              <li>High quality pre defined coding challenges.</li>
              <li>Create custom coding challenges.</li>
              <li>Random capture of code and image of user.</li>
            </ul>
            <img src="/images/loginImg.png" />
          </div>
        </div>
      </div>
      <div className="col-md-6 px-4">
        <Formik
          initialValues={defaultDetails}
          validationSchema={schema}
          onSubmit={(values) => {
            ChangePass(values.email, values.oldpassword, values.newpassword);
          }}
        >
          <Form
            className="container d-flex flex-column "
            style={{ height: '80vh' }}
          >
            <div className="mt-5 mb-3">
              <label className="form-label">Your Email address</label>
              <Field
                name="email"
                type="email"
                className="form-control"
                readOnly={true}
              />
              <ErrorMessage
                name="email"
                render={(msg) => <div className="text-danger">{msg}</div>}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">New Password</label>
              <div className="inputForPassword">
                <Field
                  name="newpassword"
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
                name="newpassword"
                render={(msg) => <div className="text-danger">{msg}</div>}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Confirm Password</label>
              <div className="inputForPassword">
                <Field
                  name="confirmpassword"
                  type={confirmPassword}
                  className="form-control"
                />
                <i
                  className={`fa fa-eye ${
                    confirmPassword === 'text' && 'd-none'
                  } `}
                  onClick={() => {
                    setConfirmPassword('text');
                  }}
                ></i>
                <i
                  className={`fa fa-eye-slash ${
                    confirmPassword === 'password' && 'd-none'
                  } `}
                  onClick={() => {
                    setConfirmPassword('password');
                  }}
                ></i>
              </div>
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
            <div className="d-flex justify-content-start">
              <button
                type="submit"
                className="btn btn-lg my-4"
                style={{ background: '#24c5da', color: 'white' }}
              >
                Submit
              </button>
            </div>
          </Form>
        </Formik>
      </div>
    </div>
  );
}

export default ChangePassword;
