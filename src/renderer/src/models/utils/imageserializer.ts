import {
  addNewImage,
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
  personItem: ['personItem'],
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
        remove.tag = { ...remove.tag, usage: remove.tag.usage - 1 };
        removeTags.push(remove.tag);
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

        addTags.push(add.tag);
      }
    }
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
): Promise<void> => {
  if (!ext || !['png', 'jpg', 'jpeg', 'bmp', 'tiff', 'gif', 'webp'].includes(ext)) return;

  const currentDirectory = store.getState().system.currentDirectory;

  const tmpFileName = `${parseInt(`${Math.random() * 1000000}`)}.${ext}`;
  const tmpPath = `${currentDirectory}/app_repository/tmp/${tmpFileName}`;
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
  };
  image.id = await saveDatabaseEntity('images', image);
  image.fileName = `${image.id}.${ext}`;
  const filePath = `${currentDirectory}/app_repository/images/${image.fileName}`;
  await window.db.query(`UPDATE images SET fileName='${image.fileName}' WHERE id = ${image.id}`);

  const information: ImageInformationEntity = {
    id: 0,
    imageId: image.id,
    evaluation: 0,
    author: '',
    memo: '',
    url: '',
  };
  information.id = await saveDatabaseEntity('informations', information);

  dispatch(addNewImage({ image, information }));

  await window.file.copy(tmpPath, filePath);
  await window.file.delete(tmpPath);
};
