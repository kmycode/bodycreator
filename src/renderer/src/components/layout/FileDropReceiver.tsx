import { addNewImage, ImageEntity, ImageInformationEntity } from '@renderer/models/entities/image_list';
import { store, useAppDispatch } from '@renderer/models/store';
import { saveDatabaseEntity } from '@renderer/models/utils/dbutil';
import classNames from 'classnames';
import { useCallback, useEffect, useState } from 'react';
import { imageSize } from 'image-size';

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
      if (!ext || !['png', 'jpg', 'jpeg', 'bmp', 'tiff', 'gif', 'webp'].includes(ext)) return;

      const buffer = await file.arrayBuffer();
      const currentDirectory = store.getState().system.currentDirectory;

      const tmpFileName = `${parseInt(`${Math.random() * 1000000}`)}.${ext}`;
      const tmpPath = `${currentDirectory}/app_repository/tmp/${tmpFileName}`;
      window.file.saveFromBuffer(tmpPath, buffer);

      const size = imageSize(new Uint8Array(buffer));
      if (!size.width || !size.height) return;

      const image: ImageEntity = {
        id: 0,
        fileName: '',
        width: size.width,
        height: size.height,
        peopleSize: 0,
        backgroundsSize: 0,
        evaluation: 0,
      };
      image.id = await saveDatabaseEntity('images', image);
      image.fileName = `${image.id}.${ext}`;
      const filePath = `${currentDirectory}/app_repository/images/${image.fileName}`;
      await window.db.query(`UPDATE images SET fileName='${image.fileName}' WHERE id = ${image.id}`);

      const information: ImageInformationEntity = {
        id: 0,
        imageId: image.id,
        evaluation: 0,
        author: '',
        memo: '',
        url: '',
      };
      information.id = await saveDatabaseEntity('informations', information);

      dispatch(addNewImage({ image, information }));

      ev.dataTransfer.clearData();

      await window.file.copy(tmpPath, filePath);
      await window.file.delete(tmpPath);

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
