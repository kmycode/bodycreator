import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ConfirmModalParameter, ConfirmModalResult } from '@renderer/components/modals/ConfirmModal';

interface ModalCommonParameters {
  hideCloseButton?: boolean;
  id: string;
}

export type ModalType = 'none' | 'confirm';
export type ModalParameterType = ConfirmModalParameter & ModalCommonParameters;
export type ModalResultType = ConfirmModalResult;

export interface ModalState {
  type: ModalType;
  parameter?: ModalParameterType;
  currentId?: string;
  lastResult?: ModalResultType;
  lastResultId?: string;
}

const initialState: ModalState = {
  type: 'none',
};

export const ModalStateSlice = createSlice({
  name: 'modalState',
  initialState,
  reducers: {
    openModal: (
      state,
      action: PayloadAction<{ type: 'confirm'; parameter: ConfirmModalParameter & ModalCommonParameters }>,
    ) => {
      state.type = action.payload.type;
      state.parameter = action.payload.parameter;
      state.currentId = action.payload.parameter.id;
    },

    closeModal: (
      state,
      action: PayloadAction<{ type: 'any' } | { type: 'confirm'; result: ConfirmModalResult }>,
    ) => {
      state.type = 'none';
      state.lastResultId = state.currentId;
      if (action.payload.type === 'confirm') {
        state.lastResult = action.payload.result;
      }
    },

    clearModalResult: (state) => {
      state.lastResult = undefined;
    },
  },
});
export default ModalStateSlice.reducer;
export const { openModal, closeModal, clearModalResult } = ModalStateSlice.actions;
