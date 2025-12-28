import {
  ImageBackgroundEntity,
  ImageInformationEntity,
  ImagePersonEntity,
} from '@renderer/models/entities/image_list';
import { ReactTextChangeEvent } from '@renderer/models/types';
import { useState } from 'react';
import {
  armHorizontalIcons,
  armVerticalIcons,
  cubeIcons,
  directionInfo,
  faceIcons,
  hairIcons,
  hairTypeInfo,
  legHorizontalIcons,
  legVerticalIcons,
  lineIcons,
  oppaiIcons,
  sleepIcons,
  spineIcons,
  verticalAngleInfo,
  wearIcons,
  wearOptionsInfo,
} from '../components/pickertypes';
import { SuggestItem, SuggestOnChangeData } from '@renderer/components/generic/SuggestableTextInput';
import { store } from '@renderer/models/store';

export const personDataKeys = [
  'name',
  'faceVertical',
  'faceHorizontal',
  'faceDirection',
  'faceEmotion',
  'hairLength',
  'hairStyle',
  'hairType',
  'leftArmHorizontal',
  'leftArmVertical',
  'rightArmHorizontal',
  'rightArmVertical',
  'leftElbow',
  'rightElbow',
  'leftLegHorizontal',
  'leftLegVertical',
  'leftKnee',
  'rightLegHorizontal',
  'rightLegVertical',
  'rightKnee',
  'chestVertical',
  'chestHorizontal',
  'chestDirection',
  'oppai',
  'oppaiSize',
  'bodySpine',
  'waistVertical',
  'waistHorizontal',
  'waistDirection',
  'bodyOthers',
  'sleep',
  'leftArmWear',
  'leftArmWearOptions',
  'rightArmWear',
  'rightArmWearOptions',
  'bodyWear',
  'bodyWearOptions',
  'leftLegWear',
  'leftLegWearOptions',
  'rightLegWear',
  'rightLegWearOptions',
  'wears',
  'poses',
  'personItem',
  'others',
];

export interface PersonData {
  idOfImage: number;
  name: string;
  faceVertical: string;
  faceHorizontal: string;
  faceDirection: string;
  faceEmotion: string;
  hairLength: string;
  hairStyle: string;
  hairType: string[];
  leftArmHorizontal: string;
  leftArmVertical: string;
  rightArmHorizontal: string;
  rightArmVertical: string;
  leftElbow: string;
  rightElbow: string;
  leftLegHorizontal: string;
  leftLegVertical: string;
  leftKnee: string;
  rightLegHorizontal: string;
  rightLegVertical: string;
  rightKnee: string;
  chestVertical: string;
  chestHorizontal: string;
  chestDirection: string;
  oppai: string;
  oppaiSize: string;
  bodySpine: string[];
  waistVertical: string;
  waistHorizontal: string;
  waistDirection: string;
  bodyOthers: string;
  sleep: string;
  leftArmWear: string;
  leftArmWearOptions: string[];
  rightArmWear: string;
  rightArmWearOptions: string[];
  bodyWear: string;
  bodyWearOptions: string[];
  leftLegWear: string;
  leftLegWearOptions: string[];
  rightLegWear: string;
  rightLegWearOptions: string[];
  wears: string;
  poses: string;
  personItem: string;
  others: string;
}

export const personDataTextInputKeys = [
  'name',
  'faceEmotion',
  'hairStyle',
  'oppai',
  'wears',
  'poses',
  'personItem',
  'others',
  'bodyOthers',
];
export const personDataStringArrayKeys = [
  'leftArmWearOptions',
  'rightArmWearOptions',
  'bodyWearOptions',
  'leftLegWearOptions',
  'rightLegWearOptions',
  'hairType',
  'bodySpine',
];

const personEntityDataConvertInfo: { [key: string]: EntityDataConvertInfo } = {
  faceHorizontal: { multiple: false, items: faceIcons },
  faceVertical: { multiple: false, items: verticalAngleInfo },
  faceDirection: { multiple: false, items: directionInfo },
  hairType: { multiple: true, items: hairTypeInfo },
  hairLength: { multiple: false, items: hairIcons },
  leftArmHorizontal: { multiple: false, items: armHorizontalIcons },
  leftArmVertical: { multiple: false, items: armVerticalIcons },
  rightArmHorizontal: { multiple: false, items: armHorizontalIcons },
  rightArmVertical: { multiple: false, items: armVerticalIcons },
  leftElbow: { multiple: false, items: lineIcons },
  rightElbow: { multiple: false, items: lineIcons },
  leftLegHorizontal: { multiple: false, items: legHorizontalIcons },
  leftLegVertical: { multiple: false, items: legVerticalIcons },
  leftKnee: { multiple: false, items: lineIcons },
  rightLegHorizontal: { multiple: false, items: legHorizontalIcons },
  rightLegVertical: { multiple: false, items: legVerticalIcons },
  rightKnee: { multiple: false, items: lineIcons },
  chestVertical: { multiple: false, items: verticalAngleInfo },
  chestHorizontal: { multiple: false, items: cubeIcons },
  chestDirection: { multiple: false, items: directionInfo },
  oppaiSize: { multiple: false, items: oppaiIcons },
  waistVertical: { multiple: false, items: verticalAngleInfo },
  waistHorizontal: { multiple: false, items: cubeIcons },
  waistDirection: { multiple: false, items: directionInfo },
  sleep: { multiple: false, items: sleepIcons },
  leftArmWear: { multiple: false, items: wearIcons },
  rightArmWear: { multiple: false, items: wearIcons },
  bodyWear: { multiple: false, items: wearIcons },
  leftLegWear: { multiple: false, items: wearIcons },
  rightLegWear: { multiple: false, items: wearIcons },
  bodySpine: { multiple: true, items: spineIcons },
  leftArmWearOptions: { multiple: true, items: wearOptionsInfo },
  rightArmWearOptions: { multiple: true, items: wearOptionsInfo },
  bodyWearOptions: { multiple: true, items: wearOptionsInfo },
  leftLegWearOptions: { multiple: true, items: wearOptionsInfo },
  rightLegWearOptions: { multiple: true, items: wearOptionsInfo },
};

export const personEntityToData = (entity: ImagePersonEntity): PersonData => {
  return personDataKeys.reduce(
    (current, key) => {
      const convert = personEntityDataConvertInfo[key];
      if (convert) {
        if (convert.multiple) {
          current[key] = convert.items.filter((c) => entity[key] & c.numId).map((c) => c.id);
        } else {
          const item = convert.items.find((c) => c.numId === entity[key]);
          current[key] = item?.id ?? 'unknown';
        }
      } else {
        current[key] = entity[key];
      }
      return current;
    },
    { idOfImage: entity.idOfImage },
  ) as PersonData;
};

export const personDataToEntity = (
  data: PersonData,
  entityBase: ImagePersonEntity | { imageId: number; idOfImage: number; name: string },
): ImagePersonEntity => {
  const initialState = { ...entityBase };
  if (data.idOfImage) {
    initialState.idOfImage = data.idOfImage;
  }

  return personDataKeys.reduce((current, key) => {
    const convert = personEntityDataConvertInfo[key];
    if (convert) {
      if (convert.multiple) {
        current[key] = convert.items
          .filter((c) => data[key].includes(c.id))
          .reduce((num, item) => num + item.numId, 0);
      } else {
        const item = convert.items.find((c) => c.id === data[key]);
        current[key] = item?.numId ?? 0;
      }
    } else {
      current[key] = data[key];
    }
    return current;
  }, initialState) as ImagePersonEntity;
};

export const backgroundDataKeys = ['name', 'place', 'items', 'landscape'];
export const backgroundDataTextInputKeys = ['name', 'place', 'items', 'landscape'];
export const backgroundDataStringArrayKeys = [];
export const backgroundDataNumberKeys = [];

export interface BackgroundData {
  idOfImage: number;
  name: string;
  place: string;
  items: string;
  landscape: string;
}

export const backgroundEntityToData = (entity: ImageBackgroundEntity): BackgroundData => {
  return backgroundDataKeys.reduce(
    (current, key) => {
      current[key] = entity[key];
      return current;
    },
    { idOfImage: entity.idOfImage },
  ) as BackgroundData;
};

export const backgroundDataToEntity = (
  data: BackgroundData,
  entityBase: ImageBackgroundEntity | { imageId: number; idOfImage: number; name: string },
): ImageBackgroundEntity => {
  const initialState = { ...entityBase };
  if (data.idOfImage) {
    initialState.idOfImage = data.idOfImage;
  }

  return backgroundDataKeys.reduce((current, key) => {
    current[key] = data[key];
    return current;
  }, initialState) as ImageBackgroundEntity;
};

export const informationDataKeys = ['author', 'url', 'memo', 'evaluation', 'category'];
export const informationDataTextInputKeys = ['author', 'url', 'memo', 'category'];
export const informationDataStringArrayKeys = [];
export const informationDataNumberKeys = ['evaluation'];

export interface InformationData {
  author: string;
  category: string;
  url: string;
  memo: string;
  evaluation: number;
}

export const informationEntityToData = (entity: ImageInformationEntity): InformationData => {
  return informationDataKeys.reduce((current, key) => {
    current[key] = entity[key];
    return current;
  }, {}) as InformationData;
};

export const informationDataToEntity = (
  data: InformationData,
  entityBase: ImageInformationEntity,
): ImageInformationEntity => {
  return informationDataKeys.reduce(
    (current, key) => {
      current[key] = data[key];
      return current;
    },
    { ...entityBase },
  ) as ImageInformationEntity;
};

export type StateType = (string & string[] & number) | undefined;
export type SetStateType = React.Dispatch<React.SetStateAction<StateType>>;
export type StatesObjectType = { [s: string]: { state: StateType; setState: SetStateType } };
export type CallbacksObjectType = { [s: string]: any }; // eslint-disable-line @typescript-eslint/no-explicit-any
export type EntityDataConvertInfo = { multiple: boolean; items: { numId: number; id: string }[] };

export interface KeyOptions {
  defaultEmptyStringKeys?: string[];
  stringArrayKeys?: string[];
  numberKeys?: string[];
}

export const generateStates = (keys: string[], keyOptions: KeyOptions): StatesObjectType => {
  const defaultEmptyStringKeys = keyOptions.defaultEmptyStringKeys ?? [];
  const stringArrayKeys = keyOptions.stringArrayKeys ?? [];
  const numberKeys = keyOptions.numberKeys ?? [];

  const getDefaultValue = (key): string[] | number | string => {
    return stringArrayKeys.includes(key)
      ? []
      : numberKeys.includes(key)
        ? 0
        : defaultEmptyStringKeys.includes(key)
          ? ''
          : 'unknown';
  };

  return keys.reduce((obj, key) => {
    const fn = useState(getDefaultValue(key));
    obj[key] = { state: fn[0], setState: fn[1] };
    return obj;
  }, {});
};

export const generateCallbacks = (
  keys: string[],
  states: StatesObjectType,
  dataBase: object | undefined,
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  onChange: ((data: any, diff: { key: string; value: StateType }) => void) | undefined,
): CallbacksObjectType => {
  return keys.reduce((obj, key) => {
    const state = states[key];
    if (!state) return obj;

    obj[key] = (value: StateType) => {
      state.setState(value);

      // データオブジェクトを生成してストアに保存する処理
      const data = Object.entries<{ state: StateType; setState: SetStateType }>(states).reduce(
        (obj, entry) => {
          const key = entry[0];
          const value = entry[1].state;

          obj[key] = value;

          return obj;
        },
        { ...dataBase },
      );
      data[key] = value;

      if (onChange) {
        onChange(data, { key, value });
      }
    };
    return obj;
  }, {});
};

export const updateInitialData = (
  keys: string[],
  states: StatesObjectType,
  initialData: object | undefined,
): void => {
  if (!initialData) return;

  for (const key of keys) {
    const state = states[key];
    const data = initialData[key];

    if (!state || typeof data === 'undefined') continue;

    state.setState(data);
  }
};

export const handleGenericTextInputChange = (
  ev: ReactTextChangeEvent,
  callbacks: CallbacksObjectType,
): void => {
  const {
    currentTarget: { value, dataset },
  } = ev;
  const key = dataset['key'];
  if (!key) return;

  const callback = callbacks[key];
  if (!callback) return;

  callback(value);
};

export const handleSuggestGeneric = (name: string, data: SuggestOnChangeData): SuggestItem[] => {
  const category = store.getState().tagList.items[name];
  if (!category || data.bySuggestion || !data.editingLine || data.editingLine.length <= 0) return [];

  const tags = category.filter((tag) => tag.name.startsWith(data.editingLine!));
  const sortedTags = tags.sort((a, b) => (a.usage < b.usage ? -1 : a.usage === b.usage ? 0 : 1));
  sortedTags.slice(0, 6);

  return sortedTags.map((tag) => ({ title: tag.name }));
};
