import React from 'react';
import { useSelector } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import ChangePassword from '../Pages/Auth/ChangePassword';
import CreateTest from '../Pages/Dashboard/CreateTest';
import Dashboard from '../Pages/Dashboard/Dashboard';
import SolutionsReview from '../Pages/Dashboard/SolutionsReview';
import TestReview from '../Pages/Dashboard/TestReview';
import TestStatus from '../Pages/Dashboard/TestStatus';
import Question from '../Pages/Dashboard/Question';
import ProtectedRoute from './ProtectedRoute';
import CustomQuestionList from '../Pages/Dashboard/CustomQuestionList';
import CreateCustomQuestion from '../Pages/Dashboard/CreateCustomQuestion';
import EditOrganization from '../Pages/OrganizationPage/EditOrganization';
import MyPlans from '../Pages/MyPlans/MyPlans';
import MultiTestStatus from '../Pages/Dashboard/MultiTestStatus';
import UserManagement from '../Pages/UserManagement/UserManagement';

function AdminRoutes() {
  const { loginData } = useSelector((store) => store.dataReducer);

  return (
    <div className="container-fluid">
      <Switch>
        <ProtectedRoute exact={true} path="/admin/myPlans">
          <MyPlans />
        </ProtectedRoute>
        <Route exact path="/admin/changepassword" component={ChangePassword} />

        <ProtectedRoute exact={true} path="/admin/dashboard">
          <Dashboard />
        </ProtectedRoute>
        <ProtectedRoute exact={true} path="/admin/testStatus">
          <TestStatus />
        </ProtectedRoute>
        <ProtectedRoute exact={true} path="/admin/createTest">
          <CreateTest />
        </ProtectedRoute>
        <ProtectedRoute exact={true} path="/admin/testStatus/:Id">
          <MultiTestStatus />
        </ProtectedRoute>
        <ProtectedRoute path="/admin/testReview/:testId">
          <TestReview />
        </ProtectedRoute>
        <ProtectedRoute path="/admin/solutionsreview/:testId/:qid">
          <SolutionsReview />
        </ProtectedRoute>
        <ProtectedRoute exact={true} path="/admin/customQuestion">
          <CustomQuestionList />
        </ProtectedRoute>
        <ProtectedRoute path="/admin/customQuestionnew/:id?">
          <CreateCustomQuestion />
        </ProtectedRoute>
        {loginData?.role === 'admin' && (
          <>
            <ProtectedRoute path="/admin/organizatonProfile">
              <EditOrganization />
            </ProtectedRoute>
            <ProtectedRoute exact={true} path="/admin/userManagement">
              <UserManagement />
            </ProtectedRoute>
          </>
        )}
        <Route path="/admin/question/:questionId">
          <Question />
        </Route>
      </Switch>
    </div>
  );
}

export default AdminRoutes;
