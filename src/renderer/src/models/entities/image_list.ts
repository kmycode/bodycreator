import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import SampleImage1 from '@renderer/assets/samples/images/sample1.png';
import SampleImage2 from '@renderer/assets/samples/images/sample2.png';
import SampleImage3 from '@renderer/assets/samples/images/sample3.png';

export interface ImagePersonEntity {
  id: number;
  imageId: number;
  idOfImage: number;
  name: string;
  faceHorizontal: string;
}

export interface ImageInformationEntity {
  id: number;
  imageId: number;
  evaluation: number;
  author: string;
  url: string;
  memo: string;
}

export const generateInitialImageInformationEntity = (
  merge?: Partial<ImageInformationEntity>,
): ImageInformationEntity => {
  return {
    id: 0,
    imageId: 0,
    evaluation: 0,
    author: '',
    url: '',
    memo: '',
    ...merge,
  };
};

export interface Image {
  id: number;
  fileName: string;
  width: number;
  height: number;
  selectedTabId?: string;
  people: ImagePersonEntity[];
  information: ImageInformationEntity;
}

export interface ImageList {
  items: Image[];
  current: { image: Image | undefined };
}

const initialState: ImageList = {
  items: [
    {
      id: 1,
      fileName: SampleImage1,
      width: 2480,
      height: 3508,
      people: [],
      information: generateInitialImageInformationEntity({ imageId: 1 }),
    },
    {
      id: 2,
      fileName: SampleImage2,
      width: 2480,
      height: 3508,
      people: [],
      information: generateInitialImageInformationEntity({ imageId: 2 }),
    },
    {
      id: 3,
      fileName: SampleImage3,
      width: 2480,
      height: 3508,
      people: [],
      information: generateInitialImageInformationEntity({ imageId: 3 }),
    },
  ],
  current: {
    image: undefined,
  },
};

const cloneObject = (from: object, to?: object): object => {
  to ??= {};

  for (const key of Object.keys(from)) {
    if (typeof from[key] === 'object') {
      to[key] = cloneObject(from[key]);
    } else {
      to[key] = from[key];
    }
  }

  return to;
};

export const ImageListSlice = createSlice({
  name: 'imageList',
  initialState,
  reducers: {
    updateImage: (state, action: PayloadAction<Image>) => {
      const exists = state.items.find((m) => m.id === action.payload.id);
      if (exists) {
        cloneObject(action.payload, exists);
      } else {
        state.items.push(action.payload);
      }
    },

    updateCurrentImage: (state, action: PayloadAction<Image>) => {
      state.current.image = action.payload;
    },

    saveCurrentImage: (state) => {
      const {
        current: { image: current },
      } = state;
      if (!current) return;

      const existsIndex = state.items.findIndex((m) => m.id === current.id);
      if (existsIndex >= 0) {
        state.items[existsIndex] = current;
      }
    },
  },
});
export default ImageListSlice.reducer;
export const { updateImage, updateCurrentImage, saveCurrentImage } = ImageListSlice.actions;
