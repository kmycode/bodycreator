import {
  errorLoadingImageElements,
  Image,
  ImageBackgroundEntity,
  ImageEntity,
  ImageInformationEntity,
  ImagePersonEntity,
  setImageElements,
  startLoadingImageElements,
} from '../entities/image_list';
import { AppDispatch } from '../store';
import { saveDatabaseEntity } from './dbutil';

export const loadImageElements = async (dispatch: AppDispatch, imageId: number): Promise<void> => {
  const db = window.db;

  dispatch(startLoadingImageElements({ imageId }));

  const information = (await db.queryToOneObject(`SELECT * FROM informations WHERE imageId = ${imageId}`)) as
    | ImageInformationEntity
    | undefined;
  if (!information) {
    dispatch(errorLoadingImageElements({ imageId }));
    return;
  }

  const people = (await db.queryToArray(
    `SELECT * FROM people WHERE imageId = ${imageId}`,
  )) as ImagePersonEntity[];
  const backgrounds = (await db.queryToArray(
    `SELECT * FROM backgrounds WHERE imageId = ${imageId}`,
  )) as ImageBackgroundEntity[];

  dispatch(
    setImageElements({
      imageId,
      people,
      backgrounds,
      information,
    }),
  );
};

export const saveImageToDatabase = async (
  data: Image,
): Promise<{ imageId: number; peopleIds: number[]; backgroundIds: number[] }> => {
  const entity: ImageEntity = {
    id: data.id,
    fileName: data.fileName,
    width: data.width,
    height: data.height,
    peopleSize: data.people.length,
    backgroundsSize: data.backgrounds.length,
    evaluation: data.information?.evaluation ?? data.evaluation,
  };
  const imageId = await saveDatabaseEntity('images', entity);

  if (data.information) {
    await saveDatabaseEntity('informations', { ...data.information, imageId });
  }

  const peopleIds = [] as number[];
  const backgroundIds = [] as number[];

  for (const person of data.people) {
    const id = await saveDatabaseEntity('people', { ...person, imageId });
    peopleIds.push(id);
  }

  for (const background of data.backgrounds) {
    const id = await saveDatabaseEntity('backgrounds', { ...background, imageId });
    backgroundIds.push(id);
  }

  return { imageId, peopleIds, backgroundIds };
};
