import React from 'react';
import moment from 'moment';
import { useEffect, useState } from 'react';
import './countDownTimer.scss';

const CountDownTimer = (props) => {
  const { expiryTime, onComplete } = props;
  const [currentTime, setCurrentTime] = useState(null);
  const [displayTime, setDisplayTime] = useState();

  function msToHMS(ms) {
    let seconds = ms / 1000;
    const getHours = parseInt(seconds / 3600);
    const hours = getHours < 10 ? ` 0${getHours}` : getHours; // 3,600 seconds in 1 hour
    seconds = seconds % 3600; // seconds remaining after extracting hours
    // 3- Extract minutes:
    const getMinutes = parseInt(seconds / 60);
    const minutes = getMinutes < 10 ? `0${getMinutes}` : getMinutes; // 60 seconds in 1 minute
    // 4- Keep only seconds not extracted to minutes:
    seconds = seconds % 60;
    const getSeconds = parseInt(seconds);
    seconds = seconds < 10 ? `0${getSeconds}` : getSeconds;
    return { hours, minutes, seconds };
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const newTime = moment(currentTime).subtract('1', 'second');
      if (newTime <= 0) {
        onComplete();
        return clearInterval(interval);
      }
      setCurrentTime(newTime);

      setDisplayTime(msToHMS(newTime));
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [currentTime]);

  useEffect(() => {
    setDisplayTime({ hours: 0, minutes: 0, seconds: 0 });
    const startDate = moment.now();
    const endDate = moment(expiryTime);
    const time = endDate.diff(startDate, 'milliseconds');
    setCurrentTime(time);
  }, [expiryTime]);

  return (
    <>
      {currentTime ? (
        <div className="display">
          <p className="display">{displayTime?.hours}:</p>
          <p className="display">{displayTime?.minutes}:</p>
          <p className="display">{displayTime?.seconds}</p>
        </div>
      ) : null}{' '}
    </>
  );
};

export { CountDownTimer };
