import React from 'react';
import { useSelector } from 'react-redux';
import { Route, Switch, Redirect } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { UserRoleEnum } from '../utils/constants';
import SuperAdminLayout from '../Pages/SuperAdmin/SuperAdminLayout';
import SuperAdminDashboard from '../Pages/SuperAdmin/SuperAdminDashboard';
import OrganisationsList from '../Pages/SuperAdmin/OrganisationsList';
import GlobalOrders from '../Pages/SuperAdmin/GlobalOrders';

function SuperAdminRoutes() {
  const { loginData } = useSelector((store) => store.dataReducer);

  if (loginData?.role !== UserRoleEnum.SUPER_ADMIN) {
    return <Redirect to="/" />;
  }

  return (
    <SuperAdminLayout>
      <Switch>
        <ProtectedRoute exact path="/super-admin/dashboard">
          <SuperAdminDashboard />
        </ProtectedRoute>
        <ProtectedRoute exact path="/super-admin/organisations">
          <OrganisationsList />
        </ProtectedRoute>
        <ProtectedRoute exact path="/super-admin/orders">
          <GlobalOrders />
        </ProtectedRoute>
        
        <Redirect from="/super-admin" to="/super-admin/dashboard" />
      </Switch>
    </SuperAdminLayout>
  );
}

export default SuperAdminRoutes;
