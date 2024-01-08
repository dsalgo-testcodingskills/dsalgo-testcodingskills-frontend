import React from 'react';

const PasswordStrengthIndicator = (props) => {
  return (
    <div className="font-weight-bold">
      <p className="text-dark">Password must contain: </p>
      <ul className="text-muted pl-4">
        <PasswordStrengthIndicatorItem
          isValid={(props.password || '').length > 7}
          text="Password must be of 8 characters"
        />
        <PasswordStrengthIndicatorItem
          isValid={/\d/g.test(props.password || '')}
          text="Password must have at least 1 number"
        />
        <PasswordStrengthIndicatorItem
          isValid={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g.test(
            props.password || '',
          )}
          text="Have at least 1 special character"
        />
        <PasswordStrengthIndicatorItem
          isValid={/[A-Z]/g.test(props.password || '')}
          text="Have at least 1 capital character"
        />
        <PasswordStrengthIndicatorItem
          isValid={/[a-z]/g.test(props.password || '')}
          text="Have at least 1 small character"
        />
      </ul>
    </div>
  );
};

const PasswordStrengthIndicatorItem = ({ isValid, text }) => {
  return (
    <>
      <div className="d-flex">
        <i
          className={isValid ? 'fa fa-check-circle text-success zindex-2' : ''}
          style={isValid ? { position: 'relative', left: '-15px' } : {}}
        />
        <li
          className="ml-2"
          style={isValid ? { position: 'relative', left: '-13px' } : {}}
        >
          {text}
        </li>
      </div>
    </>
  );
};

export default PasswordStrengthIndicator;
