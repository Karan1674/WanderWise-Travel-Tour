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

// Persist config for auth slice only
const persistConfig = {
  key: 'root',
  storage,
  transforms: [
    expireReducer({
      expireSeconds: 86400, // 24 hours
      expiredState: {}, // Reset state after expiry
    }),
  ],
};

// Combine reducers
const rootReducer = combineReducers({
  auth: persistReducer(persistConfig, authSlice),
  agents: persistReducer(persistConfig, agentSlice),
  packages: persistReducer(persistConfig, packageSlice),
});

// Create store
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export default store;
