import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import WindowTabGroup from './entities/window_tab_group';
import ModalState from './entities/modal_state';

export const store = configureStore({
  reducer: {
    modalState: ModalState,
    windowTabGroup: WindowTabGroup,
  },
});

export const useAppDispatch: () => typeof store.dispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<ReturnType<typeof store.getState>> = useSelector;
