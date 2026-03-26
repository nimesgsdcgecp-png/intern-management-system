import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface LoadingState {
  globalLoading: boolean;
  operations: Record<string, string>; // key -> message
}

const initialState: LoadingState = {
  globalLoading: false,
  operations: {},
};

/**
 * Tracks loading states across the application, supporting both a global indicator and named operations.
 */
const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
    startOperation: (state, action: PayloadAction<{ key: string; message?: string; canCancel?: boolean }>) => {
      state.operations[action.payload.key] = action.payload.message || 'Loading...';
      state.globalLoading = true;
    },
    stopOperation: (state, action: PayloadAction<string>) => {
      delete state.operations[action.payload];
      state.globalLoading = Object.keys(state.operations).length > 0;
    },
    clearAllOperations: (state) => {
      state.operations = {};
      state.globalLoading = false;
    },
  },
});

export const {
  setGlobalLoading,
  startOperation,
  stopOperation,
  clearAllOperations,
} = loadingSlice.actions;

export default loadingSlice.reducer;