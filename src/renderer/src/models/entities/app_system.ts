import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type LoadStatus = 'notyet' | 'loading' | 'loaded' | 'error';

export interface AppSystem {
  initialLoadStatus: LoadStatus;
  currentDirectory: string;
}

const initialState: AppSystem = {
  initialLoadStatus: 'notyet',
  currentDirectory: '',
};

export const AppSystemSlice = createSlice({
  name: 'appSystem',
  initialState,
  reducers: {
    setInitialLoadStatus: (state, action: PayloadAction<{ status: LoadStatus }>) => {
      state.initialLoadStatus = action.payload.status;
    },

    setCurrentDirectory: (state, action: PayloadAction<{ path: string }>) => {
      state.currentDirectory = action.payload.path;
    },
  },
});
export default AppSystemSlice.reducer;
export const { setInitialLoadStatus, setCurrentDirectory } = AppSystemSlice.actions;
