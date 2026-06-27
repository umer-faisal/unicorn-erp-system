import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  usersList: [],
  submissions: [],
  isFetchingSubmissions: false,
  selectedDbForm: null,
  activeTab: 'database'
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setUsersList: (state, action) => {
      state.usersList = action.payload;
    },
    setSubmissions: (state, action) => {
      state.submissions = action.payload;
    },
    setIsFetchingSubmissions: (state, action) => {
      state.isFetchingSubmissions = action.payload;
    },
    setSelectedDbForm: (state, action) => {
      state.selectedDbForm = action.payload;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    }
  },
});

export const { 
  setUsersList, 
  setSubmissions, 
  setIsFetchingSubmissions, 
  setSelectedDbForm,
  setActiveTab
} = adminSlice.actions;

export default adminSlice.reducer;
