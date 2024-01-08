import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route } from 'react-router-dom';

function ProtectedRoute({ children, ...restOfProps }) {
  const { tokenData } = useSelector((store) => store.dataReducer);
  return (
    <Route
      {...restOfProps}
      render={() => (tokenData ? children : <Redirect to="/" />)}
    />
  );
}

export default ProtectedRoute;
