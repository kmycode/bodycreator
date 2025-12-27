import { ImageSearchQuery } from '@renderer/components/pages/image-list/SearchPane';
import {
  addNewImage,
  deleteImage,
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
import { deleteImageTabs } from '../entities/window_tab_group';
import { AppDispatch, store } from '../store';
import { saveDatabaseEntity } from './dbutil';
import { imageSize } from 'image-size';

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
    deleteFlag: 0,
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

  if (data.deletedPeople.length > 0) {
    await window.db.query(
      `DELETE FROM people WHERE id IN (${data.deletedPeople.map((p) => p.id).join(',')})`,
    );
  }
  if (data.deletedBackgrounds.length > 0) {
    await window.db.query(
      `DELETE FROM backgrounds WHERE id IN (${data.deletedBackgrounds.map((p) => p.id).join(',')})`,
    );
  }

  return { imageId, peopleIds, backgroundIds };
};

export const pickTagNames = (text: string): string[] => {
  return text
    .replaceAll('\r', '')
    .split('\n')
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
};

const tagCategories = {
  faceEmotion: ['faceEmotion'],
  hairStyle: ['hairStyle'],
  oppai: ['oppai'],
  bodyOthers: ['bodyOthers'],
  wears: ['wears'],
  poses: ['poses'],
  personItem: ['personItem'],
  others: ['others'],
  place: ['place'],
  landscape: ['landscape'],
  items: ['items'],
};

export const saveImageTagToDatabase = async (dispatch: AppDispatch, data: Image): Promise<void> => {
  const existTags: ImageTagEntity[] = await window.db.queryToArray(
    `SELECT * FROM image_tags WHERE imageId = ${data.id}`,
  );
  const removeTags: TagEntity[] = [];
  const addTags: TagEntity[] = [];
  const allTags = store.getState().tagList.items;
  const newTags: typeof allTags = {};
  const entities = (data.people as { idOfImage: number }[])
    .concat(data.backgrounds)
    .concat([data.information].filter((i) => i !== undefined));

  for (const entity of entities) {
    for (const [category, columns] of Object.entries(tagCategories)) {
      const categoryTags = addTags
        .concat(removeTags)
        .filter((t) => t.category === category)
        .concat(allTags[category] ?? [])
        .concat(newTags[category] ?? []);
      const tagNames = pickTagNames(columns.map((c) => entity[c]).join('\n'));

      const currentPairs = existTags
        .filter((t) => t.elementId === entity.idOfImage)
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
      if (category === 'faceEmotion') {
        console.log('removes');
        console.dir(removes);
        console.log('adds');
        console.dir(adds);
      }

      for (const remove of removes) {
        remove.tag = { ...remove.tag, usage: remove.tag.usage - 1 };
        if (!removeTags.some((t) => t.id === remove.tag.id)) {
          removeTags.push(remove.tag);
        }
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
          if (!(newTags[category] ??= []).some((t) => t.id === newTag.id)) {
            newTags[category].push(newTag);
          }
        } else {
          add.tag = { ...add.tag, usage: add.tag.usage + 1 };
          await window.db.query(`UPDATE tags SET usage = ${add.tag.usage} WHERE id = ${add.tag.id}`);
        }

        const newImageTag: ImageTagEntity = {
          id: 0,
          tagId: add.tag.id,
          imageId: data.id,
          elementId: entity.idOfImage,
        };
        newImageTag.id = await saveDatabaseEntity('image_tags', newImageTag);
        add.imageTag = newImageTag;

        if (!addTags.some((t) => t.id === add.tag!.id)) {
          addTags.push(add.tag);
        }
      }
    }
  }

  // 要素を削除していた場合
  const entityIds = entities.map((e) => e.idOfImage);
  const itemsById = store.getState().tagList.itemsById;
  const removeImageTags = existTags.filter((t) => !entityIds.includes(t.elementId));
  for (const imageTag of removeImageTags) {
    const tag = addTags.concat(removeTags).find((t) => t.id === imageTag.tagId) ?? itemsById[imageTag.tagId];
    if (!tag) continue;

    const addTagsIndex = addTags.findIndex((t) => t.id === imageTag.tagId);
    const removeTagsIndex = removeTags.findIndex((t) => t.id === imageTag.tagId);

    if (addTagsIndex >= 0) {
      addTags.splice(addTagsIndex, 1);
      removeTags.unshift({ ...tag, usage: tag.usage - 1 });
    } else if (removeTagsIndex >= 0) {
      removeTags[removeTagsIndex] = { ...tag, usage: tag.usage - 1 };
    } else {
      // itemsById[imageTag.tagId] に存在
      removeTags.unshift({ ...tag, usage: tag.usage - 1 });
    }
  }
  if (removeImageTags.length > 0) {
    await window.db.query(
      `DELETE FROM image_tags WHERE id IN (${removeImageTags.map((t) => t.id).join(', ')})`,
    );
  }

  for (const remove of removeTags) {
    if (remove.usage <= 0) {
      await window.db.query(`DELETE FROM tags WHERE id = ${remove.id}`);
    } else {
      await window.db.query(`UPDATE tags SET usage = ${remove.usage} WHERE id = ${remove.id}`);
    }
  }

  dispatch(updateTags({ tags: addTags.concat(removeTags) }));
};

export const createImageByBuffer = async (
  dispatch: AppDispatch,
  ext: string,
  buffer: ArrayBuffer,
  informationTemplate?: Partial<ImageInformationEntity>,
): Promise<void> => {
  if (!ext || !['png', 'jpg', 'jpeg', 'bmp', 'tiff', 'gif', 'webp'].includes(ext)) return;

  const currentDirectory = store.getState().system.currentDirectory;
  const folderName = store.getState().systemSetting.databaseValues.folderName;

  const tmpFileName = `${parseInt(`${Math.random() * 1000000}`)}.${ext}`;
  const tmpPath = `${currentDirectory}/${folderName}/tmp/${tmpFileName}`;
  window.file.saveFromBuffer(tmpPath, buffer);

  const size = imageSize(new Uint8Array(buffer));
  if (!size.width || !size.height) return;

  const image: ImageEntity = {
    id: 0,
    fileName: '',
    width: size.width,
    height: size.height,
    peopleSize: 0,
    backgroundsSize: 0,
    evaluation: 0,
    deleteFlag: 0,
  };
  image.id = await saveDatabaseEntity('images', image);
  image.fileName = `${image.id}.${ext}`;
  const filePath = `${currentDirectory}/${folderName}/images/${image.fileName}`;
  await window.db.query(`UPDATE images SET fileName='${image.fileName}' WHERE id = ${image.id}`);

  const information: ImageInformationEntity = {
    id: 0,
    imageId: image.id,
    idOfImage: 1,
    evaluation: 0,
    author: '',
    memo: '',
    url: '',
    ...informationTemplate,
  };
  information.id = await saveDatabaseEntity('informations', information);

  dispatch(addNewImage({ image, information }));

  await window.file.copy(tmpPath, filePath);
  await window.file.delete(tmpPath);
};

export const preremoveImageFromDatabase = async (dispatch: AppDispatch, imageId: number): Promise<void> => {
  await window.db.query(`UPDATE images SET deleteFlag = 1 WHERE id = ${imageId}`);

  dispatch(deleteImage({ imageId }));
  dispatch(deleteImageTabs({ imageId }));
};

export const removeImagesFromDatabaseBeforeInitialization = async (): Promise<void> => {
  const images: { id: number }[] = await window.db.queryToArray('SELECT id FROM images WHERE deleteFlag = 1');

  for (const image of images) {
    await removeImageFromDatabaseBeforeInitialization(image.id);
  }
};

const removeImageFromDatabaseBeforeInitialization = async (imageId: number): Promise<void> => {
  const db = window.db;

  const image: { fileName: string } = await db.queryToOneObject(
    `SELECT fileName FROM images WHERE id = ${imageId}`,
  );

  const imageTags: { tagId: number }[] = await db.queryToArray(
    `SELECT tagId FROM image_tags WHERE imageId = ${imageId}`,
  );
  if (imageTags.length > 0) {
    const tags: { id: number; usage: number }[] = await db.queryToArray(
      `SELECT id, usage FROM tags WHERE id IN (${imageTags.map((t) => t.tagId).join(', ')})`,
    );
    const deleteTagIds: number[] = [];
    for (const tag of tags) {
      const removeSize = imageTags.filter((t) => t.tagId === tag.id).length;
      const newUsage = tag.usage - removeSize;

      if (newUsage <= 0) {
        deleteTagIds.push(tag.id);
      } else {
        await db.query(`UPDATE tags SET usage = ${newUsage} WHERE id = ${tag.id}`);
      }
    }
    if (deleteTagIds.length > 0) {
      await db.query(`DELETE FROM tags WHERE id IN (${deleteTagIds.join(', ')})`);
    }

    await db.query(`DELETE FROM image_tags WHERE imageId = ${imageId}`);
  }

  await db.query(`DELETE FROM people WHERE imageId = ${imageId}`);
  await db.query(`DELETE FROM backgrounds WHERE imageId = ${imageId}`);
  await db.query(`DELETE FROM informations WHERE imageId = ${imageId}`);
  await db.query(`DELETE FROM images WHERE id = ${imageId}`);

  const currentDirectory = store.getState().system.currentDirectory;
  const folderName = store.getState().systemSetting.databaseValues.folderName;
  window.file.delete(`${currentDirectory}/${folderName}/images/${image.fileName}`);
};

/*
const distinct = (arr: number[]): number[] => {
  return [...new Set(arr)];
};
*/

export const searchImage = async (query: ImageSearchQuery): Promise<number[] | null> => {
  const db = window.db;
  let querySet = false;
  let imageIds: number[] = [];

  const personQuery = Object.entries(query.person)
    .map((entry) => {
      const [key, value] = entry;

      if (
        [
          'faceHorizontal',
          'faceVertical',
          'chestHorizontal',
          'chestVertical',
          'bodyWear',
          'oppaiSize',
          'waistHorizontal',
        ].includes(key)
      ) {
        if (Array.isArray(value) && value.length > 0) {
          return `${key} IN (${value.join(', ')})`;
        }
      }

      if (['bodySpine'].includes(key)) {
        const and = query.person[`${key}OrAnd`] === 'and';

        if (Array.isArray(value) && value.length > 0) {
          const sum = value.reduce((r, v) => r + v, 0);
          if (and) {
            return `(${key} & ${sum}) = ${sum}`;
          } else {
            return `(${key} & ${sum})`;
          }
        }
      }

      return null;
    })
    .filter((q) => q)
    .join(' AND ');

  const personTagIds = Object.entries(query.person)
    .map((entry) => {
      const [key, value] = entry;

      if (['bodyOthers'].includes(key)) {
        return value;
      }

      return null;
    })
    .filter((q) => q)
    .flat();
  const personTagQuery = personTagIds.length > 0 ? `tags.tagId IN (${personTagIds.join(',')})` : '';
  const whereQuery =
    personQuery.length > 0 || personTagIds.length > 0
      ? `WHERE ${[personQuery, personTagQuery].filter((q) => q).join(' AND ')}`
      : '';
  const imageTagsJoin =
    personTagIds.length > 0
      ? `JOIN image_tags AS tags ON tags.imageId = people.imageId AND tags.elementId = people.idOfImage`
      : '';

  if (personQuery.length > 0 || personTagIds.length > 0) {
    const people: { imageId: number }[] = await db.queryToArray(
      `SELECT DISTINCT people.imageId FROM people ${imageTagsJoin} ${whereQuery}`,
    );
    console.log(`SELECT DISTINCT people.imageId FROM people ${imageTagsJoin} ${whereQuery}`);
    imageIds = people.map((p) => p.imageId);
    querySet = true;
  }

  return querySet ? imageIds : null;
};
