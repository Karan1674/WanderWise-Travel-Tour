import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    userType: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.userType = action.payload.userType;
    },
    clearUser: (state) => {
      state.user = null;
      state.userType = null;
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;