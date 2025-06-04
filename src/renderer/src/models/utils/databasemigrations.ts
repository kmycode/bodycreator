type MigrationItem = { databaseVersion: number; codes: ((db: DbApi) => Promise<void>)[] };

export const databaseMigrations: MigrationItem[] = [];
