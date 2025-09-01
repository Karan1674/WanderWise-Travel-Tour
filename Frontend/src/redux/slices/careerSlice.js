import { createSlice } from '@reduxjs/toolkit';

const careerSlice = createSlice({
  name: 'careers',
  initialState: {
    allCareers: [],
    totalPages: 1,
    currentPage: 1,
    search: '',
    statusFilter: 'all',
  },
  reducers: {
    setCareersData: (state, action) => {
      state.allCareers = action.payload.allCareers;
      state.totalPages = action.payload.totalPages;
      state.currentPage = action.payload.currentPage;
      state.search = action.payload.search;
      state.statusFilter = action.payload.statusFilter;
    },
    removeCareer: (state, action) => {
      state.allCareers = state.allCareers.filter((career) => career._id !== action.payload);
    },
    clearCareerData(state) {
        state.allCareers = [];
        state.totalPages = 1;
        state.currentPage = 1;
        state.search = '';
        state.statusFilter = 'all';
    },
  },
});

export const { setCareersData, removeCareer, clearCareerData } = careerSlice.actions;
export default careerSlice.reducer;