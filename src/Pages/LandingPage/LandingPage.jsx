import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import './LandingPage.scss';

function LandingPage() {
  const { tokenData } = useSelector((store) => store.dataReducer);
  const history = useHistory();

  useEffect(() => {
    if (tokenData) {
      history.push('/admin/testStatus');
    } else {
      history.push('/');
    }
  }, [tokenData]);
  return (
    <div className="landing">
      <div className="wrap">
        <section className="main-content row">
          <div className="col-md-6 d-flex justify-content-center">
            <div className="banner">
              <h1 className="banner_title">
                Hire talented developers, confidently
              </h1>
              <div className="banner_description">
                We help companies to test the coding skills of developers and
                hire the right candidates with our technical assessment
                platform.
              </div>
              <button
                className="btns banner_btns"
                onClick={() => {
                  history.push('/register');
                }}
              >
                Get Started
              </button>
            </div>
          </div>
          <div className="col-md-6 d-flex justify-content-center align-items-center">
            <div className="img-holder">
              <img
                src="/images/landingImg.svg"
                alt="icon"
                className="img-fluid"
              />
            </div>
          </div>
        </section>

        {/*Algo Intro */}
        <section className="main-content main-content__2 row ">
          <div className="col-md-6 d-flex justify-content-center">
            <div className="banner">
              <h1 className="banner_title">Watch what ALGO can do for you</h1>
              <div className="banner_description">
                Check out a 3 minute video presented by our CEO
              </div>
            </div>
          </div>
          <div className="col-md-6 d-flex justify-content-center align-items-center main-content__videoWrap">
            <video
              width="100%"
              height="100%"
              poster="/images/videoThubnail.png"
              controls
              className="videoPlayer"
              style={{ borderRadius: '12px' }}
            >
              <source
                src="https://timeloggerautoupdate.s3.ap-south-1.amazonaws.com/test-demo-processed.mp4"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LandingPage;
