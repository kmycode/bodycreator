export const generateSqlForUpdateEntity = (tableName: string, entity: { id: number }): string => {
  const columns = Object.entries(entity)
    .map((entry) => {
      const [key, value] = entry;
      if (['string'].includes(typeof value)) {
        return `${key} = '${value}'`;
      }
      return `${key} = ${value}`;
    })
    .join(', ');
  return `UPDATE ${tableName} SET ${columns} WHERE id = ${entity.id}`;
};

export const generateSqlForInsertEntity = (tableName: string, entity: object): string => {
  const columns = [] as string[];
  const values = [] as string[];
  for (const [key, value] of Object.entries(entity)) {
    if (key === 'id') continue;

    columns.push(key);
    if (['string'].includes(typeof value)) {
      values.push(`'${value}'`);
    } else {
      values.push(`${value}`);
    }
  }

  return `INSERT INTO ${tableName}(${columns.join(', ')}) VALUES(${values.join(', ')})`;
};

export const saveDatabaseEntity = async (
  tableName: string,
  entity: { id: number; imageId?: number },
): Promise<number> => {
  const db = window.db;

  if (entity.id) {
    await db.query(generateSqlForUpdateEntity(tableName, entity));
    return entity.id;
  } else {
    await db.query(generateSqlForInsertEntity(tableName, entity));
    const last = (await db.queryToOneObject(
      `SELECT id FROM ${tableName} WHERE ROWID = last_insert_rowid()`,
    )) as { id: number };
    if (last) {
      return last.id;
    }
  }

  console.dir(entity);
  throw new Error('Do not reach here!');
};
