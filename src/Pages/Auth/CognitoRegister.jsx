import React, { useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import CustomToast from '../../components/CustomToast/CustomToast';
import {
  verificationCompleteToggle,
  loginToggle,
} from '../../Redux/Actions/dataAction';
import { updateCognitoOrganization } from '../../Services/api';
import CustomLoadingAnimation from '../../components/CustomLoadingAnimation';
import { Modal } from 'react-bootstrap';
function CognitoRegister({ closeModal }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const { verificationComplete } = useSelector((store) => store.dataReducer);
  const [loading, setLoading] = useState(false);
  const defaultDetails = {
    organizationName: '',
    emailId: verificationComplete.emailId,
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
  });
  const registerUser = async (values) => {
    try {
      setLoading(true);
      let body = {
        emailId: values.emailId,
        organizationName: values.organizationName,
        name: values.name,
      };
      let response = await updateCognitoOrganization(body);
      let orgData = {
        emailId: response.data.data.emailId,
        organisationId: response.data.data._id,
        name: response.data.data.name,
      };
      dispatch(loginToggle(orgData));
      dispatch(
        verificationCompleteToggle({
          emailId: values.emailId,
        }),
      );
      closeModal();
      history.push('/admin/testStatus');
      toast(
        <CustomToast
          type="success"
          message="Organisation created successfully"
        />,
      );

      setLoading(false);
    } catch (error) {
      toast(<CustomToast type="error" message={error} />);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Modal.Body className="px-4">
        <Formik
          initialValues={defaultDetails}
          validationSchema={schema}
          onSubmit={(values) => {
            registerUser(values);
          }}
        >
          <Form>
            <div className="row justify-content-center">
              <div className="mb-3 mt-2">
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
            </div>
            <div className="row justify-content-center">
              <div className="mb-3">
                <label className="form-label">Email</label>
                <Field
                  name="emailId"
                  type="email"
                  className="form-control"
                  disabled={verificationComplete.emailId}
                />
                <ErrorMessage
                  name="emailId"
                  render={(msg) => <div className="text-danger">{msg}</div>}
                />
              </div>
            </div>
            <div className="row justify-content-center">
              <div className="mb-3">
                <label className="form-label">Name</label>
                <Field name="name" type="text" className="form-control" />
                <ErrorMessage
                  name="name"
                  render={(msg) => <div className="text-danger">{msg}</div>}
                />
              </div>
            </div>
            <div className="d-flex justify-content-evenly pb-4">
              <button type="submit" className="btn btn-success ">
                Register
              </button>
            </div>
          </Form>
        </Formik>
      </Modal.Body>
      <CustomLoadingAnimation isLoading={loading} />
    </>
  );
}

export default CognitoRegister;
