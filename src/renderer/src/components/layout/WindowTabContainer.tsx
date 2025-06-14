import { useAppDispatch, useAppSelector } from '@renderer/models/store';
import { ImagePreviewPage } from '../pages/image-preview/ImagePreviewPage';
import { ImageListPage } from '../pages/image-list/ImageListPage';
import { useEffect, useRef } from 'react';
import {
  finishSavingImage,
  saveCurrentImage,
  setImageIds,
  startSavingImage,
} from '@renderer/models/entities/image_list';
import { saveImageTagToDatabase, saveImageToDatabase } from '@renderer/models/utils/imageserializer';

export const WindowTabContainer: React.FC<object> = () => {
  const activeTabId = useAppSelector((state) => state.windowTabGroup.activeId);
  const activeTab = useAppSelector((state) =>
    state.windowTabGroup.tabs.find((tab) => tab.id === activeTabId),
  );

  const currentTab = useRef(activeTab);
  const dispatch = useAppDispatch();

  const savingImage = useAppSelector((state) => state.imageList.current.savingImage);

  useEffect(() => {
    // 画像の保存
    if (savingImage && savingImage.saveStatus === 'ready') {
      const image = savingImage;

      const process = async (): Promise<void> => {
        const imageId = image.id;

        dispatch(startSavingImage({ imageId }));
        const ids = await saveImageToDatabase(image);
        dispatch(setImageIds(ids));
        await saveImageTagToDatabase(dispatch, image);
        dispatch(finishSavingImage({ imageId }));
      };
      process();
    }
  }, [savingImage, dispatch]);

  useEffect(() => {
    if (currentTab.current && activeTab && currentTab.current.id !== activeTab.id) {
      const prevTab = currentTab.current;

      // タブの終了処理
      if (prevTab.type === 'image-preview' && activeTab.type !== 'image-preview') {
        dispatch(saveCurrentImage());
      }

      currentTab.current = activeTab;
    }
  }, [dispatch, activeTab, currentTab]);

  if (!activeTab) {
    return undefined;
  }

  if (activeTab.type === 'image-preview') {
    return <ImagePreviewPage tab={activeTab} />;
  }

  if (activeTab.type === 'image-list') {
    return <ImageListPage tab={activeTab} />;
  }

  return undefined;
};
