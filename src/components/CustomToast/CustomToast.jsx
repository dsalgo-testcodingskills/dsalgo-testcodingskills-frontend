import React from 'react';
import './customToast.scss';

function CustomToast(props) {
  const { type, message } = props;

  const showIcon = (messageType) => {
    switch (messageType) {
      case 'success':
        return <i className="fas fa-check" />;
      case 'warning':
        return <i className="fas fa-exclamation" />;
      case 'error':
        return <i className="fas fa-times" />;
      default:
        return <i className="fas fa-info" />;
    }
  };

  return (
    <div className="d-flex align-items-center custom-toast h-100">
      <div className={`${type} d-flex align-items-center`}>
        {showIcon(type)}
      </div>

      <div className="pl-3 pr-3">
        <h6 className="text-capitalize">{type}</h6>
        <p className="m-0">{message}</p>
      </div>
    </div>
  );
}

export default CustomToast;
