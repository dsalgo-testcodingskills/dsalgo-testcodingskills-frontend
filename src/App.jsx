import React from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import AdminRoutes from './Routes/AdminRoutes';
import Studentstest from './Pages/StudentTest/Studentstest';
import './App.scss';
import Header from './Pages/Header/Header';
import TokenDispatcher from './Routes/TokenDispatcher';
import LandingPage from './Pages/LandingPage/LandingPage';
import { useSelector } from 'react-redux';
import Login from './Pages/Auth/Login';
import ForgotPassword from './Pages/Auth/ForgotPassword';
import Register from './Pages/Auth/Register';
import VerifyCode from './Pages/Auth/VerifyCode';
import CognitoRegister from './Pages/Auth/CognitoRegister';
import Footer from './Pages/Footer/Footer';
import About from './Pages/Footer/About';
import Contact from './Pages/Footer/Contact';
import PrivacyPolicy from './Pages/Footer/PrivacyPolicy';
import CancellationPolicy from './Pages/Footer/CancellationPolicy';
import TermCond from './Pages/Footer/TermCond';
import Pricing from './Pages/Footer/Pricing';
import ChangePassword from './Pages/Auth/ChangePassword';

function App() {
  const { loginData } = useSelector((store) => store.dataReducer);
  return (
    <BrowserRouter>
      <Header />
      <Switch>
        <Route path="/tokenAuth" component={TokenDispatcher}></Route>
        <Route exact path="/login" component={Login}></Route>
        <Route exact path="/forgotPassword" component={ForgotPassword}></Route>
        <Route exact path="/register" component={Register}></Route>
        <Route exact path="/verify" component={VerifyCode}></Route>
        <Route
          exact
          path="/changePassword/:emailId/:password"
          component={ChangePassword}
        ></Route>
        <Route path="/registerOrg" component={CognitoRegister}></Route>

        <Route exact path="/" component={LandingPage} />

        <Route exact path="/about" component={About} />
        <Route exact path="/contact" component={Contact} />
        <Route exact path="/privacy-policy" component={PrivacyPolicy} />
        <Route exact path="/terms-conditions" component={TermCond} />
        <Route
          exact
          path="/cancellation-policy"
          component={CancellationPolicy}
        />
        <Route exact path="/pricing" component={Pricing} />

        <Route path="/student/*" component={Studentstest} />

        <Route path="/admin/*" component={AdminRoutes} />

        <Route path="*">
          {loginData ? <Redirect to="/" /> : <Redirect to="/" />}
        </Route>
      </Switch>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
