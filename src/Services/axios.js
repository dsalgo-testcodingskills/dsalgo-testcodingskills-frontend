import axios from 'axios';
import { checkExpiry } from '../utils/helper';
import { store } from '../Redux';
import { webCamToggle, setLogout } from '../Redux/Actions/dataAction';

// const axios = require('axios');

// Step-1: Create a new Axios instance with a custom config.
// The timeout is set to 10s. If the request takes longer than
// that then the request will be aborted.

const customAxios = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}`,
  // baseURL: `http://localhost:8080`,
  timeout: 30000,
});

// Step-2: Create request, response & error handlers
const requestHandler = (request) => {
  // Token will be dynamic so we can use any app-specific way to always
  // fetch the new token before making the call
  if (store.getState().dataReducer.tokenData) {
    if (request.url.indexOf('s3.') === -1) {
      request.headers.Authorization = `Bearer ${
        store.getState().dataReducer.tokenData.idToken.jwtToken
      }`;
    }
  }
  return request;
};

const responseHandler = (response) => {
  if (response.status === 401) {
    window.location = '/login';
  }
  // check link expiry from api
  if (store.getState().dataReducer.tokenData) {
    return response;
  } else if (response?.data?.isExpired) {
    checkExpiry(response?.data._id, response.data?.isExpired);
    store.dispatch(webCamToggle(false));
  }

  return response;
};

const errorHandler = (error) => {
  if (error.response.status === 401) {
    store.dispatch(setLogout());
  }
  return Promise.reject(
    error?.response?.data?.message || error?.response?.data || error,
  );
};

// Step-3: Configure/make use of request & response interceptors from Axios
// Note: You can create one method say configureInterceptors, add below in that,
// export and call it in an init function of the application/page.

customAxios.interceptors.request.use(
  (request) => requestHandler(request),
  (error) => errorHandler(error),
);

customAxios.interceptors.response.use(
  (response) => responseHandler(response),
  (error) => errorHandler(error),
);

// Step-4: Export the newly created Axios instance to be used in different locations.

export default customAxios;
