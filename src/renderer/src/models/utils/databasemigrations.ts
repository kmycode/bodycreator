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
];
