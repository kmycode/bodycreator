import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TagEntity {
  id: number;
  name: string;
  category: string;
  usage: number;
}

export const generateInitialTagEntity = (): TagEntity => {
  return {
    id: 0,
    name: '',
    category: '',
    usage: 0,
  };
};

type TagListItemsType = { [category: string]: TagEntity[] };

export interface TagList {
  items: TagListItemsType;
  itemsById: { [id: number]: TagEntity };
}

const initialState: TagList = {
  items: {},
  itemsById: {},
};

export const TagListSlice = createSlice({
  name: 'tagList',
  initialState,
  reducers: {
    setTags: (state, action: PayloadAction<{ tags: TagEntity[] }>) => {
      const items: TagListItemsType = {};
      for (const tag of action.payload.tags) {
        (items[tag.category] ??= []).push(tag);
        state.itemsById[tag.id] = tag;
      }
      state.items = items;
    },

    updateTags: (state, action: PayloadAction<{ tags: TagEntity[] }>) => {
      for (const tag of action.payload.tags) {
        const existTags = (state.items[tag.category] ??= []);
        const existIndex = existTags.findIndex((et) => et.id === tag.id);

        if (tag.usage > 0) {
          if (existIndex < 0) {
            existTags.push(tag);
          } else {
            existTags[existIndex] = tag;
          }
          state.itemsById[tag.id] = tag;
        } else {
          if (existIndex >= 0) {
            existTags.splice(existIndex, 1);
          }
          delete state.itemsById[tag.id];
        }
      }
    },
  },
});
export default TagListSlice.reducer;
export const { setTags, updateTags } = TagListSlice.actions;
