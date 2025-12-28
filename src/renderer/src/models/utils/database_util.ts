export type TableName =
  | 'people'
  | 'backgrounds'
  | 'informations'
  | 'images'
  | 'tags'
  | 'image_tags'
  | 'settings'
  | 'app_settings';

export const generateSqlForCreateTable = (tableName: TableName, columns: object): string => {
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

export const generateSqlForCreateIndex = (tableName: TableName, columnNames: string | string[]): string => {
  if (typeof columnNames === 'string') {
    const indexName = `i_${tableName}_${columnNames}`;
    return `CREATE INDEX IF NOT EXISTS ${indexName} ON ${tableName}(${columnNames})`;
  } else {
    const indexName = `i_${tableName}_${columnNames.join('_')}`;
    return `CREATE INDEX IF NOT EXISTS ${indexName} ON ${tableName}(${columnNames.join(', ')})`;
  }
};

export const generateSqlForUpdateEntity = (tableName: TableName, entity: { id: number }): string => {
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

export const generateSqlForInsertEntity = (tableName: TableName, entity: object): string => {
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
  tableName: TableName,
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
