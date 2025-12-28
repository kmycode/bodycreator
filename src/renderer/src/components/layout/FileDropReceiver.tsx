import { useAppDispatch } from '@renderer/models/store';
import { createImageByBuffer } from '@renderer/models/utils/image_serializer';
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

      for (const file of ev.dataTransfer.files) {
        const ext = file.name.split('.').at(-1);
        if (!ext) continue;

        const buffer = await file.arrayBuffer();

        await createImageByBuffer(dispatch, ext, buffer, { memo: file.name });
      }

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
