import { useAppDispatch, useAppSelector } from '@renderer/models/store';
import { ReactNode, useCallback } from 'react';
import { ConfirmModal } from '../modals/ConfirmModal';
import { closeModal } from '@renderer/models/entities/modal_state';
import classNames from 'classnames';

export const ModalRoot: React.FC<object> = () => {
  const modalState = useAppSelector((state) => state.modalState);
  const dispatch = useAppDispatch();

  const handleClose = useCallback(() => dispatch(closeModal({ type: 'any' })), [dispatch]);

  let children: ReactNode | undefined;

  switch (modalState.type) {
    case 'confirm':
      if (modalState.parameter) {
        children = <ConfirmModal parameters={modalState.parameter} />;
      }
      break;
  }

  return (
    <div id="modal-root" className={classNames({ hidden: !children })}>
      {children && (
        <>
          <div id="modal-root__film"></div>
          <div id="modal-root__contents">{children}</div>
          {!modalState.parameter?.hideCloseButton && (
            <div id="modal-root__close">
              <button onClick={handleClose}>閉じる</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
