import { ImageInformationEntity, ImagePersonEntity } from '@renderer/models/entities/image_list';

export const personDataKeys = [
  'name',
  'faceVertical',
  'faceHorizontal',
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
  'oppai',
  'oppaiSize',
  'bodySpine',
  'waistVertical',
  'waistHorizontal',
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
  'others',
];

export interface PersonData {
  idOfImage: number;
  name: string;
  faceVertical: string;
  faceHorizontal: string;
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
  oppai: string;
  oppaiSize: string;
  bodySpine: string[];
  waistVertical: string;
  waistHorizontal: string;
  bodyOthers: string[];
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
  others: string;
}

export const personDataTextInputKeys = [
  'name',
  'faceEmotion',
  'hairStyle',
  'oppai',
  'wears',
  'poses',
  'others',
];
export const personDataStringArrayKeys = [
  'leftArmWearOptions',
  'rightArmWearOptions',
  'bodyWearOptions',
  'leftLegWearOptions',
  'rightLegWearOptions',
  'hairType',
  'bodySpine',
  'bodyOthers',
];

export const personEntityToData = (entity: ImagePersonEntity): PersonData => {
  return personDataKeys.reduce(
    (current, key) => {
      current[key] = entity[key];
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
    current[key] = data[key];
    return current;
  }, initialState) as ImagePersonEntity;
};

export const informationDataKeys = ['author', 'url', 'memo', 'evaluation'];

export const informationDataTextInputKeys = ['author', 'url', 'memo'];

export const informationDataStringArrayKeys = [];

export const informationDataNumberKeys = ['evaluation'];

export interface InformationData {
  author: string;
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
