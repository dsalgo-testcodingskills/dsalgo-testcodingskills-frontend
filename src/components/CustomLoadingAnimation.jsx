import React from 'react';
import { Backdrop, makeStyles } from '@material-ui/core';
import { Spinner } from 'react-bootstrap';

function CustomLoadingAnimation({
  isLoading,
  message,
  backdropStyle = {},
  messageStyle,
}) {
  const useStyles = makeStyles((theme) => ({
    backdrop: {
      // default styles
      color: '#fff',
      backgroundColor: 'rgba(0,0,0,0.5) !important',

      // override backdrop styles
      ...backdropStyle,

      // should not be overridden
      zIndex: theme.zIndex.drawer + 1,
    },
  }));
  const classes = useStyles();
  return isLoading ? (
    <Backdrop open className={classes.backdrop}>
      <div className="text-center">
        <Spinner
          animation="border"
          role="loader"
          variant="secondary"
          style={{ width: 50, height: 50 }}
        >
          {/* <span className="sr-only">Loading...</span> */}
        </Spinner>
        <p className="font-weight-bold h6 mt-4" style={messageStyle}>
          {message}
        </p>
      </div>
    </Backdrop>
  ) : null;
}

export default CustomLoadingAnimation;
