import { useCallback, useState } from 'react';
import {
  VerticalAnglePicker,
  WearOptionPicker,
  IconGroupPicker,
} from '../pages/image-preview/components/pickers';
import {
  wearIcons,
  cubeIcons,
  faceIcons,
  lineIcons,
  sleepIcons,
  armVerticalIcons,
  legVerticalIcons,
  armHorizontalIcons,
  legHorizontalIcons,
} from '../pages/image-preview/components/pickertypes';

function SearchPane(): React.JSX.Element {
  const [faceVertical, setFaceVertical] = useState('normal');
  const [faceHorizontal, setFaceHorizontal] = useState('unknown');
  const [armHorizontal, setArmHorizontal] = useState('unknown');
  const [armVertical, setArmVertical] = useState('unknown');
  const [elbow, setElbow] = useState('unknown');
  const [legHorizontal, setLegHorizontal] = useState('unknown');
  const [legVertical, setLegVertical] = useState('unknown');
  const [knee, setKnee] = useState('unknown');
  const [chestVertical, setChestVertical] = useState('normal');
  const [chestHorizontal, setChestHorizontal] = useState('unknown');
  const [waistVertical, setWaistVertical] = useState('normal');
  const [waistHorizontal, setWaistHorizontal] = useState('unknown');
  const [sleep, setSleep] = useState('unknown');
  const [armWear, setArmWear] = useState('unknown');
  const [armWearOptions, setArmWearOptions] = useState([] as string[]);
  const [bodyWear, setBodyWear] = useState('unknown');
  const [bodyWearOptions, setBodyWearOptions] = useState([] as string[]);
  const [legWear, setLegWear] = useState('unknown');
  const [legWearOptions, setLegWearOptions] = useState([] as string[]);

  const handleFaceVerticalChange = useCallback(
    (value: string) => {
      setFaceVertical(value);
    },
    [setFaceVertical],
  );

  const handleFaceHorizontalChange = useCallback(
    (value: string) => {
      setFaceHorizontal(value);
    },
    [setFaceHorizontal],
  );

  const handleArmHorizontalChange = useCallback(
    (value) => {
      setArmHorizontal(value);
    },
    [setArmHorizontal],
  );

  const handleArmVerticalChange = useCallback(
    (value) => {
      setArmVertical(value);
    },
    [setArmVertical],
  );

  const handleElbowChange = useCallback(
    (value) => {
      setElbow(value);
    },
    [setElbow],
  );

  const handleLegHorizontalChange = useCallback(
    (value) => {
      setLegHorizontal(value);
    },
    [setLegHorizontal],
  );

  const handleLegVerticalChange = useCallback(
    (value) => {
      setLegVertical(value);
    },
    [setLegVertical],
  );

  const handleKneeChange = useCallback(
    (value) => {
      setKnee(value);
    },
    [setKnee],
  );

  const handleChestVerticalChange = useCallback(
    (value: string) => {
      setChestVertical(value);
    },
    [setChestVertical],
  );

  const handleChestHorizontalChange = useCallback(
    (value: string) => {
      setChestHorizontal(value);
    },
    [setChestHorizontal],
  );

  const handleSleepChange = useCallback(
    (value: string) => {
      setSleep(value);
    },
    [setSleep],
  );

  const handleWaistVerticalChange = useCallback(
    (value: string) => {
      setWaistVertical(value);
    },
    [setWaistVertical],
  );

  const handleWaistHorizontalChange = useCallback(
    (value: string) => {
      setWaistHorizontal(value);
    },
    [setWaistHorizontal],
  );

  const handleArmWearChange = useCallback(
    (value: string) => {
      setArmWear(value);
    },
    [setArmWear],
  );

  const handleArmWearOptionsChange = useCallback(
    (value: string[]) => {
      setArmWearOptions(value);
    },
    [setArmWearOptions],
  );

  const handleBodyWearChange = useCallback(
    (value: string) => {
      setBodyWear(value);
    },
    [setBodyWear],
  );

  const handleBodyWearOptionsChange = useCallback(
    (value: string[]) => {
      setBodyWearOptions(value);
    },
    [setBodyWearOptions],
  );

  const handleLegWearChange = useCallback(
    (value: string) => {
      setLegWear(value);
    },
    [setLegWear],
  );

  const handleLegWearOptionsChange = useCallback(
    (value: string[]) => {
      setLegWearOptions(value);
    },
    [setLegWearOptions],
  );

  return (
    <div className="searchpane pane">
      <h2>検索</h2>
      <div className="pane-contents">
        <h3>顔</h3>
        <div className="searchpane__row">
          <VerticalAnglePicker value={faceVertical} onChange={handleFaceVerticalChange} />
          <IconGroupPicker icons={faceIcons} value={faceHorizontal} onChange={handleFaceHorizontalChange} />
        </div>
        <h3>胸</h3>
        <div className="searchpane__row">
          <IconGroupPicker icons={wearIcons} value={bodyWear} onChange={handleBodyWearChange} />
          <WearOptionPicker values={bodyWearOptions} onChangeValues={handleBodyWearOptionsChange} />
        </div>
        <div className="searchpane__row">
          <VerticalAnglePicker value={chestVertical} onChange={handleChestVerticalChange} />
          <IconGroupPicker icons={cubeIcons} value={chestHorizontal} onChange={handleChestHorizontalChange} />
        </div>
        <h3>腰</h3>
        <div className="searchpane__row">
          <VerticalAnglePicker value={waistVertical} onChange={handleWaistVerticalChange} />
          <IconGroupPicker icons={cubeIcons} value={waistHorizontal} onChange={handleWaistHorizontalChange} />
        </div>
        <h3>腕、肘</h3>
        <div className="searchpane__row">
          <IconGroupPicker
            icons={armHorizontalIcons}
            value={armHorizontal}
            onChange={handleArmHorizontalChange}
          />
        </div>
        <div className="searchpane__row">
          <IconGroupPicker icons={armVerticalIcons} value={armVertical} onChange={handleArmVerticalChange} />
        </div>
        <div className="searchpane__row">
          <IconGroupPicker icons={lineIcons} value={elbow} onChange={handleElbowChange} />
        </div>
        <div className="searchpane__row">
          <IconGroupPicker icons={wearIcons} value={armWear} onChange={handleArmWearChange} />
          <WearOptionPicker values={armWearOptions} onChangeValues={handleArmWearOptionsChange} />
        </div>
        <h3>脚、膝</h3>
        <div className="searchpane__row">
          <IconGroupPicker
            icons={legHorizontalIcons}
            value={legHorizontal}
            onChange={handleLegHorizontalChange}
          />
        </div>
        <div className="searchpane__row">
          <IconGroupPicker icons={legVerticalIcons} value={legVertical} onChange={handleLegVerticalChange} />
        </div>
        <div className="searchpane__row">
          <IconGroupPicker icons={wearIcons} value={legWear} onChange={handleLegWearChange} />
          <WearOptionPicker values={legWearOptions} onChangeValues={handleLegWearOptionsChange} />
        </div>
        <div className="searchpane__row">
          <IconGroupPicker icons={lineIcons} value={knee} onChange={handleKneeChange} />
        </div>
        <h3>その他</h3>
        <div className="searchpane__row">
          <IconGroupPicker icons={sleepIcons} value={sleep} onChange={handleSleepChange} />
        </div>
      </div>
    </div>
  );
}

export default SearchPane;
