import { useAppSelector } from '@renderer/models/store';
import { ImagePreviewPage } from '../pages/image-preview/ImagePreviewPage';

export const WindowTabContainer: React.FC<object> = () => {
  const tabGroup = useAppSelector((state) => state.windowTabGroup);

  const activeTab = tabGroup.tabs.find((tab) => tabGroup.activeId === tab.id);
  if (!activeTab) {
    return undefined;
  }

  if (activeTab.type === 'image-preview') {
    return <ImagePreviewPage tab={activeTab} />;
  }

  return undefined;
};
