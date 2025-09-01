import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  allBookings: [],
  totalPages: 1,
  currentPage: 1,
  search: '',
  statusFilter: 'all',
};

const packageBookingSlice = createSlice({
  name: 'packageBookings',
  initialState,
  reducers: {
    setBookingsData(state, action) {
      state.allBookings = action.payload.allBookings || [];
      state.totalPages = action.payload.totalPages || 1;
      state.currentPage = action.payload.currentPage || 1;
      state.search = action.payload.search || '';
      state.statusFilter = action.payload.statusFilter || 'all';
    },
    removeBooking(state, action) {
      state.allBookings = state.allBookings.filter(
        (booking) => booking._id !== action.payload
      );

    },
    clearBookingsData(state) {
      state.allBookings = [];
      state.totalPages = 1;
      state.currentPage = 1;
      state.search = '';
      state.statusFilter = 'all';
    },
  },
});

export const { setBookingsData, removeBooking, clearBookingsData } = packageBookingSlice.actions;
export default packageBookingSlice.reducer;