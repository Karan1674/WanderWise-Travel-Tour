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

// Persist config for auth slice only
const authPersistConfig = {
  key: 'auth',
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
  auth: persistReducer(authPersistConfig, authSlice),
  agents: persistReducer(authPersistConfig, agentSlice)
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
