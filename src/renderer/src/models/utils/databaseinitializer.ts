
export const createDatabase = async () => {
  const db = window.db;

  await db.query('CREATE TABLE IF NOT EXISTS my_memo ([id] integer primary key autoincrement, [memo] text, [date_time] datetime)');
};

export const loadDatabase = async () => {
  const db = window.db;

  await createDatabase();
};
