import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import QuestionList from '../Pages/QuestionList/QuestionList';
import AssessmentPage from '../Pages/AssessmentPage/AssessmentPage';
import Home from '../Pages/Home';
import NonPermissiblePage from '../Pages/NonPermissiblePage';
import StudentForm from '../Pages/StudentTest/StudentForm';

function PermissibleRoutes() {
  const { webCam, webCamStatus } = useSelector((store) => store.dataReducer);

  return (
    <Switch>
      <Route
        exact
        path="/student"
        render={() => <Redirect to="/student/test/:testId" />}
      />

      <Route exact path="/student/test/:testId" component={Home} />

      <Route path="/student/UserINFO/:testId" component={StudentForm} />

      {!webCamStatus || webCam ? (
        <>
          <Route path="/student/question/:testId" component={QuestionList} />
          <Route path="/student/answer/:qid" component={AssessmentPage} />
        </>
      ) : (
        <NonPermissiblePage />
      )}
    </Switch>
  );
}

export default PermissibleRoutes;
