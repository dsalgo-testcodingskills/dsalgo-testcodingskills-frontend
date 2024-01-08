import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router';
import CustomLoadingAnimation from '../components/CustomLoadingAnimation';
import {
  selectedTestToggle,
  webCamStatusUpdate,
  webCamToggle,
} from '../Redux/Actions/dataAction';
import { getTestAPI, TestStarted } from '../Services/api';
import { formatDate } from '../utils/helper';

import './Home.scss';

const CAMERA_PERMISSION_ERROR_MESSAGES = [
  'requested device not found',
  'permission denied',
  'permission dismissed',
];

const Home = () => {
  const params = useParams();
  const history = useHistory();
  const dispatch = useDispatch();
  const { webCam, webCamStatus, selectedTest } = useSelector(
    (store) => store.dataReducer,
  );
  const [Loading, SetLoading] = useState(false);
  const [error, setError] = useState({
    alertType: '',
    showStart: false,
    message: '',
  });
  const [isVideoWatched, setIsVideoWatched] = useState(false);
  const videoRef = useRef(null);

  const setVideoWatched = () => setIsVideoWatched(true);

  const getTest = async (id) => {
    try {
      SetLoading(true);
      const resp = await getTestAPI(id);
      console.log('get test', resp);
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
          message: '<b>Test link has expired</b>',
        });
        return;
      }
      if (resp?.data?.test.status === 'completed') {
        setError({
          alertType: 'info',
          showStart: false,
          message: '<b> Your Test is submitted Successfully </b> ',
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

  const startTest = async () => {
    try {
      if (webCamStatus) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (stream) dispatch(webCamToggle(true));
      }

      await TestStarted(params.testId);

      history.push(`/student/question/${params.testId}`);
    } catch (error) {
      if (
        CAMERA_PERMISSION_ERROR_MESSAGES.indexOf(
          error?.message?.toLowerCase(),
        ) > -1
      ) {
        setError({
          alertType: 'danger',
          showStart: true,
          message: 'Please allow camera to start the test.',
        });
      }
    }
  };

  useEffect(() => {
    if (webCam) {
      dispatch(webCamToggle(false));
    }
    if (params.testId) {
      getTest(params.testId);
    }
  }, [params.testId]);

  useEffect(() => {
    if (videoRef.current)
      videoRef.current.addEventListener('ended', setVideoWatched);

    return () => {
      if (videoRef.current)
        videoRef.current.removeEventListener('ended', setVideoWatched);
    };
  }, [videoRef]);

  return (
    <>
      <div className=" home ">
        {!error?.message || (error?.message && error?.showStart) ? (
          <>
            <div className="videoWrap">
              <video
                width="100%"
                height="100%"
                poster="/images/instruction_video_thumbnail.png"
                ref={videoRef}
                controls
                style={{ borderRadius: '12px' }}
              >
                <source
                  src="https://timeloggerautoupdate.s3.ap-south-1.amazonaws.com/test-demo-processed.mp4"
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="home__right">
              <div className="card-body text-center p-4">
                {selectedTest?.emailId && (
                  <h4>Welcome, {selectedTest?.emailId}</h4>
                )}

                <p className="mt-3">
                  The test duration is&nbsp;
                  <strong>{selectedTest?.testDuration} minutes.</strong>
                </p>
                <p className="mt-3">
                  The timer will start once you click the {'"Start Test"'}{' '}
                  button
                </p>
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
                <p className="mt-3 mb-4">
                  Please watch the instruction video before you proceed.
                </p>

                <br />

                <button
                  className={`btns mt-4 ${
                    !isVideoWatched ? 'button_disabled' : ''
                  }`}
                  onClick={() => {
                    startTest();
                  }}
                  disabled={!isVideoWatched}
                >
                  {selectedTest?.isExpired ? 'View Submission' : 'Start Test'}
                </button>
              </div>
            </div>
          </>
        ) : null}
        {error?.message ? (
          <div
            className="card-body text-center p-5"
            style={{ height: '36rem' }}
          >
            <img src="/images/message.png" />
            <div dangerouslySetInnerHTML={{ __html: error?.message }}></div>
          </div>
        ) : null}
      </div>

      <CustomLoadingAnimation isLoading={Loading} />
    </>
  );
};

export default Home;
