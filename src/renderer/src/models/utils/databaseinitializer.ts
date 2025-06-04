export const createDatabase = async (): Promise<void> => {
  const db = window.db;

  await db.query(
    'CREATE TABLE IF NOT EXISTS my_memo ([id] integer primary key autoincrement, [memo] text, [date_time] datetime)',
  );
};

export const loadDatabase = async (): Promise<void> => {
  // const db = window.db;

  await createDatabase();
};
