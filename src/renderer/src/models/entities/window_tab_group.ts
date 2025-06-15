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

const removeTabById = (state: WindowTabGroup, id: number, withoutHistory?: boolean): void => {
  const oldIndex = state.tabs.findIndex((t) => t.id === id);
  if (oldIndex < 0) return;

  if (!withoutHistory) {
    state.tabHistories.push(state.tabs[oldIndex]);
  }

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

const getNewId = (state: WindowTabGroup): number => {
  const maxId = state.tabs
    .map((t) => t.id)
    .sort()
    .at(-1);
  return maxId ? maxId + 1 : 1;
};

const addImagePreviewTab = (state: WindowTabGroup, imageId: number): void => {
  const exists = state.tabs.find((t) => t.type === 'image-preview' && t.data.imageId === imageId);
  if (exists) {
    state.activeId = exists.id;
  } else {
    const newId = getNewId(state);
    state.tabs.push({ id: newId, type: 'image-preview', data: { imageId }, title: `画像 ${imageId}` });
    state.activeId = newId;
  }
};

const addImageListTab = (state: WindowTabGroup): void => {
  const newId = getNewId(state);
  state.tabs.push({ id: newId, type: 'image-list', data: { filteredImageIds: null }, title: '一覧' });
  state.activeId = newId;
};

export const WindowTabGroupSlice = createSlice({
  name: 'windowTabGroup',
  initialState,
  reducers: {
    switchTab: (state, action: PayloadAction<{ id: number }>) => {
      state.activeId = action.payload.id;
    },

    moveTab: (state, action: PayloadAction<{ id: number; nextId?: number; overId?: number }>) => {
      const tab = state.tabs.find((t) => t.id === action.payload.id);
      if (!tab) return;

      const tabs = state.tabs.filter((t) => t.id !== action.payload.id);

      if (action.payload.nextId) {
        if (action.payload.nextId !== -1) {
          const index = tabs.findIndex((t) => t.id === action.payload.nextId);
          if (index < 0) return;
          tabs.splice(index, 0, tab);
        } else {
          tabs.push(tab);
        }
      } else if (action.payload.overId) {
        const overOldIndex = state.tabs.findIndex((t) => t.id === action.payload.overId);
        tabs.splice(overOldIndex, 0, tab);
      }

      state.tabs = tabs;
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

      const newId = getNewId(state);
      state.tabs.push({ ...latest, id: newId });
      state.activeId = newId;
    },

    openImagePreviewTab: (state, action: PayloadAction<{ imageId: number }>) => {
      addImagePreviewTab(state, action.payload.imageId);
    },

    openImageListTab: (state) => {
      addImageListTab(state);
    },

    deleteImageTabs: (state, action: PayloadAction<{ imageId: number }>) => {
      const removeTabIds = state.tabs
        .filter((t) => t.type === 'image-preview' && t.data.imageId === action.payload.imageId)
        .map((t) => t.id);
      for (const id of removeTabIds) {
        removeTabById(state, id, true);
      }
    },
  },
});
export default WindowTabGroupSlice.reducer;
export const {
  switchTab,
  moveTab,
  openImagePreviewTab,
  removeTab,
  removeCurrentTab,
  reviveLatestTab,
  openImageListTab,
  deleteImageTabs,
} = WindowTabGroupSlice.actions;
