import { createSlice } from '@reduxjs/toolkit';

const contactEnquirySlice = createSlice({
  name: 'contactEnquiries',
  initialState: {
    allContactEnquiries: [],
    totalPages: 1,
    currentPage: 1,
    search: '',
    statusFilter: 'all',
  },
  reducers: {
    setContactEnquiriesData: (state, action) => {
      state.allContactEnquiries = action.payload.allContactEnquiries;
      state.totalPages = action.payload.totalPages;
      state.currentPage = action.payload.currentPage;
      state.search = action.payload.search;
      state.statusFilter = action.payload.statusFilter;
    },
    updateContactEnquiry: (state, action) => {
      state.allContactEnquiries = state.allContactEnquiries.map(enquiry =>
        enquiry._id === action.payload._id ? action.payload : enquiry
      );
    },
    removeContactEnquiry: (state, action) => {
      state.allContactEnquiries = state.allContactEnquiries.filter(enquiry => enquiry._id !== action.payload);
    },
    clearContactEnquiryData(state) {
      state.allContactEnquiries = [];
      state.totalPages = 1;
      state.currentPage = 1;
      state.search = '';
      state.statusFilter = 'all';
    },
  },
});

export const { setContactEnquiriesData, updateContactEnquiry, removeContactEnquiry, clearContactEnquiryData } = contactEnquirySlice.actions;
export default contactEnquirySlice.reducer;