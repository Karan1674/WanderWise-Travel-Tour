import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  allAgents: [],
  totalPages: 1,
  currentPage: 1,
  search: '',
  statusFilter: 'all',
};

const agentSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {
    setAgentsData(state, action) {
      state.allAgents = action.payload.allAgents || [];
      state.totalPages = action.payload.totalPages || 1;
      state.currentPage = action.payload.currentPage || 1;
      state.search = action.payload.search || '';
      state.statusFilter = action.payload.statusFilter || 'all';
    },
    clearAgentsData(state) {
      state.allAgents = [];
    },
  },
});

export const { setAgentsData, clearAgentsData } = agentSlice.actions;
export default agentSlice.reducer;
