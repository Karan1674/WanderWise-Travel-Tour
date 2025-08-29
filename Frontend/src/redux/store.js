import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import expireReducer from 'redux-persist-transform-expire';

// Persist config for auth only
const authPersistConfig = {
  key: 'auth',
  storage,
  transforms: [
    expireReducer({
      expireSeconds: 86400, // 24 hours
      expiredState: {},     // reset state after expiry
    }),
  ],
};

// Wrap only auth slice
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authSlice),
});

// Persist root reducer
const persistConfig = {
  key: 'root',
  version: 1,
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export default store;