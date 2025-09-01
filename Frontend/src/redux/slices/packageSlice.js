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
    removePackage(state, action) {
      state.allPackages = state.allPackages.filter(
        (pkg) => pkg._id !== action.payload
      );

    },
    clearPackagesData(state) {
      state.allPackages = [];
      state.totalPages = 1;
      state.currentPage = 1;
      state.search = '';
      state.statusFilter = 'all';
    },
  },
});


export const { setPackagesData, removePackage, clearPackagesData } = packageSlice.actions;
export default packageSlice.reducer;