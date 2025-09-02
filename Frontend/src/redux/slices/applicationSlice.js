import { createSlice } from '@reduxjs/toolkit';

const applicationSlice = createSlice({
  name: 'applications',
  initialState: {
    allApplications: [],
    totalPages: 1,
    currentPage: 1,
    search: '',
    statusFilter: 'all',
  },
  reducers: {
    setApplicationsData: (state, action) => {
      state.allApplications = action.payload.allApplications;
      state.totalPages = action.payload.totalPages;
      state.currentPage = action.payload.currentPage;
      state.search = action.payload.search;
      state.statusFilter = action.payload.statusFilter;
    },
    removeApplication: (state, action) => {
      state.allApplications = state.allApplications.filter((application) => application._id !== action.payload);
    },
    clearApplicationData(state) {
      state.allApplications = [];
      state.totalPages = 1;
      state.currentPage = 1;
      state.search = '';
      state.statusFilter = 'all';
    },
  },
});

export const { setApplicationsData, removeApplication, clearApplicationData } = applicationSlice.actions;
export default applicationSlice.reducer;