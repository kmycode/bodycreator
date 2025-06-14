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
  tabHistories: WindowTab[];
}

const initialState: WindowTabGroup = {
  activeId: 1,
  tabs: [{ id: 1, type: 'image-list', data: { filteredImageIds: null }, title: '一覧' }],
  tabHistories: [],
};

const removeTabById = (state: WindowTabGroup, id: number): void => {
  const oldIndex = state.tabs.findIndex((t) => t.id === id);
  if (oldIndex < 0) return;

  state.tabHistories.push(state.tabs[oldIndex]);

  if (state.tabs.length > 1) {
    const newTabs = state.tabs.filter((t) => t.id !== id);
    if (state.activeId === id) {
      const newIndex = Math.min(newTabs.length - 1, oldIndex);
      state.activeId = newTabs[newIndex].id;
    }
    state.tabs = newTabs;
  } else {
    state.tabs = [
      {
        id: 1,
        type: 'image-list',
        data: { filteredImageIds: null },
        title: '一覧',
      },
    ];
    state.activeId = 1;
  }
};

const addImagePreviewTab = (state: WindowTabGroup, imageId: number): void => {
  const exists = state.tabs.find((t) => t.type === 'image-preview' && t.data.imageId === imageId);
  if (exists) {
    state.activeId = exists.id;
  } else {
    const maxId = state.tabs
      .map((t) => t.id)
      .sort()
      .at(-1);
    const newId = maxId ? maxId + 1 : 1;
    state.tabs.push({ id: newId, type: 'image-preview', data: { imageId }, title: `画像 ${imageId}` });
    state.activeId = newId;
  }
};

export const WindowTabGroupSlice = createSlice({
  name: 'windowTabGroup',
  initialState,
  reducers: {
    switchTab: (state, action: PayloadAction<{ id: number }>) => {
      state.activeId = action.payload.id;
    },

    removeTab: (state, action: PayloadAction<{ id: number }>) => {
      removeTabById(state, action.payload.id);
    },

    removeCurrentTab: (state) => {
      if (state.activeId) {
        removeTabById(state, state.activeId);
      }
    },

    reviveLatestTab: (state) => {
      const latest = state.tabHistories.pop();
      if (!latest) return;

      if (latest.type === 'image-preview') {
        addImagePreviewTab(state, latest.data.imageId);
        return;
      }

      const maxId =
        state.tabs
          .map((t) => t.id)
          .sort()
          .at(-1) ?? 0;
      const newId = maxId + 1;
      state.tabs.push({ ...latest, id: newId });
      state.activeId = newId;
    },

    openImagePreviewTab: (state, action: PayloadAction<{ imageId: number }>) => {
      addImagePreviewTab(state, action.payload.imageId);
    },
  },
});
export default WindowTabGroupSlice.reducer;
export const { switchTab, openImagePreviewTab, removeTab, removeCurrentTab, reviveLatestTab } =
  WindowTabGroupSlice.actions;
