import {
  errorLoadingImageElements,
  Image,
  ImageBackgroundEntity,
  ImageEntity,
  ImageInformationEntity,
  ImagePersonEntity,
  ImageTagEntity,
  setImageElements,
  startLoadingImageElements,
} from '../entities/image_list';
import { TagEntity, updateTags } from '../entities/tag_list';
import { AppDispatch, store } from '../store';
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

const pickTagNames = (text: string): string[] => {
  return text
    .replaceAll('\r', '')
    .split('\n')
    .filter((t) => t.length > 0);
};

const peopleTagCategories = {
  faceEmotion: ['faceEmotion'],
  hairStyle: ['hairStyle'],
  oppai: ['oppai'],
  bodyOthers: ['bodyOthers'],
  wears: ['wears'],
  poses: ['poses'],
  others: ['others'],
};

export const saveImageTagToDatabase = async (dispatch: AppDispatch, data: Image): Promise<void> => {
  const existTags: ImageTagEntity[] = await window.db.queryToArray(
    `SELECT * FROM image_tags WHERE imageId = ${data.id}`,
  );
  const removeTags: TagEntity[] = [];
  const addTags: TagEntity[] = [];
  const allTags = store.getState().tagList.items;

  for (const entity of (data.people as { idOfImage: number }[]).concat(data.backgrounds)) {
    for (const [category, columns] of Object.entries(peopleTagCategories)) {
      const categoryTags = allTags[category] ?? [];
      const tagNames = pickTagNames(columns.map((c) => entity[c]).join('\n'));

      const currentPairs = existTags
        .map((imageTag) => ({
          imageTag,
          tag: categoryTags.find((t) => t.id === imageTag.tagId)!,
        }))
        .filter((p) => p.tag);
      const newPairs = tagNames.map((name) => {
        const pair = currentPairs.find((p) => p.tag.name === name);
        if (pair) return { ...pair, name };
        return { imageTag: undefined, tag: categoryTags.find((t) => t.name === name), name };
      });

      const removes = currentPairs.filter((cp) => !newPairs.some((np) => np.name === cp.tag.name));
      const adds = newPairs.filter((np) => !currentPairs.some((cp) => cp.tag.name === np.name));

      for (const remove of removes) {
        removeTags.push(remove.tag);
        remove.tag.usage--;
        await window.db.query(`DELETE FROM image_tags WHERE id = ${remove.imageTag.id}`);
      }

      for (const add of adds) {
        if (!add.tag) {
          const newTag: TagEntity = {
            id: 0,
            name: add.name,
            category,
            usage: 1,
          };
          newTag.id = await saveDatabaseEntity('tags', newTag);
          add.tag = newTag;
        } else {
          add.tag = { ...add.tag, usage: add.tag.usage + 1 };
          await saveDatabaseEntity('tags', add.tag);
        }

        const newImageTag: ImageTagEntity = {
          id: 0,
          tagId: add.tag.id,
          imageId: data.id,
          elementId: entity.idOfImage,
        };
        newImageTag.id = await saveDatabaseEntity('image_tags', newImageTag);
        add.imageTag = newImageTag;

        addTags.push(add.tag);
      }
    }
  }

  for (const remove of removeTags.filter((rt) => rt.usage <= 0)) {
    await window.db.query(`DELETE FROM tags WHERE id = ${remove.id}`);
  }

  dispatch(updateTags({ tags: addTags.concat(removeTags) }));
};
