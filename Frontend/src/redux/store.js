import { configureStore, combineReducers } from '@reduxjs/toolkit';
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

import authSlice from './slices/authSlice';
import agentSlice from './slices/agentSlice';
import packageSlice from './slices/packageSlice';
import packageBookingSlice from './slices/packageBookingSlice';
import couponSlice from './slices/couponSlice';
import careerSlice from './slices/careerSlice';
import applicationSlice from './slices/applicationSlice';
import contactEnquirySlice from './slices/contactEnquirySlice';
import faqEnquirySlice from './slices/faqEnquirySlice';



const expireAuthAndOthers = expireReducer({
  expireSeconds: 86400, // 24 hours
  expiredState: {},
  onExpire: () => {
    storage.removeItem('persist:root'); 
  },
});

// Root persist config
const persistConfig = {
  key: 'root',
  storage,
  transforms: [expireAuthAndOthers],
};

// Combine reducers
const rootReducer = combineReducers({
  auth: authSlice,
  agents: agentSlice,
  packages: packageSlice,
  packageBookings: packageBookingSlice,
  coupons: couponSlice,
  careers: careerSlice,
  applications: applicationSlice,
  contactEnquiries: contactEnquirySlice,
  faqEnquiries: faqEnquirySlice,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
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
