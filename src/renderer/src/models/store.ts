import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import WindowTabGroup from './entities/window_tab_group';
import ModalState from './entities/modal_state';
import ImagePreviewMatrix from './entities/image_preview_matrix';
import ImageList from './entities/image_list';

export const store = configureStore({
  reducer: {
    modalState: ModalState,
    windowTabGroup: WindowTabGroup,
    imagePreviewMatrixes: ImagePreviewMatrix,
    imageList: ImageList,
  },
});

export const useAppDispatch: () => typeof store.dispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<ReturnType<typeof store.getState>> = useSelector;
