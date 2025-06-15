import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ImagePersonEntity {
  id: number;
  imageId: number;
  idOfImage: number;
  name: string;
  faceVertical: number;
  faceHorizontal: number;
  faceDirection: number;
  faceEmotion: string;
  hairLength: number;
  hairStyle: string;
  hairType: number;
  leftArmHorizontal: number;
  leftArmVertical: number;
  rightArmHorizontal: number;
  rightArmVertical: number;
  leftElbow: number;
  rightElbow: number;
  leftLegHorizontal: number;
  leftLegVertical: number;
  leftKnee: number;
  rightLegHorizontal: number;
  rightLegVertical: number;
  rightKnee: number;
  chestVertical: number;
  chestHorizontal: number;
  chestDirection: number;
  oppai: string;
  oppaiSize: number;
  bodySpine: number;
  waistVertical: number;
  waistHorizontal: number;
  waistDirection: number;
  bodyOthers: string;
  sleep: number;
  leftArmWear: number;
  leftArmWearOptions: number;
  rightArmWear: number;
  rightArmWearOptions: number;
  bodyWear: number;
  bodyWearOptions: number;
  leftLegWear: number;
  leftLegWearOptions: number;
  rightLegWear: number;
  rightLegWearOptions: number;
  wears: string;
  personItem: string;
  poses: string;
  others: string;
}

export interface ImageBackgroundEntity {
  id: number;
  imageId: number;
  idOfImage: number;
  name: string;
  place: string;
  items: string;
  landscape: string;
}

export interface ImageInformationEntity {
  id: number;
  imageId: number;
  evaluation: number;
  author: string;
  url: string;
  memo: string;
}

export interface ImageTagEntity {
  id: number;
  imageId: number;
  elementId: number;
  tagId: number;
}

export const generateInitialImagePersonEntity = (merge?: Partial<ImagePersonEntity>): ImagePersonEntity => {
  return {
    id: 0,
    imageId: 0,
    idOfImage: 0,
    name: '人間',
    faceVertical: 0,
    faceHorizontal: 0,
    faceDirection: 0,
    faceEmotion: '',
    hairLength: 0,
    hairStyle: '',
    hairType: 0,
    leftArmHorizontal: 0,
    leftArmVertical: 0,
    rightArmHorizontal: 0,
    rightArmVertical: 0,
    leftElbow: 0,
    rightElbow: 0,
    leftLegHorizontal: 0,
    leftLegVertical: 0,
    leftKnee: 0,
    rightLegHorizontal: 0,
    rightLegVertical: 0,
    rightKnee: 0,
    chestVertical: 0,
    chestHorizontal: 0,
    chestDirection: 0,
    oppai: '',
    oppaiSize: 0,
    bodySpine: 0,
    waistVertical: 0,
    waistHorizontal: 0,
    waistDirection: 0,
    bodyOthers: '',
    sleep: 0,
    leftArmWear: 0,
    leftArmWearOptions: 0,
    rightArmWear: 0,
    rightArmWearOptions: 0,
    bodyWear: 0,
    bodyWearOptions: 0,
    leftLegWear: 0,
    leftLegWearOptions: 0,
    rightLegWear: 0,
    rightLegWearOptions: 0,
    wears: '',
    personItem: '',
    poses: '',
    others: '',
    ...merge,
  };
};

export const generateInitialImageBackgroundEntity = (
  merge?: Partial<ImageBackgroundEntity>,
): ImageBackgroundEntity => {
  return {
    id: 0,
    imageId: 0,
    idOfImage: 0,
    name: '',
    place: '',
    items: '',
    landscape: '',
    ...merge,
  };
};

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

export const generateInitialImageTagEntity = (merge?: Partial<ImageTagEntity>): ImageTagEntity => {
  return {
    id: 0,
    imageId: 0,
    elementId: 0,
    tagId: 0,
    ...merge,
  };
};

export const generateInitialImageEntity = (merge?: Partial<ImageEntity>): ImageEntity => {
  return {
    id: 0,
    fileName: '',
    width: 0,
    height: 0,
    peopleSize: 0,
    backgroundsSize: 0,
    evaluation: 0,
    ...merge,
  };
};

export interface ImageEntity {
  id: number;
  fileName: string;
  width: number;
  height: number;
  peopleSize: number;
  backgroundsSize: number;
  evaluation: number;
}

type ImageElementsLoadStatus = 'notyet' | 'loading' | 'loaded' | 'error';
type ImageElementsSaveStatus = 'unchanged' | 'ready' | 'saving' | 'saved';

interface ImageAppData {
  selectedTabId?: string;
  people: ImagePersonEntity[];
  backgrounds: ImageBackgroundEntity[];
  tags: ImageTagEntity[];
  information?: ImageInformationEntity;
  loadStatus: ImageElementsLoadStatus;
  saveStatus: ImageElementsSaveStatus;
}

export type Image = ImageEntity & ImageAppData;

export interface ImageList {
  items: { [id: number]: Image | undefined };
  current: { image: Image | null; savingImage: Image | null };
}

const initialState: ImageList = {
  items: {},
  current: {
    image: null,
    savingImage: null,
  },
};

export const ImageListSlice = createSlice({
  name: 'imageList',
  initialState,
  reducers: {
    setImages: (state, action: PayloadAction<{ images: ImageEntity[] }>) => {
      state.items = action.payload.images
        .map((entity) => ({
          people: [],
          backgrounds: [],
          tags: [],
          loadStatus: 'notyet',
          saveStatus: 'unchanged',
          ...entity,
        }))
        .reduce((obj, entity) => {
          obj[entity.id] = entity;
          return obj;
        }, {});
    },

    addNewImage: (
      state,
      action: PayloadAction<{ image: ImageEntity; information: ImageInformationEntity }>,
    ) => {
      if (state.items[action.payload.image.id]) return;

      state.items[action.payload.image.id] = {
        people: [],
        backgrounds: [],
        tags: [],
        information: action.payload.information,
        loadStatus: 'loaded',
        saveStatus: 'unchanged',
        ...action.payload.image,
      };
    },

    updateImage: (state, action: PayloadAction<Image>) => {
      state.items[action.payload.id] = action.payload;
    },

    updateCurrentImage: (state, action: PayloadAction<Image>) => {
      state.current.image = action.payload;
    },

    saveCurrentImage: (state) => {
      const {
        current: { image: current },
      } = state;
      if (!current) return;

      if (current.id > 0 && !state.items[current.id]) return;

      state.items[current.id] = current;
      state.current.savingImage = current;
    },

    setImageIds: (
      state,
      action: PayloadAction<{ imageId: number; peopleIds: number[]; backgroundIds: number[] }>,
    ) => {
      const image = state.items[action.payload.imageId];
      if (!image) return;

      for (let i = 0; i < image.people.length; i++) {
        image.people[i].id = action.payload.peopleIds[i] ?? 0;
      }
      for (let i = 0; i < image.backgrounds.length; i++) {
        image.backgrounds[i].id = action.payload.backgroundIds[i] ?? 0;
      }
    },

    startLoadingImageElements: (state, action: PayloadAction<{ imageId: number }>) => {
      const image = state.items[action.payload.imageId];
      if (!image) return;

      image.loadStatus = 'loading';
    },

    errorLoadingImageElements: (state, action: PayloadAction<{ imageId: number }>) => {
      const image = state.items[action.payload.imageId];
      if (!image) return;

      image.loadStatus = 'error';
    },

    startSavingImage: (state, action: PayloadAction<{ imageId: number }>) => {
      const image = state.items[action.payload.imageId];
      if (!image) return;

      image.saveStatus = 'saving';
    },

    finishSavingImage: (state, action: PayloadAction<{ imageId: number }>) => {
      const image = state.items[action.payload.imageId];
      if (!image) return;

      image.saveStatus = 'saved';
      state.current.savingImage = null;
    },

    setImageElements: (
      state,
      action: PayloadAction<{
        imageId: number;
        people: ImagePersonEntity[];
        backgrounds: ImageBackgroundEntity[];
        information: ImageInformationEntity;
      }>,
    ) => {
      const image = state.items[action.payload.imageId];
      if (!image) return;

      image.people = action.payload.people;
      image.backgrounds = action.payload.backgrounds;
      image.information = action.payload.information;
      image.loadStatus = 'loaded';
    },

    deleteImage: (state, action: PayloadAction<{ imageId: number }>) => {
      const image = state.items[action.payload.imageId];
      if (!image) return;

      state.items[action.payload.imageId] = undefined;
    },
  },
  selectors: {
    getFilteredImages: createSelector(
      [
        (state: ImageList) => state.items,
        (_: ImageList, filteredImageIds: number[] | null) => filteredImageIds,
      ],
      (items, filteredImageIds) => {
        if (filteredImageIds) {
          return filteredImageIds.reduce((obj, imageId) => {
            const img = items[imageId];
            if (img) {
              obj.push(img);
            }
            return obj;
          }, [] as Image[]);
        } else {
          return Object.values(items).filter((img) => img);
        }
      },
    ),
  },
});
export default ImageListSlice.reducer;
export const {
  setImages,
  addNewImage,
  updateImage,
  updateCurrentImage,
  saveCurrentImage,
  setImageIds,
  startLoadingImageElements,
  setImageElements,
  errorLoadingImageElements,
  startSavingImage,
  finishSavingImage,
  deleteImage,
} = ImageListSlice.actions;
export const { getFilteredImages } = ImageListSlice.selectors;
