import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ImagePreviewTabData {
  imageId: number;
}

interface ImageListTabData {
  filteredImageIds: number[] | null;
}

export interface WindowTabBase {
  id: number;
  title: string;
}

export type WindowTab = WindowTabBase &
  (
    | {
        type: 'image-preview';
        data: ImagePreviewTabData;
      }
    | {
        type: 'image-list';
        data: ImageListTabData;
      }
  );

export interface WindowTabGroup {
  activeId?: number;
  tabs: WindowTab[];
}

const initialState: WindowTabGroup = {
  activeId: 1,
  tabs: [
    { id: 1, type: 'image-list', data: { filteredImageIds: null }, title: '一覧' },
    { id: 2, type: 'image-preview', data: { imageId: 1 }, title: '画像 1' },
    { id: 3, type: 'image-preview', data: { imageId: 2 }, title: '画像 2' },
  ],
};

export const WindowTabGroupSlice = createSlice({
  name: 'windowTabGroup',
  initialState,
  reducers: {
    switchTab: (state, action: PayloadAction<{ id: number }>) => {
      state.activeId = action.payload.id;
    },

    openImagePreviewTab: (state, action: PayloadAction<{ imageId: number }>) => {
      const exists = state.tabs.find(
        (t) => t.type === 'image-preview' && t.data.imageId === action.payload.imageId,
      );
      if (exists) {
        state.activeId = exists.id;
      } else {
        const imageId = action.payload.imageId;
        const maxId = state.tabs
          .map((t) => t.id)
          .sort()
          .at(-1);
        const newId = maxId ? maxId + 1 : 1;
        state.tabs.push({ id: newId, type: 'image-preview', data: { imageId }, title: `画像 ${imageId}` });
        state.activeId = newId;
      }
    },
  },
});
export default WindowTabGroupSlice.reducer;
export const { switchTab, openImagePreviewTab } = WindowTabGroupSlice.actions;
