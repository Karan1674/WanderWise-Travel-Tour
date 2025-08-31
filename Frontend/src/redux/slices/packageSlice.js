import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  allPackages: [], 
  totalPages: 1, 
  currentPage: 1, 
  search: '', 
  statusFilter: 'all', 
};

const packageSlice = createSlice({
  name: 'packages',
  initialState,
  reducers: {
    setPackagesData(state, action) {
      state.allPackages = action.payload.allPackages || [];
      state.totalPages = action.payload.totalPages || 1;
      state.currentPage = action.payload.currentPage || 1;
      state.search = action.payload.search || '';
      state.statusFilter = action.payload.statusFilter || 'all';
    },
    clearPackagesData(state) {
      state.allPackages = [];
    },
  },
});

export const { setPackagesData, clearPackagesData } = packageSlice.actions;
export default packageSlice.reducer;
