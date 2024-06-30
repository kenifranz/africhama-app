import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  subscription: null,
  maintenanceStatus: null,
  isLoading: false,
  error: null
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    fetchSubscriptionStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchSubscriptionSuccess: (state, action) => {
      state.isLoading = false;
      state.subscription = action.payload.subscription;
      state.maintenanceStatus = action.payload.maintenanceStatus;
      state.error = null;
    },
    fetchSubscriptionFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    subscribeStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    subscribeSuccess: (state, action) => {
      state.isLoading = false;
      state.subscription = action.payload;
      state.error = null;
    },
    subscribeFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    payMaintenanceStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    payMaintenanceSuccess: (state, action) => {
      state.isLoading = false;
      state.maintenanceStatus = action.payload;
      state.error = null;
    },
    payMaintenanceFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const { 
  fetchSubscriptionStart, 
  fetchSubscriptionSuccess, 
  fetchSubscriptionFailure,
  subscribeStart,
  subscribeSuccess,
  subscribeFailure,
  payMaintenanceStart,
  payMaintenanceSuccess,
  payMaintenanceFailure,
  clearError
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;

// Selectors
export const selectSubscription = (state) => state.subscription.subscription;
export const selectMaintenanceStatus = (state) => state.subscription.maintenanceStatus;
export const selectIsLoading = (state) => state.subscription.isLoading;
export const selectError = (state) => state.subscription.error;