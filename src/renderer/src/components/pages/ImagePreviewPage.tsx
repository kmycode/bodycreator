import EditPane from '../layout/EditPane';
import GesturableImage from '../features/GesturableImage';

export const ImagePreviewPage: React.FC<{
  fileName?: string;
}> = ({ fileName }) => {
  if (!fileName) return undefined;

  return (
    <div className="image-preview-page">
      <GesturableImage fileName={fileName} />
      <EditPane />
    </div>
  );
};
