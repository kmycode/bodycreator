import {
  generateInitialImageBackgroundEntity,
  generateInitialImageEntity,
  generateInitialImageInformationEntity,
  generateInitialImagePersonEntity,
  generateInitialImageTagEntity,
  ImageEntity,
  setImages,
} from '../entities/image_list';
import { generateInitialSettingEntity, setSettings, SettingEntity } from '../entities/system_setting';
import { generateInitialTagEntity, setTags, TagEntity } from '../entities/tag_list';
import { AppDispatch } from '../store';
import { generateSqlForInsertEntity } from './dbutil';
import { databaseMigrations } from './databasemigrations';
import SampleImage1 from '@renderer/assets/images/sample1.png';
import SampleImage2 from '@renderer/assets/images/sample2.png';
import SampleImage3 from '@renderer/assets/images/sample3.png';

const createDatabase = async (): Promise<void> => {
  const db = window.db;

  const generateSqlForCreateTable = (tableName: string, columns: object): string => {
    const columnsSql = Object.entries(columns)
      .map((entry) => {
        const [key, value] = entry;
        const valueType = typeof value;
        const type = ['created_at', 'updated_at', 'date_time'].includes(key)
          ? 'datetime'
          : valueType === 'number'
            ? 'INTEGER'
            : valueType === 'string'
              ? 'TEXT'
              : 'undefined';

        if (key === 'id') {
          return '[id] INTEGER PRIMARY KEY AUTOINCREMENT';
        } else {
          return `[${key}] ${type} NOT NULL`;
        }
      })
      .join(', ');

    return `CREATE TABLE IF NOT EXISTS ${tableName} (${columnsSql})`;
  };

  await db.query(generateSqlForCreateTable('people', generateInitialImagePersonEntity()));
  await db.query(generateSqlForCreateTable('backgrounds', generateInitialImageBackgroundEntity()));
  await db.query(generateSqlForCreateTable('informations', generateInitialImageInformationEntity()));
  await db.query(generateSqlForCreateTable('images', generateInitialImageEntity()));
  await db.query(generateSqlForCreateTable('tags', generateInitialTagEntity()));
  await db.query(generateSqlForCreateTable('image_tags', generateInitialImageTagEntity()));
  await db.query(generateSqlForCreateTable('settings', generateInitialSettingEntity()));
  await db.query(generateSqlForCreateTable('app_settings', generateInitialSettingEntity()), {
    destination: 'app',
  });

  await db.query(
    generateSqlForInsertEntity('settings', {
      key: 'databaseVersion',
      stringValue: '',
      numberValue: 1,
      valueType: 1,
    }),
  );
};

const migrateDatabase = async (): Promise<void> => {
  const db = window.db;

  const versionSetting = (await db.queryToOneObject(
    "SELECT numberValue FROM settings WHERE key = 'databaseVersion'",
  )) as SettingEntity;
  if (!versionSetting) {
    return;
  }

  for (const migration of databaseMigrations) {
    if (migration.databaseVersion > versionSetting.numberValue) continue;

    for (const process of migration.codes) {
      await process(db);
    }
  }
};

const setSampleData = async (): Promise<void> => {
  const db = window.db;

  const imageExists = await db.queryToOneObject('SELECT 1 FROM images LIMIT 1');
  if (imageExists) return;

  await db.query(
    `INSERT INTO images(id, fileName, width, height, peopleSize, backgroundsSize, evaluation) VALUES(1, '1.png', 2480, 3508, 0, 0, 0)`,
  );
  await db.query(
    `INSERT INTO images(id, fileName, width, height, peopleSize, backgroundsSize, evaluation) VALUES(2, '2.png', 2480, 3508, 0, 0, 0)`,
  );
  await db.query(
    `INSERT INTO images(id, fileName, width, height, peopleSize, backgroundsSize, evaluation) VALUES(3, '3.png', 2480, 3508, 0, 0, 0)`,
  );

  await db.query(
    "INSERT INTO informations(id, imageId, evaluation, author, url, memo) VALUES(1, 1, 0, '', '', '')",
  );
  await db.query(
    "INSERT INTO informations(id, imageId, evaluation, author, url, memo) VALUES(2, 2, 0, '', '', '')",
  );
  await db.query(
    "INSERT INTO informations(id, imageId, evaluation, author, url, memo) VALUES(3, 3, 0, '', '', '')",
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const resetDatabaseForDebug = async (): Promise<void> => {
  await window.file.delete('database.sqlite3');
};

const copySampleImages = async (): Promise<void> => {
  const currentDirectory = await window.file.getCurrentDirectoryFullPath();

  try {
    await window.file.mkdir(`${currentDirectory}/app_repository/images`);
    await window.file.copy(
      `${currentDirectory}/src/renderer${SampleImage1}`,
      `${currentDirectory}/app_repository/images/1.png`,
    );
    await window.file.copy(
      `${currentDirectory}/src/renderer${SampleImage2}`,
      `${currentDirectory}/app_repository/images/2.png`,
    );
    await window.file.copy(
      `${currentDirectory}/src/renderer${SampleImage3}`,
      `${currentDirectory}/app_repository/images/3.png`,
    );
  } catch (ex) {
    console.error(ex);
  }
};

export const loadDatabase = async (dispatch: AppDispatch): Promise<void> => {
  const db = window.db;

  //await resetDatabaseForDebug();
  await copySampleImages();
  await createDatabase();
  await migrateDatabase();
  await setSampleData();

  const images = (await db.queryToArray('SELECT * FROM images')) as ImageEntity[];
  const settings = (await db.queryToArray('SELECT * FROM settings')) as SettingEntity[];
  const appSettings = (await db.queryToArray('SELECT * FROM app_settings', {
    destination: 'app',
  })) as SettingEntity[];
  const tags = (await db.queryToArray('SELECT * FROM tags')) as TagEntity[];

  dispatch(setImages({ images }));
  dispatch(setTags({ tags }));
  dispatch(setSettings({ database: settings, app: appSettings }));
};
