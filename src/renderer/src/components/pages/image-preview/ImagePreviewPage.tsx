import EditPane from './components/EditPane';
import GesturableImage from '../../features/GesturableImage';
import { WindowTab } from '@renderer/models/entities/window_tab_group';

export const ImagePreviewPage: React.FC<{
  tab?: WindowTab;
}> = ({ tab }) => {
  const imageId = tab?.data.imageId ?? 0;

  return (
    <div className="image-preview-page">
      <GesturableImage imageId={imageId} />
      <EditPane imageId={imageId} />
    </div>
  );
};
