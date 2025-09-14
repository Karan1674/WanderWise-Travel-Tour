// store.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { createTransform } from "redux-persist";

// import slices
import authSlice from "./slices/authSlice";
import agentSlice from "./slices/agentSlice";
import packageSlice from "./slices/packageSlice";
import packageBookingSlice from "./slices/packageBookingSlice";
import couponSlice from "./slices/couponSlice";
import careerSlice from "./slices/careerSlice";
import applicationSlice from "./slices/applicationSlice";
import contactEnquirySlice from "./slices/contactEnquirySlice";
import faqEnquirySlice from "./slices/faqEnquirySlice";

// ---------- Expiration Transform (24 hours) ----------
const expireTransform = createTransform(
  (inboundState) => {
    return {
      ...inboundState,
      _persistedAt: Date.now(), // save timestamp
    };
  },
  (outboundState) => {
    if (!outboundState?._persistedAt) return outboundState;

    const now = Date.now();
    const expireTime = 86400 * 1000; // 24h in ms

    if (now - outboundState._persistedAt > expireTime) {
      return {}; // expired → reset state
    }
    return outboundState;
  },
  { whitelist: ["auth", "agents", "packages", "packageBookings", "coupons", "careers", "applications", "contactEnquiries", "faqEnquiries"] }
);

// ---------- Root Persist Config ----------
const persistConfig = {
  key: "root",
  storage,
  transforms: [expireTransform],
};

// ---------- Root Reducer ----------
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

// ---------- Persisted Reducer ----------
const persistedReducer = persistReducer(persistConfig, rootReducer);

// ---------- Store ----------
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
