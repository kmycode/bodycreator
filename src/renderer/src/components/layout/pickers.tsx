import { ReactClickEvent } from "@renderer/models/types";
import { useCallback } from "react";
import classNames from "classnames";
import FaceFrontIcon from '@renderer/assets/icons/picture/face-front.svg';
import FaceFrontDiagIcon from '@renderer/assets/icons/picture/face-front-d.svg';
import FaceSideIcon from '@renderer/assets/icons/picture/face-side.svg';
import FaceBackDiagIcon from '@renderer/assets/icons/picture/face-back-d.svg';
import FaceBackIcon from '@renderer/assets/icons/picture/face-back.svg';
import ArmHorizontalFrontIcon from '@renderer/assets/icons/picture/arm-h-front.svg';
import ArmHorizontalFrontDiagIcon from '@renderer/assets/icons/picture/arm-h-front-d.svg';
import ArmHorizontalUnderIcon from '@renderer/assets/icons/picture/arm-h-under.svg';
import ArmHorizontalUnderDiagIcon from '@renderer/assets/icons/picture/arm-h-under-d.svg';
import ArmHorizontalSideIcon from '@renderer/assets/icons/picture/arm-h-side.svg';
import ArmHorizontalUpDiagIcon from '@renderer/assets/icons/picture/arm-h-up-d.svg';
import ArmHorizontalUpIcon from '@renderer/assets/icons/picture/arm-h-up.svg';
import ArmVerticalBackDiagIcon from '@renderer/assets/icons/picture/arm-v-back-d.svg';
import ArmVerticalFrontDiagIcon from '@renderer/assets/icons/picture/arm-v-front-d.svg';
import ArmVerticalFrontUnderDiagIcon from '@renderer/assets/icons/picture/arm-v-front-u-d.svg';
import ArmVerticalFrontIcon from '@renderer/assets/icons/picture/arm-v-front.svg';
import ArmVerticalSideIcon from '@renderer/assets/icons/picture/arm-v-side.svg';
import ArmVerticalUpIcon from '@renderer/assets/icons/picture/arm-v-up.svg';
import LegHorizontalReverseDiagIcon from '@renderer/assets/icons/picture/leg-h-reverse-d.svg';
import LegHorizontalSideIcon from '@renderer/assets/icons/picture/leg-h-side.svg';
import LegHorizontalUnderDiagIcon from '@renderer/assets/icons/picture/leg-h-u-d.svg';
import LegHorizontalUnderIcon from '@renderer/assets/icons/picture/leg-h-under.svg';
import LegVerticalSideIcon from '@renderer/assets/icons/picture/leg-v-side.svg';
import LegVerticalTopDiagIcon from '@renderer/assets/icons/picture/leg-v-t-d.svg';
import LegVerticalTopIcon from '@renderer/assets/icons/picture/leg-v-top.svg';
import LegVerticalUnderDiagIcon from '@renderer/assets/icons/picture/leg-v-u-d.svg';
import LegVerticalUnderIcon from '@renderer/assets/icons/picture/leg-v-under.svg';
import SleepTopIcon from '@renderer/assets/icons/picture/sleep-top.svg';
import SleepSideIcon from '@renderer/assets/icons/picture/sleep-side.svg';
import SleepUnderIcon from '@renderer/assets/icons/picture/sleep-under.svg';
import CubeFrontIcon from '@renderer/assets/icons/picture/cube-front.svg';
import CubeFrontDiagIcon from '@renderer/assets/icons/picture/cube-front-d.svg';
import CubeSideIcon from '@renderer/assets/icons/picture/cube-side.svg';
import CubeBackDiagIcon from '@renderer/assets/icons/picture/cube-back-d.svg';
import CubeBackIcon from '@renderer/assets/icons/picture/cube-back.svg';
import LineSideIcon from '@renderer/assets/icons/picture/line-side.svg';
import LineStraightIcon from '@renderer/assets/icons/picture/line-straight.svg';
import LineTopDiagIcon from '@renderer/assets/icons/picture/line-t-d.svg';
import LineTopIcon from '@renderer/assets/icons/picture/line-top.svg';
import LineUnderDiagIcon from '@renderer/assets/icons/picture/line-u-d.svg';
import WearNoneIcon from '@renderer/assets/icons/picture/wear-none.svg';
import Wear1Icon from '@renderer/assets/icons/picture/wear-1.svg';
import Wear2Icon from '@renderer/assets/icons/picture/wear-2.svg';
import WearHalf1Icon from '@renderer/assets/icons/picture/wear-half-1.svg';
import WearHalf2Icon from '@renderer/assets/icons/picture/wear-half-2.svg';
import HairShortIcon from '@renderer/assets/icons/picture/hair-short.svg';
import HairMiddleIcon from '@renderer/assets/icons/picture/hair-middle.svg';
import HairLongIcon from '@renderer/assets/icons/picture/hair-long.svg';

export const VerticalAnglePicker: React.FC<{
  value?: string,
  onChange?: (selectedType: string) => void,
}> = ({ value, onChange }) => {
  const handleClick = useCallback((ev: ReactClickEvent) => {
    if (!onChange) return;

    const target = ev.currentTarget;
    const className = Array.from(target.classList).find((name) => ['normal', 'high', 'low'].includes(name) ? name : false) ?? 'unknown';

    onChange(className === value ? 'normal' : className);
  }, [
    value,
    onChange,
  ]);

  return (
    <div className="verticalanglepicker">
      <button className={classNames({ 'high': true, 'selected': value === 'high' })} onClick={handleClick}>フカン</button>
      <button className={classNames({ 'low': true, 'selected': value === 'low' })} onClick={handleClick}>アオリ</button>
    </div>
  );
}

export const WearOptionPicker: React.FC<{
  values?: string[],
  onChangeValues?: (selectedType: string[]) => void,
}> = ({ values, onChangeValues }) => {
  const handleClick = useCallback((ev: ReactClickEvent) => {
    if (!onChangeValues || !values) return;

    const target = ev.currentTarget;
    const className = Array.from(target.classList).find((name) => ['takeoff', 'wet'].includes(name) ? name : false) ?? 'unknown';

    let newValues;
    if (values.includes(className)) {
      newValues = values.filter((v) => v !== className);
    } else {
      newValues = [...values];
      newValues.push(className);
    }

    onChangeValues(newValues);
  }, [
    values,
    onChangeValues,
  ]);

  return (
    <div className="verticalanglepicker wearoptionpicker">
      <button className={classNames({ 'takeoff': true, 'selected': values?.includes('takeoff') })} onClick={handleClick}>脱ぐ</button>
      <button className={classNames({ 'wet': true, 'selected': values?.includes('wet') })} onClick={handleClick}>濡れ</button>
    </div>
  );
}

export interface IconItem {
  id: string;
  numId: number;
  svg: string;
}

export const IconGroupPicker: React.FC<{
  icons: IconItem[];
  value?: string;
  values?: string[];
  onChange?: (selectedId: string) => void;
  onChangeMultiple?: (selectedIds: string[]) => void;
}> = ({ icons, value, values, onChange, onChangeMultiple }) => {
  // const isMultiple = values || onChangeMultiple;

  const handleChange = useCallback((ev: ReactClickEvent) => {
    if (!onChange && !onChangeMultiple) return;

    const target = ev.currentTarget;
    const id = target.dataset['id'];
    if (!id) return;

    const isChecked = value === id;

    if (onChange) {
      onChange(isChecked ? 'unknown' : id);
    }

    if (values) {
      let newValues;

      if (values.includes(id)) {
        newValues = values.filter((v) => v !== id);
      } else {
        newValues = [...values];
        newValues.push(id);
      }

      if (onChangeMultiple) {
        onChangeMultiple(newValues);
      }
    }
  }, [
    value,
    onChange,
  ]);

  return (
    <div className="icongrouppicker">
      {icons.map((icon) => (
        <button key={icon.id} data-id={icon.id} onClick={handleChange} className="svgbutton">
          <img src={icon.svg} className={classNames({ 'svgicon': true, 'enabled': value === icon.id || values?.includes(icon.id), })}/>
        </button>
      ))}
    </div>
  );
};

export const faceIcons = [
  { id: 'face-front',   numId: 1, svg: FaceFrontIcon, },
  { id: 'face-front-d', numId: 2, svg: FaceFrontDiagIcon, },
  { id: 'face-side',    numId: 3, svg: FaceSideIcon, },
  { id: 'face-back-d',  numId: 4, svg: FaceBackDiagIcon, },
  { id: 'face-back',    numId: 5, svg: FaceBackIcon, },
];

export const armHorizontalIcons = [
  { id: 'arm-h-front',   numId: 1, svg: ArmHorizontalFrontIcon, },
  { id: 'arm-h-front-d', numId: 2, svg: ArmHorizontalFrontDiagIcon, },
  { id: 'arm-h-under',   numId: 3, svg: ArmHorizontalUnderIcon, },
  { id: 'arm-h-under-d', numId: 4, svg: ArmHorizontalUnderDiagIcon, },
  { id: 'arm-h-side',    numId: 5, svg: ArmHorizontalSideIcon, },
  { id: 'arm-h-up-d',    numId: 6, svg: ArmHorizontalUpDiagIcon, },
  { id: 'arm-h-up',      numId: 7, svg: ArmHorizontalUpIcon, },
];

export const armVerticalIcons = [
  { id: 'arm-v-back-d',    numId: 1, svg: ArmVerticalBackDiagIcon, },
  { id: 'arm-v-side',      numId: 2, svg: ArmVerticalSideIcon, },
  { id: 'arm-v-front-u-d', numId: 3, svg: ArmVerticalFrontUnderDiagIcon, },
  { id: 'arm-v-front',     numId: 4, svg: ArmVerticalFrontIcon, },
  { id: 'arm-v-front-d',   numId: 5, svg: ArmVerticalFrontDiagIcon, },
  { id: 'arm-v-up',        numId: 6, svg: ArmVerticalUpIcon, },
];

export const legHorizontalIcons = [
  { id: 'leg-h-reverse-d', numId: 1, svg: LegHorizontalReverseDiagIcon, },
  { id: 'leg-h-under',     numId: 2, svg: LegHorizontalUnderIcon, },
  { id: 'leg-h-u-d',       numId: 3, svg: LegHorizontalUnderDiagIcon, },
  { id: 'leg-h-side',      numId: 4, svg: LegHorizontalSideIcon, },
];

export const legVerticalIcons = [
  { id: 'leg-v-under', numId: 1, svg: LegVerticalUnderIcon, },
  { id: 'leg-v-u-d',   numId: 2, svg: LegVerticalUnderDiagIcon, },
  { id: 'leg-v-side',  numId: 3, svg: LegVerticalSideIcon, },
  { id: 'leg-v-t-d',   numId: 4, svg: LegVerticalTopDiagIcon, },
  { id: 'leg-v-top',   numId: 5, svg: LegVerticalTopIcon, },
];

export const sleepIcons = [
  { id: 'sleep-top',   numId: 1, svg: SleepTopIcon, },
  { id: 'sleep-side',  numId: 2, svg: SleepSideIcon, },
  { id: 'sleep-under', numId: 3, svg: SleepUnderIcon, },
];

export const cubeIcons = [
  { id: 'cube-front',   numId: 1, svg: CubeFrontIcon, },
  { id: 'cube-front-d', numId: 2, svg: CubeFrontDiagIcon, },
  { id: 'cube-side',    numId: 3, svg: CubeSideIcon, },
  { id: 'cube-back-d',  numId: 4, svg: CubeBackDiagIcon, },
  { id: 'cube-back',    numId: 5, svg: CubeBackIcon, },
];

export const lineIcons = [
  { id: 'line-straight', numId: 1, svg: LineStraightIcon, },
  { id: 'line-u-d',      numId: 2, svg: LineUnderDiagIcon, },
  { id: 'line-side',     numId: 3, svg: LineSideIcon, },
  { id: 'line-t-d',      numId: 4, svg: LineTopDiagIcon, },
  { id: 'line-top',      numId: 5, svg: LineTopIcon, },
];

export const wearIcons = [
  { id: 'wear-none',   numId: 1, svg: WearNoneIcon, },
  { id: 'wear-half-1', numId: 2, svg: WearHalf1Icon, },
  { id: 'wear-half-2', numId: 3, svg: WearHalf2Icon, },
  { id: 'wear-1',      numId: 4, svg: Wear1Icon, },
  { id: 'wear-2',      numId: 5, svg: Wear2Icon, },
];

export const hairIcons = [
  { id: 'hair-short',  numId: 1, svg: HairShortIcon, },
  { id: 'hair-middle', numId: 2, svg: HairMiddleIcon, },
  { id: 'hair-long',   numId: 3, svg: HairLongIcon, },
]
