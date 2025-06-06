import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import SampleImage1 from '@renderer/assets/samples/images/sample1.png';
import SampleImage2 from '@renderer/assets/samples/images/sample2.png';
import SampleImage3 from '@renderer/assets/samples/images/sample3.png';

interface ImagePreviewTabData {
  fileName: string;
}

export interface WindowTab {
  id: number;
  title: string;
  type: 'image-preview';
  data: ImagePreviewTabData;
}

export interface WindowTabGroup {
  activeId?: number;
  tabs: WindowTab[];
}

const initialState: WindowTabGroup = {
  activeId: 2,
  tabs: [
    { id: 2, type: 'image-preview', data: { fileName: SampleImage1 }, title: '画像1' },
    { id: 3, type: 'image-preview', data: { fileName: SampleImage2 }, title: '画像2' },
    { id: 4, type: 'image-preview', data: { fileName: SampleImage3 }, title: '画像3' },
  ],
};

export const WindowTabGroupSlice = createSlice({
  name: 'windowTabGroup',
  initialState,
  reducers: {
    switchTab: (state, action: PayloadAction<{ id: number }>) => {
      state.activeId = action.payload.id;
    },
  },
});
export default WindowTabGroupSlice.reducer;
export const { switchTab } = WindowTabGroupSlice.actions;
