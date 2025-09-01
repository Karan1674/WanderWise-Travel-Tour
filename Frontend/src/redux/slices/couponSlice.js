import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    allCoupons: [],
    totalPages: 1,
    currentPage: 1,
    search: '',
    statusFilter: 'all',
};


const couponSlice = createSlice({
    name: 'coupons',
    initialState,
    reducers: {
        setCouponsData: (state, action) => {
            const { allCoupons, totalPages, currentPage, search, statusFilter } = action.payload;
            state.allCoupons = allCoupons || [];
            state.totalPages = totalPages || 1;
            state.currentPage = currentPage || 1;
            state.search = search || '';
            state.statusFilter = statusFilter || 'all';
        },
        removeCoupon: (state, action) => {
            const couponId = action.payload;
            state.allCoupons = state.allCoupons.filter((coupon) => coupon._id !== couponId);

        },
        clearCouponsData(state) {
            state.allCoupons = [];
            state.totalPages = 1;
            state.currentPage = 1;
            state.search = '';
            state.statusFilter = 'all';
        },
    },
});

export const { setCouponsData, removeCoupon, clearCouponsData } = couponSlice.actions;
export default couponSlice.reducer;