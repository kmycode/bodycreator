import { getFilteredImages, Image, ImageList } from '@renderer/models/entities/image_list';
import { openImagePreviewTab, updateTabData, WindowTab } from '@renderer/models/entities/window_tab_group';
import { useAppDispatch, useAppSelector } from '@renderer/models/store';
import { ReactClickEvent } from '@renderer/models/types';
import { useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { SearchPane } from './SearchPane';

export const ImageListPage: React.FC<{
  tab?: WindowTab;
}> = ({ tab }) => {
  const filteredImageIds = tab?.type === 'image-list' ? tab.data.filteredImageIds : null;
  const images = useSelector((state) =>
    getFilteredImages(state as { imageList: ImageList }, filteredImageIds),
  );
  const currentDirectory = useAppSelector((state) => state.system.currentDirectory);
  const folderName = useAppSelector((state) => state.systemSetting.databaseValues.folderName);

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

  const listScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (tab?.type !== 'image-list' || !listScrollRef.current) return;

    const targetElement = listScrollRef.current;
    const { scrollLength } = tab.data;

    // タブ切替時に自動スクロール
    targetElement.scrollTo({ top: scrollLength, behavior: 'instant' });

    // スクロール量を保存
    const updateScrollLength = (ev: Event): void => {
      const target = ev.target as HTMLDivElement;
      if (!target) return;

      const length = target.scrollTop;
      dispatch(updateTabData({ tabId: tab.id, data: { scrollLength: length } }));
    };
    targetElement.addEventListener('scroll', updateScrollLength);

    return () => {
      targetElement.removeEventListener('scroll', updateScrollLength);
    };
  }, [tab, dispatch]);

  return (
    <div className="image-list-page">
      <div className="image-list-page__search">
        <SearchPane tab={tab} />
      </div>
      <div className="image-list-page__list" ref={listScrollRef}>
        {images
          .filter((image) => image)
          .map((image) => (
            <button key={image!.id} data-id={image!.id} onDoubleClick={handleOpenImagePreviewTab}>
              <div className="image-list-page__list__item">
                <img
                  src={`${currentDirectory}/${folderName}/images/${image!.fileName}`}
                  width={image!.width * (200 / image!.height)}
                  height={200}
                  draggable={false}
                />
                {empty(image!) && <div className="empty-flag" />}
              </div>
            </button>
          ))}
      </div>
    </div>
  );
};
