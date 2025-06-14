import { useAppDispatch } from '@renderer/models/store';
import { createImageByBuffer } from '@renderer/models/utils/imageserializer';
import classNames from 'classnames';
import { useCallback, useEffect, useState } from 'react';

export const FileDropReceiver: React.FC<unknown> = () => {
  const [onDragging, setOnDragging] = useState(false);

  const dispatch = useAppDispatch();

  useEffect(() => {
    const onDrag = (ev: DragEvent): boolean => {
      ev.preventDefault();
      ev.stopPropagation();
      setOnDragging(true);
      return false;
    };

    document.addEventListener('dragenter', onDrag);
    document.addEventListener('dragover', onDrag);

    return () => {
      document.removeEventListener('dragenter', onDrag);
      document.removeEventListener('dragover', onDrag);
    };
  }, [setOnDragging]);

  const onDragLeave = useCallback(() => setOnDragging(false), [setOnDragging]);

  const onDrop = useCallback(
    async (ev: React.DragEvent<HTMLDivElement>) => {
      ev.preventDefault();
      setOnDragging(false);

      const file = ev.dataTransfer.files[0];
      const ext = file.name.split('.').at(-1);
      if (!ext) return;

      const buffer = await file.arrayBuffer();

      await createImageByBuffer(dispatch, ext, buffer);

      ev.dataTransfer.clearData();

      return false;
    },
    [setOnDragging, dispatch],
  );

  return (
    <div
      id="file-drop-receiver"
      className={classNames({ show: onDragging })}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
      onDragEnd={onDragLeave}
    >
      <div className="message">ここにファイルをドロップしてください</div>
    </div>
  );
};
