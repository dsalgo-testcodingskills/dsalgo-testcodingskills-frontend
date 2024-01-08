import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Webcam from 'react-webcam';
import {
  isStudentToggle,
  userImageToggle,
  webCamToggle,
} from '../../Redux/Actions/dataAction';
import PermissibleRoutes from '../../Routes/PermissibleRoutes';

function Studentstest() {
  const dispatch = useDispatch();
  const { webCam, webCamStatus } = useSelector((store) => store.dataReducer);

  const [webcamMinimized, setWebcamMinimized] = useState(false);
  const [capture, setCapture] = useState(false);

  const webcamRef = useRef(null);
  const flag = useRef();
  const imgCaptureIntervalRef = useRef(null);
  const initialCapture = useRef(true);

  const checkCameraAccess = () => {
    navigator.permissions.query({ name: 'camera' }).then((res) => {
      res.addEventListener('change', handlePermissions);
    });
  };

  const cleanUp = () => {
    navigator.permissions.query({ name: 'camera' }).then((res) => {
      res.removeEventListener('change', handlePermissions);
    });
  };

  const handlePermissions = (e) => {
    const permission = e.target.state;
    if (permission === 'granted') {
      dispatch(webCamToggle(true));
    } else {
      dispatch(webCamToggle(false));
    }
  };

  const captureScreenshot = () => {
    const imageSrc = webcamRef?.current?.getScreenshot();
    if (imageSrc) dispatch(userImageToggle(imageSrc));
  };

  const captureImage = () => {
    const imageSrc = webcamRef?.current?.getScreenshot();
    if (imageSrc && initialCapture.current) {
      dispatch(userImageToggle(imageSrc));
      initialCapture.current = false;
    }
  };

  useEffect(() => {
    // set student view
    dispatch(isStudentToggle(true));

    // capture image every interval
    imgCaptureIntervalRef.current = setInterval(() => {
      if (webCam) {
        flag.current = !flag.current;
        setCapture(flag.current);
      }
    }, 30000);

    checkCameraAccess();
    return () => {
      cleanUp();
    };
  }, []);

  useEffect(() => {
    captureScreenshot();
  }, [capture]);

  useEffect(() => {
    if (!webCamStatus && imgCaptureIntervalRef.current !== null) {
      clearInterval(imgCaptureIntervalRef.current);
    }
  }, [webCamStatus]);

  return (
    <>
      <div>
        <PermissibleRoutes />
      </div>
      {webCam && (
        <div
          className={`webcam-wrapper ${
            webcamMinimized ? 'hide' : ''
          } shadow-lg`}
        >
          <div className="me-2 minimize text-end mt-1 pe-auto">
            {!webcamMinimized ? (
              <img
                src="/images/minimize.svg"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setWebcamMinimized(true);
                }}
                title="Minimize"
              />
            ) : (
              <img
                src="/images/camera.svg"
                style={{
                  marginTop: '7px',
                  marginRight: '3px',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setWebcamMinimized(false);
                }}
                title="Maximize"
              />
            )}
          </div>
          <Webcam
            className="webcam"
            width={200}
            height={200}
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            onPlay={captureImage()}
            onUserMediaError={(e) => {
              if (e.message.toLowerCase() === 'permission denied') {
                dispatch(webCamToggle(false));
              }
            }}
          />
        </div>
      )}
    </>
  );
}

export default Studentstest;
