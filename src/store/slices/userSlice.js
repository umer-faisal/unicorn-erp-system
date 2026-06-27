import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeTab: 'dashboard',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setActiveUserTab: (state, action) => {
      state.activeTab = action.payload;
    },
  },
});

export const { setActiveUserTab } = userSlice.actions;

export default userSlice.reducer;
