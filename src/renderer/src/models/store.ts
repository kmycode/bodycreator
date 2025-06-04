import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import WindowTabGroup from './entities/window_tab_group';
import ModalState from './entities/modal_state';
import ImagePreviewMatrix from './entities/image_preview_matrix';
import ImageList from './entities/image_list';
import AppSystem from './entities/app_system';
import SystemSetting from './entities/system_setting';
import TagList from './entities/tag_list';

export const store = configureStore({
  reducer: {
    system: AppSystem,
    modalState: ModalState,
    windowTabGroup: WindowTabGroup,
    imagePreviewMatrixes: ImagePreviewMatrix,
    imageList: ImageList,
    systemSetting: SystemSetting,
    tagList: TagList,
  },
});

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<ReturnType<typeof store.getState>> = useSelector;
