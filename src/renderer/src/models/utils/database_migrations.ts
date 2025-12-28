import { generateInitialImageTagEntity, ImageInformationEntity } from '../entities/image_list';
import { generateInitialTagEntity } from '../entities/tag_list';
import { generateSqlForInsertEntity } from './database_util';

type MigrationItem = { databaseVersion: number; codes: ((db: DbApi) => Promise<void>)[] };

export const databaseMigrations: MigrationItem[] = [
  {
    databaseVersion: 3,
    codes: [
      (db) => db.query('ALTER TABLE people ADD COLUMN faceDirection[integer] NOT NULL DEFAULT 0'),
      (db) => db.query('ALTER TABLE people ADD COLUMN chestDirection[integer] NOT NULL DEFAULT 0'),
      (db) => db.query('ALTER TABLE people ADD COLUMN waistDirection[integer] NOT NULL DEFAULT 0'),
    ],
  },
  {
    databaseVersion: 4,
    codes: [(db) => db.query('ALTER TABLE images ADD COLUMN deleteFlag[integer] NOT NULL DEFAULT 0')],
  },
  {
    databaseVersion: 5,
    codes: [
      async (db) => {
        await db.query('ALTER TABLE informations ADD COLUMN idOfImage[integer] NOT NULL DEFAULT 1');
        await db.query('UPDATE people SET idOfImage = idOfImage + 1');
        await db.query('UPDATE backgrounds SET idOfImage = idOfImage + 1');
        await db.query('UPDATE image_tags SET elementId = elementId + 1');
      },
    ],
  },
  {
    databaseVersion: 6,
    codes: [
      async (db) => {
        // 画像のauthorをタグ化

        const informations = (
          await db.queryToArray<ImageInformationEntity>('SELECT * FROM informations')
        ).filter((i) => i.author);

        const uniqueAuthors = Array.from(
          informations.map((i) => i.author).reduce((set, author) => set.add(author), new Set<string>()),
        );
        const authorTagIds = {};

        // まずタグの実体を追加
        for (const author of uniqueAuthors) {
          const tag = generateInitialTagEntity();
          tag.category = 'author';
          tag.name = author;
          tag.usage = informations.filter((i) => i.author === author).length;
          await db.query(generateSqlForInsertEntity('tags', tag));

          const last = (await db.queryToOneObject(
            `SELECT id FROM tags WHERE ROWID = last_insert_rowid()`,
          )) as { id: number };
          if (last) {
            authorTagIds[author] = last.id;
          }
        }

        // 次にタグを関連付ける
        for (const { imageId, idOfImage, author } of informations) {
          const tagId = authorTagIds[author];
          const imageTag = generateInitialImageTagEntity({
            imageId,
            elementId: idOfImage,
            tagId,
          });
          await db.query(generateSqlForInsertEntity('image_tags', imageTag));
        }
      },
    ],
  },
  // 最初にDBを使う場合はこのマイグレーション処理を通さず、createDatabaseで一括作成する
  // そのため、マイグレーション処理を追加する場合は初期データベース生成処理の修正も検討すること
  // （カラム追加など、修正が不要な場合もある）
];
