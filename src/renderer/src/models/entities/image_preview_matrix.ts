import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ImagePreviewMatrixForSpring {
  imageId: number;
  scale: number | undefined;
  x: number | undefined;
  y: number | undefined;
}

export interface ImagePreviewMatrixForExtra {
  imageId: number;
  rotate: number;
  reverseHorizontal: boolean;
  reverseVertical: boolean;
}

export interface ImagePreviewMatrix extends ImagePreviewMatrixForSpring, ImagePreviewMatrixForExtra {}

export interface ImagePreviewMatrixes {
  matrixes: { [imageId: number]: ImagePreviewMatrix | undefined };
}

const initialState: ImagePreviewMatrixes = {
  matrixes: {},
};

const generateInitialImagePreviewMatrix = (merge?: Partial<ImagePreviewMatrix>): ImagePreviewMatrix => {
  return {
    imageId: 0,
    x: undefined,
    y: undefined,
    scale: undefined,
    reverseHorizontal: false,
    reverseVertical: false,
    rotate: 0,
    ...merge,
  };
};

export const ImagePreviewMatrixSlice = createSlice({
  name: 'imagePreviewMatrixes',
  initialState,
  reducers: {
    updateMatrix: (state, action: PayloadAction<ImagePreviewMatrix>) => {
      const exists = state.matrixes[action.payload.imageId];
      if (exists) {
        const obj = action.payload;
        exists.reverseHorizontal = obj.reverseHorizontal;
        exists.reverseVertical = obj.reverseVertical;
        exists.rotate = obj.rotate;
        exists.scale = obj.scale;
        exists.x = obj.x;
        exists.y = obj.y;
      } else {
        state.matrixes[action.payload.imageId] = action.payload;
      }
    },
    updateMatrixForSpring: (state, action: PayloadAction<ImagePreviewMatrixForSpring>) => {
      const exists = state.matrixes[action.payload.imageId];
      if (exists) {
        const obj = action.payload;
        exists.scale = obj.scale;
        exists.x = obj.x;
        exists.y = obj.y;
      } else {
        state.matrixes[action.payload.imageId] = {
          ...generateInitialImagePreviewMatrix(),
          ...action.payload,
        };
      }
    },
    updateMatrixForExtra: (state, action: PayloadAction<ImagePreviewMatrixForExtra>) => {
      const exists = state.matrixes[action.payload.imageId];
      if (exists) {
        const obj = action.payload;
        exists.reverseHorizontal = obj.reverseHorizontal;
        exists.reverseVertical = obj.reverseVertical;
        exists.rotate = obj.rotate;
      } else {
        state.matrixes[action.payload.imageId] = {
          ...generateInitialImagePreviewMatrix(),
          ...action.payload,
        };
      }
    },
  },
  selectors: {
    getSpringMatrix: createSelector(
      [
        (_, imageId: number) => imageId,
        (state: ImagePreviewMatrixes, imageId: number) => state.matrixes[imageId]?.x,
        (state: ImagePreviewMatrixes, imageId: number) => state.matrixes[imageId]?.y,
        (state: ImagePreviewMatrixes, imageId: number) => state.matrixes[imageId]?.scale,
      ],
      (imageId, x, y, scale): ImagePreviewMatrixForSpring => {
        return { imageId, x, y, scale };
      },
    ),
    getExtraMatrix: createSelector(
      [
        (_, imageId: number) => imageId,
        (state: ImagePreviewMatrixes, imageId: number) => state.matrixes[imageId]?.rotate,
        (state: ImagePreviewMatrixes, imageId: number) => state.matrixes[imageId]?.reverseHorizontal,
        (state: ImagePreviewMatrixes, imageId: number) => state.matrixes[imageId]?.reverseVertical,
      ],
      (imageId, rotate, reverseHorizontal, reverseVertical): ImagePreviewMatrixForExtra => {
        if (rotate === undefined || reverseHorizontal === undefined || reverseVertical === undefined) {
          return generateInitialImagePreviewMatrix({ imageId });
        }
        return { imageId, rotate, reverseHorizontal, reverseVertical };
      },
    ),
  },
});
export default ImagePreviewMatrixSlice.reducer;
export const { updateMatrix, updateMatrixForExtra, updateMatrixForSpring } = ImagePreviewMatrixSlice.actions;
export const { getSpringMatrix, getExtraMatrix } = ImagePreviewMatrixSlice.selectors;
