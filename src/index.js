import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { PersistGate } from 'redux-persist/integration/react';
import App from './App';
import './index.scss';
import { persistor, store } from './Redux';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <Provider store={store}>
    <PersistGate persistor={persistor} loading={null}>
      <App />
      <ToastContainer position="bottom-center" hideProgressBar />
    </PersistGate>
  </Provider>,
  document.getElementById('root'),
);

reportWebVitals();
