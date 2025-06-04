import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TagEntity {
  id: number;
  name: string;
  imagesCount: number;
}

export const generateInitialTagEntity = (): TagEntity => {
  return {
    id: 0,
    name: '',
    imagesCount: 0,
  };
};

export interface TagList {
  items: { [id: number]: TagEntity[] };
  idOfNames: { [name: string]: number };
}

const initialState: TagList = {
  items: {},
  idOfNames: {},
};

export const TagListSlice = createSlice({
  name: 'tagList',
  initialState,
  reducers: {
    setTags: (state, action: PayloadAction<{ tags: TagEntity[] }>) => {
      state.items = action.payload.tags.reduce((obj, tag) => {
        obj[tag.id] = tag;
        return obj;
      }, {});

      state.idOfNames = action.payload.tags.reduce((obj, tag) => {
        obj[tag.name] = tag.id;
        return obj;
      }, {});
    },
  },
});
export default TagListSlice.reducer;
export const { setTags } = TagListSlice.actions;
