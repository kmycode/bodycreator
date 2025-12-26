import { closeModal } from '@renderer/models/entities/modal_state';
import { useAppDispatch } from '@renderer/models/store';
import { useCallback } from 'react';

export interface ConfirmModalParameter {
  message: string;
  yesButtonLabel?: string;
  noButtonLabel?: string;
  yesResult?: unknown;
}

interface ConfirmModalResultYes {
  selection: 'yes';
  yesResult?: unknown;
}

interface ConfirmModalResultNo {
  selection: 'no';
}

export type ConfirmModalResult = ConfirmModalResultYes | ConfirmModalResultNo;

export const ConfirmModal: React.FC<{
  parameters: ConfirmModalParameter;
}> = ({ parameters }) => {
  const dispatch = useAppDispatch();

  const handleYesClick = useCallback(
    () =>
      dispatch(
        closeModal({ type: 'confirm', result: { selection: 'yes', yesResult: parameters.yesResult } }),
      ),
    [parameters, dispatch],
  );
  const handleNoClick = useCallback(
    () => dispatch(closeModal({ type: 'confirm', result: { selection: 'no' } })),
    [dispatch],
  );

  return (
    <div className="modal__confirm">
      <div className="modal__confirm__message">{parameters.message}</div>
      <div className="modal__confirm__buttons">
        <button className="primary" onClick={handleYesClick}>
          {parameters.yesButtonLabel ?? 'はい'}
        </button>
        <button onClick={handleNoClick}>{parameters.noButtonLabel ?? 'いいえ'}</button>
      </div>
    </div>
  );
};
