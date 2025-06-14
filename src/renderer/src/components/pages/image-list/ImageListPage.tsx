import { getFilteredImages, Image, ImageList } from '@renderer/models/entities/image_list';
import { openImagePreviewTab, WindowTab } from '@renderer/models/entities/window_tab_group';
import { useAppDispatch, useAppSelector } from '@renderer/models/store';
import { ReactClickEvent } from '@renderer/models/types';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';

export const ImageListPage: React.FC<{
  tab?: WindowTab;
}> = ({ tab }) => {
  const filteredImageIds = tab?.type === 'image-list' ? tab.data.filteredImageIds : null;
  const images = useSelector((state) =>
    getFilteredImages(state as { imageList: ImageList }, filteredImageIds),
  );
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

  const empty = useCallback((image: Image) => image.peopleSize + image.backgroundsSize <= 0, []);

  return (
    <div className="image-list-page">
      {images.map((image) => (
        <button key={image.id} data-id={image.id} onDoubleClick={handleOpenImagePreviewTab}>
          <div className="image-list-page__item">
            <img
              src={`${currentDirectory}/app_repository/images/${image.fileName}`}
              width={image.width * (200 / image.height)}
              height={200}
              draggable={false}
            />
            {empty(image) && <div className="empty-flag" />}
          </div>
        </button>
      ))}
    </div>
  );
};
