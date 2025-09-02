import { createSlice } from '@reduxjs/toolkit';

const faqEnquirySlice = createSlice({
  name: 'faqEnquiries',
  initialState: {
    allFaqEnquiries: [],
    totalPages: 1,
    currentPage: 1,
    search: '',
    statusFilter: 'all',
  },
  reducers: {
    setFaqEnquiriesData: (state, action) => {
      state.allFaqEnquiries = action.payload.allFaqEnquiries;
      state.totalPages = action.payload.totalPages;
      state.currentPage = action.payload.currentPage;
      state.search = action.payload.search;
      state.statusFilter = action.payload.statusFilter;
    },
    updateFaqEnquiry: (state, action) => {
      state.allFaqEnquiries = state.allFaqEnquiries.map(enquiry =>
        enquiry._id === action.payload._id ? action.payload : enquiry
      );
    },
    removeFaqEnquiry: (state, action) => {
      state.allFaqEnquiries = state.allFaqEnquiries.filter(enquiry => enquiry._id !== action.payload);
    },
    clearFaqEnquiryData(state) {
      state.allFaqEnquiries = [];
      state.totalPages = 1;
      state.currentPage = 1;
      state.search = '';
      state.statusFilter = 'all';
    },
  },
});

export const { setFaqEnquiriesData, updateFaqEnquiry, removeFaqEnquiry, clearFaqEnquiryData } = faqEnquirySlice.actions;
export default faqEnquirySlice.reducer;