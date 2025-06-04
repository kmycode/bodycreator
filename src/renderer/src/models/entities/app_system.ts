import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type LoadStatus = 'notyet' | 'loading' | 'loaded' | 'error';

export interface AppSystem {
  initialLoadStatus: LoadStatus;
}

const initialState: AppSystem = {
  initialLoadStatus: 'notyet',
};

export const AppSystemSlice = createSlice({
  name: 'appSystem',
  initialState,
  reducers: {
    setInitialLoadStatus: (state, action: PayloadAction<{ status: LoadStatus }>) => {
      state.initialLoadStatus = action.payload.status;
    },
  },
});
export default AppSystemSlice.reducer;
export const { setInitialLoadStatus } = AppSystemSlice.actions;
