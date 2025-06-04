import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ImagePreviewMatrix {
  imageId: number;
  scale: number;
  x: number;
  y: number;
}

export interface ImagePreviewMatrixes {
  matrixes: ImagePreviewMatrix[];
}

const initialState: ImagePreviewMatrixes = {
  matrixes: [],
};

export const ImagePreviewMatrixSlice = createSlice({
  name: 'imagePreviewMatrixes',
  initialState,
  reducers: {
    updateMatrix: (state, action: PayloadAction<ImagePreviewMatrix>) => {
      const exists = state.matrixes.find((m) => m.imageId === action.payload.imageId);
      if (exists) {
        exists.scale = action.payload.scale;
        exists.x = action.payload.x;
        exists.y = action.payload.y;
      } else {
        state.matrixes.push(action.payload);
      }
    },
  },
});
export default ImagePreviewMatrixSlice.reducer;
export const { updateMatrix } = ImagePreviewMatrixSlice.actions;
