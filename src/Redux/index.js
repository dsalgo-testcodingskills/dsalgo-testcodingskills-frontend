/**
 * Initalize the store and apply all the middlewares
 */

import { createStore } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import rootReducer from './Reducers';

const persistConfig = {
  key: 'user',
  storage,
  whitelist: ['dataReducer'], // which reducer want to store
};

const pReducer = persistReducer(persistConfig, rootReducer);
const store = createStore(pReducer);

const persistor = persistStore(store);

export { store, persistor };
