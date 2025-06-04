import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WindowTab {
  id: number;
  title: string;
}

export interface WindowTabGroup {
  activeId?: number;
  tabs: WindowTab[];
}

const initialState: WindowTabGroup = {
  activeId: 1,
  tabs: [
    { id: 1, title: 'test' },
    { id: 2, title: 'test' },
  ],
};

export const WindowTabGroupSlice = createSlice({
  name: 'windowTabGroup',
  initialState,
  reducers: {
    addWindowTab: (
      state,
      action: PayloadAction<{ id: number, title: string }>
    ) => {
      state.tabs.push({
        id: action.payload.id,
        title: action.payload.title,
      });
    },
  },
});
export default WindowTabGroupSlice.reducer;
export const { addWindowTab } = WindowTabGroupSlice.actions;