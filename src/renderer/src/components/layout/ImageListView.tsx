import GesturableImage from "../features/GesturableImage";
import SampleImage from '@renderer/assets/samples/images/sample1.png';

function ImageListView(): React.JSX.Element {
  return (
    <div className="imagelistview">
      <GesturableImage fileName={SampleImage}/>
    </div>
  );
}

export default ImageListView;
