import React, { useEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  tokenDataToggle,
  loginToggle,
  verificationCompleteToggle,
} from '../Redux/Actions/dataAction';
import { checkEmailCognito } from '../Services/api';
import { toast } from 'react-toastify';
import { Modal } from 'react-bootstrap';
import CustomToast from '../components/CustomToast/CustomToast';
import CognitoRegister from '../Pages/Auth/CognitoRegister';
import CustomLoadingAnimation from '../components/CustomLoadingAnimation';
function TokenDispatcher() {
  const [register, setRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();

  const handleResponse = async () => {
    try {
      setLoading(true);
      let res = await checkEmailCognito();
      if (res.data.status === 'REGISTER') {
        if (res.data.user === null) {
          let orgData = { emailId: res.data.emailId };
          dispatch(verificationCompleteToggle(orgData));
          setRegister(true);
        } else if (res.data.user) {
          toast(
            <CustomToast
              type="error"
              message="User with Email id already Exists"
            />,
            dispatch(tokenDataToggle(null)),
            history.push('/'),
          );
        }
      } else if (res.data.status === 'LOGIN') {
        console.log('res.data', res.data);
        let orgData = {
          emailId: res.data.user.emailId,
          organisationId: res.data.user._id,
          name: res.data.user.name,
        };
        dispatch(loginToggle(orgData));
        history.push('/admin/testStatus');
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToken = () => {
    let tokenArray = location.hash.split('&');
    let tokenData = {};
    tokenArray.forEach((e) => {
      if (e.includes('id_token')) {
        tokenData['idToken'] = {
          jwtToken: e.replace(/.*id_token=/, '').trim(),
        };
      } else if (e.includes('access_token')) {
        tokenData['accessToken'] = {
          jwtToken: e.replace(/.*access_token=/, '').trim(),
        };
      }
    });

    dispatch(tokenDataToggle(tokenData)); //stores token data in redux
  };

  useEffect(() => {
    handleToken();
    handleResponse();
  }, []);

  return register ? (
    <Modal
      show={register}
      aria-labelledby="contained-modal-title-vcenter example-modal-sizes-title-lg"
      centered
    >
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter" className="text-center">
          Continue with the setup
        </Modal.Title>
      </Modal.Header>
      <CognitoRegister closeModal={() => setRegister(false)} />
    </Modal>
  ) : (
    <CustomLoadingAnimation isLoading={loading} />
  );
}
export default TokenDispatcher;
