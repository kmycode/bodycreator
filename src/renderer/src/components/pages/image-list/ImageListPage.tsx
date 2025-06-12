import { Image } from '@renderer/models/entities/image_list';
import { openImagePreviewTab, WindowTab } from '@renderer/models/entities/window_tab_group';
import { useAppDispatch, useAppSelector } from '@renderer/models/store';
import { ReactClickEvent } from '@renderer/models/types';
import { useCallback } from 'react';

export const ImageListPage: React.FC<{
  tab?: WindowTab;
}> = ({ tab }) => {
  const filteredImageIds = tab?.type === 'image-list' && tab?.data.filteredImageIds;
  const images = useAppSelector((state) => {
    if (filteredImageIds) {
      return filteredImageIds.reduce((obj, imageId) => {
        const img = state.imageList.items[imageId];
        if (img) {
          obj.push(img);
        }
        return obj;
      }, [] as Image[]);
    }

    return Object.values(state.imageList.items);
  });
  const currentDirectory = useAppSelector((state) => state.system.currentDirectory);

  const dispatch = useAppDispatch();

  const handleOpenImagePreviewTab = useCallback(
    (ev: ReactClickEvent) => {
      const imageId = ev.currentTarget.dataset['id'];
      if (!imageId) return;

      dispatch(openImagePreviewTab({ imageId: parseInt(imageId) }));
    },
    [dispatch],
  );

  return (
    <div>
      {images.map((image) => (
        <button key={image.id} data-id={image.id} onDoubleClick={handleOpenImagePreviewTab}>
          <img src={`${currentDirectory}/app_repository/images/${image.fileName}`} height={200} />
        </button>
      ))}
    </div>
  );
};
