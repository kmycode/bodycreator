import {
  generateInitialImageBackgroundEntity,
  generateInitialImageEntity,
  generateInitialImageInformationEntity,
  generateInitialImagePersonEntity,
  generateInitialImageTagEntity,
  ImageEntity,
  setImages,
} from '../entities/image_list';
import {
  DEFAULT_FOLDER_NAME,
  generateInitialSettingEntity,
  setSettings,
  SettingEntity,
} from '../entities/system_setting';
import { generateInitialTagEntity, setTags, TagEntity } from '../entities/tag_list';
import { AppDispatch } from '../store';
import {
  generateSqlForCreateIndex,
  generateSqlForCreateTable,
  generateSqlForInsertEntity,
} from './database_util';
import { databaseMigrations } from './database_migrations';
import { removeImagesFromDatabaseBeforeInitialization } from './image_serializer';

const createDatabase = async (): Promise<void> => {
  const db = window.db;

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

  await db.query(generateSqlForCreateIndex('image_tags', 'imageId'));

  const settingExists = await db.queryToOneObject('SELECT 1 FROM settings LIMIT 1');
  if (!settingExists) {
    await db.query(
      generateSqlForInsertEntity('settings', {
        key: 'databaseVersion',
        stringValue: '',
        numberValue: databaseMigrations[databaseMigrations.length - 1].databaseVersion,
        valueType: 1,
      }),
    );
    await db.query(
      generateSqlForInsertEntity('settings', {
        key: 'folderName',
        stringValue: DEFAULT_FOLDER_NAME,
        numberValue: 0,
        valueType: 2,
      }),
    );
  }
};

const migrateDatabase = async (): Promise<void> => {
  const db = window.db;

  const versionSetting = (await db.queryToOneObject(
    "SELECT numberValue FROM settings WHERE key = 'databaseVersion'",
  )) as SettingEntity;
  if (!versionSetting?.numberValue) {
    return;
  }

  let maxValue = 0;

  for (const migration of databaseMigrations.filter((m) => m.databaseVersion > versionSetting.numberValue)) {
    for (const process of migration.codes) {
      await process(db);
    }

    if (maxValue < migration.databaseVersion) {
      maxValue = migration.databaseVersion;
    }
  }

  if (maxValue) {
    await db.query(`UPDATE settings SET numberValue = ${maxValue} WHERE key = 'databaseVersion'`);
  }
};

const createRepository = async (folderName: string): Promise<void> => {
  const currentDirectory = await window.file.getCurrentDirectoryFullPath();

  await window.file.mkdir(`${currentDirectory}/${folderName}/images`);
  await window.file.mkdir(`${currentDirectory}/${folderName}/tmp`);
};

export const loadDatabase = async (dispatch: AppDispatch): Promise<void> => {
  const db = window.db;

  await createDatabase();
  await migrateDatabase();

  await removeImagesFromDatabaseBeforeInitialization();

  const images = (await db.queryToArray('SELECT * FROM images')) as ImageEntity[];
  const settings = (await db.queryToArray('SELECT * FROM settings')) as SettingEntity[];
  const appSettings = (await db.queryToArray('SELECT * FROM app_settings', {
    destination: 'app',
  })) as SettingEntity[];
  const tags = (await db.queryToArray('SELECT * FROM tags')) as TagEntity[];

  dispatch(setSettings({ database: settings, app: appSettings }));
  await createRepository(settings.find((s) => s.key === 'folderName')?.stringValue ?? DEFAULT_FOLDER_NAME);

  dispatch(setImages({ images }));
  dispatch(setTags({ tags }));
};
