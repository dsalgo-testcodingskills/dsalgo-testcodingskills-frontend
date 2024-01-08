import React, { useState, useRef, useEffect } from 'react';
import { CloseButton, Modal, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import { setLogout } from '../../Redux/Actions/dataAction';
import {
  getOrgDetails,
  getSubDetails,
  logOut,
  studentOrgDetails,
} from '../../Services/api';
import { createImageFromInitials, getRandomColor } from '../../utils/helper';
import ForgotPassword from '../Auth/ForgotPassword';
import Register from '../Auth/Register';
import Verify from '../Auth/VerifyCode';
import './Header.scss';

function Header() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { tokenData, loginData } = useSelector((store) => store.dataReducer);
  const history = useHistory();
  const toggleRef = useRef(null);
  const [login, setLogin] = useState(false);
  const [register, setRegister] = useState(false);
  const [verify, setVerify] = useState(false);
  const [studentView, setStudentView] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [toggleMenu, setToggleMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [subDetails, setSubDetails] = useState(null);
  const [color, setColor] = useState(null);

  const closeModal = () => {
    setLogin(false);
    setRegister(false);
    setVerify(false);
    setForgotPassword(false);
  };

  const onRegister = () => {
    setLogin(false);
    setRegister(false);
    setVerify(true);
  };

  const onVerify = () => {
    setVerify(false);
  };

  const toggleDropdown = (e) => {
    if (toggleRef.current && !toggleRef.current.contains(e.target)) {
      setToggleMenu(false);
    }
  };

  useEffect(() => {
    window.addEventListener('click', toggleDropdown);
    return () => {
      window.removeEventListener('click', toggleDropdown);
    };
  }, []);

  const logOutUser = async () => {
    try {
      await logOut();
      dispatch(setLogout());
      history.push('/');
    } catch (error) {
      console.log('Error: while logging out', error);
    }
  };

  const renderLoginOptions = () => {
    return (
      <div className="login-options z-40">
        {user?.userInfo?.role == 'admin' ? (
          <div
            className="login-option-block"
            onClick={() => {
              setToggleMenu(!toggleMenu);
              history.push(`/admin/organizatonProfile`);
            }}
          >
            <div className="login-option-block--icon">
              <img
                src="/images/dropdown-your-profile.svg"
                className="card-img-top"
                alt="..."
              />
            </div>
            <div className="login-option-block--text">Organization</div>
          </div>
        ) : null}
        {subDetails?.length > 0 && user?.userInfo?.role == 'admin' && (
          <div
            className="login-option-block"
            onClick={() => {
              setToggleMenu(!toggleMenu);
              history.push(`/admin/myPlans`);
            }}
          >
            <div className="login-option-block--icon">
              <img
                src="/images/dropdown-currency.svg"
                className="card-img-top"
                alt="..."
              />
            </div>
            <div className="login-option-block--text">My Plans</div>
          </div>
        )}

        <div
          className="login-option-block"
          onClick={() => {
            setToggleMenu(!toggleMenu);
            logOutUser();
          }}
        >
          <div className="login-option-block--icon">
            <img src="/images/dropdown-logout.svg" alt="..." />
          </div>
          <div className="login-option-block--text">Logout</div>
        </div>
      </div>
    );
  };

  const redirectLogin = () => {
    window.location.assign(process.env.REACT_APP_COGNITO_HOSTED_URL);
  };

  const getOrganization = async () => {
    try {
      let resp = await getOrgDetails();
      setUser(resp.data);
    } catch (error) {
      console.log('Error: while getting organization details', error);
    }
  };

  const getSubscription = async () => {
    try {
      const subData = await getSubDetails();
      setSubDetails(subData.data.data);
    } catch (error) {
      console.log('Error: while getting subscription details', error);
    }
  };

  const getStudentOrg = async () => {
    try {
      const testId = location.pathname.split('/').pop(-1);
      const studentData = await studentOrgDetails(testId);
      setUser({ orgDetails: { ...studentData.data } });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(async () => {
    let regex = /student/;

    if (regex.test(location.pathname) === true) {
      getStudentOrg();
      setStudentView(true);
    } else {
      setStudentView(false);
    }
    setColor(getRandomColor());
  }, []);

  useEffect(async () => {
    if (loginData) {
      getOrganization();
      if (loginData?.role === 'admin') {
        getSubscription();
      }
    }
  }, [loginData]);

  return (
    <>
      <Navbar bg="light" expand="lg" collapseOnSelect={true}>
        <Navbar.Brand href={studentView ? null : '/'} className="ms-4">
          <img src="/images/ALGO.png" style={{ height: '3.5rem' }} />
        </Navbar.Brand>

        <div className="ms-auto me-4">
          {location.pathname !== '/login' && (
            <button
              hidden={!(!tokenData && !studentView)}
              className="btns btn__1"
              onClick={() => {
                setForgotPassword(false);
                history.push('/login');
              }}
            >
              Login
            </button>
          )}
          {location.pathname !== '/register' && (
            <button
              type="button"
              className="btns btn__2"
              hidden={!(!tokenData && !studentView)}
              onClick={() => {
                history.push('/register');
              }}
            >
              Sign up free
            </button>
          )}
        </div>

        {studentView && (
          <div className="me-4" style={{ width: '50px', height: '50px' }}>
            <img
              loading="lazy"
              className="w-100 h-100 object-cover"
              style={{ borderRadius: '50%' }}
              src={
                user?.orgDetails?.organizationLogo ||
                createImageFromInitials(500, user?.orgDetails?.name, color)
              }
              alt="No Image"
            />
          </div>
        )}

        {!studentView && tokenData && (
          <>
            <Navbar.Toggle className="me-4" aria-controls="basic-navbar-nav" />
            <Navbar.Collapse
              id="basic-navbar-nav"
              className="navbar-list-container mx-4"
            >
              <Nav>
                <Nav.Link eventKey="1" className="navbar-list-border">
                  <div
                    onClick={() => {
                      history.push('/admin/testStatus');
                    }}
                    className={`navbar-list ${
                      location.pathname === '/admin/testStatus'
                        ? 'card-active'
                        : ''
                    }`}
                  >
                    <>
                      <p
                        className=" ml-2 mr-3  mb-0  ml-3 nav__link"
                        style={{ cursor: 'pointer', padding: '11px 0px' }}
                      >
                        <i className="far fa-clipboard nav__link--icon"></i>
                        Test
                      </p>
                    </>
                  </div>
                </Nav.Link>
                <Nav.Link eventKey="1" className="navbar-list-border">
                  <div
                    onClick={() => history.push('/admin/customQuestion')}
                    className={`navbar-list ${
                      location.pathname === '/admin/customQuestion'
                        ? 'card-active'
                        : ''
                    }`}
                  >
                    <>
                      <p
                        className="mr-3 mb-0 ml-3 nav__link"
                        style={{ cursor: 'pointer', padding: '11px 0px' }}
                      >
                        <i className="fas fa-question-circle nav__link--icon"></i>
                        Questions
                      </p>
                    </>
                  </div>
                </Nav.Link>

                {user?.userInfo?.role === 'admin' && (
                  <Nav.Link eventKey="1" className="navbar-list-border">
                    <div
                      onClick={() => history.push('/admin/userManagement')}
                      className={`navbar-list  ${
                        location.pathname === '/admin/userManagement'
                          ? 'card-active'
                          : ''
                      }`}
                    >
                      <>
                        <p
                          className=" ml-2 mr-3  mb-0  ml-3 nav__link"
                          style={{ cursor: 'pointer', padding: '11px 0px' }}
                        >
                          <i className="far fa-user nav__link--icon"></i>
                          Users
                        </p>
                      </>
                    </div>
                  </Nav.Link>
                )}

                {/* navbar dropdown */}
                <NavDropdown
                  title={
                    <span>
                      <i className="far  fa-light fa-user"></i>
                      <span style={{ margin: '0 5px' }}>
                        {user?.userInfo?.name}
                      </span>
                    </span>
                  }
                  id="basic-nav-dropdown"
                  style={{ display: 'flex', marginLeft: '10vw' }}
                >
                  <div className="login-options z-40">
                    {user?.userInfo?.role == 'admin' ? (
                      <NavDropdown.Item eventKey="1">
                        <div
                          className="login-option-block"
                          onClick={() => {
                            history.push(`/admin/organizatonProfile`);
                          }}
                        >
                          <div className="login-option-block--icon">
                            <img
                              src="/images/dropdown-your-profile.svg"
                              className="card-img-top"
                              alt="..."
                            />
                          </div>
                          <div className="login-option-block--text">
                            Organization
                          </div>
                        </div>
                      </NavDropdown.Item>
                    ) : null}

                    {subDetails?.length > 0 && user?.userInfo?.role == 'admin' && (
                      <NavDropdown.Item eventKey="2">
                        <div
                          className="login-option-block"
                          onClick={() => {
                            history.push(`/admin/myPlans`);
                          }}
                        >
                          <div className="login-option-block--icon">
                            <img
                              src="/images/dropdown-currency.svg"
                              className="card-img-top"
                              alt="..."
                            />
                          </div>
                          <div className="login-option-block--text">
                            My Plans
                          </div>
                        </div>
                      </NavDropdown.Item>
                    )}

                    <NavDropdown.Item eventKey="3">
                      <div
                        className="login-option-block"
                        onClick={() => {
                          logOutUser();
                        }}
                      >
                        <div className="login-option-block--icon">
                          <img src="/images/dropdown-logout.svg" alt="..." />
                        </div>
                        <div className="login-option-block--text">Logout</div>
                      </div>
                    </NavDropdown.Item>
                  </div>
                </NavDropdown>
              </Nav>
            </Navbar.Collapse>
          </>
        )}
      </Navbar>

      {/* Modal  */}
      <Modal
        show={register || verify || forgotPassword}
        aria-labelledby="contained-modal-title-vcenter example-modal-sizes-title-lg"
        centered
      >
        <>
          <Modal.Header>
            <Modal.Title
              id="contained-modal-title-vcenter"
              className="text-center"
            >
              {register
                ? 'Register'
                : forgotPassword
                ? 'Forgot Password'
                : 'Verify'}
            </Modal.Title>
            <CloseButton onClick={closeModal} />
          </Modal.Header>
          {login && redirectLogin()}
          {register && <Register closeModal={onRegister} />}
          {verify && <Verify closeModal={onVerify} />}
          {forgotPassword && <ForgotPassword closeModal={closeModal} />}
        </>
      </Modal>
      {toggleMenu ? renderLoginOptions() : null}
    </>
  );
}

export default Header;
