import Database from 'tauri-plugin-sql-api';
import { DROP, INIT, TABLE } from './init';
import { PageQuery, StoreItem } from '@/shared/typings';
import { path, shell } from '@tauri-apps/api';
import { nanoid } from 'nanoid';

export class DB {
  static async open() {
    const appDir = await path.appDir();
    shell.open(appDir);
  }

  static db: null | Database = null;

  static async connect(): Promise<Database> {
    try {
      DB.db = await Database.load('sqlite:rush.db');
      console.log('DB connect Success!');
      return DB.db;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  static async init() {
    if (DB.db) {
      return await DB.db.execute(INIT);
    } else {
      return Promise.reject('DB not connected.');
    }
  }

  static async remove(data: StoreItem) {
    if (!DB.db) {
      return Promise.reject('DB not connected.');
    }

    const sql = `DELETE FROM ${TABLE} WHERE scope = $1 AND alias = $2 AND id = $3`;
    const ret = await DB.db.execute(sql, [data.scope, data.alias, data.id]);
    return ret;
  }

  static async sync(data: StoreItem[]) {
    if (!DB.db) {
      return Promise.reject('DB not connected.');
    }
    console.log('batch', data);
    const batch = data.map((item) => {
      const id = `${+new Date()}_${nanoid()}`;
      const { scope, alias, name, url, hash, extra, create_time } = item;
      const time =
        !create_time || Number.isNaN(create_time) ? +new Date() : create_time;

      const scopeUnique = `${scope}_${alias}_${hash}`;
      return `INSERT OR REPLACE INTO ${TABLE}
(id, scope, alias, name, url, extra, hash, create_time)
VALUES('${id}', '${scope}', '${alias}', '${name}', '${url}', '${extra}', '${scopeUnique}', ${time});`;
    });
    const sql = `
${batch.join('\n')}
    `.trim();
    console.log('sync sql', sql);
    const ret = await DB.db.execute(sql);
    return ret;
  }

  static async insert(data: Omit<StoreItem, 'id'>) {
    if (!DB.db) {
      return Promise.reject('DB not connected.');
    }

    const id = `${+new Date()}_${nanoid()}`;

    const sql = `INSERT INTO ${TABLE} (id, scope, alias, name, url, extra, create_time) VALUES($1, $2, $3, $4, $5, $6, $7)`;

    const ret = await DB.db.execute(sql, [
      id,
      data.scope,
      data.alias,
      data.name,
      data.url,
      data.extra,
      +new Date(),
    ]);
    return ret;
  }

  static async update(data: Partial<StoreItem>) {
    const id = data.id;
    if (!id) {
      return Promise.reject('Cannot DELETE without id!');
    }
    if (!DB.db) {
      return Promise.reject('DB not connected.');
    }
    const cols = Object.keys(data).filter((x) => x !== 'id');

    const sql = `UPDATE ${TABLE} SET ${cols.map(
      (col, idx) => `${col} = $${idx + 1}`,
    )} WHERE id = $${cols.length + 1}`;

    const ret = await DB.db.execute(sql, [
      ...cols.map((col) => (data as any)[col]),
      id,
    ]);

    return ret;
  }

  static async drop() {
    if (!DB.db) {
      return Promise.reject('DB not connected.');
    } else {
      return DB.db.execute(DROP);
    }
  }

  static async query<T>(query: PageQuery) {
    if (!DB.db) {
      return Promise.reject('DB not connected.');
    }
    const {
      scope,
      alias,
      pageNumber = 1,
      pageSize = 10,
      endTime,
      kw,
      startTime,
    } = query;

    const offset = Math.max(pageNumber - 1, 0) * pageSize;
    const range = [
      startTime || endTime ? ' ' : null,
      startTime ? `create_time >= ${startTime}` : '',
      endTime ? `create_time <= ${endTime}` : '',
    ]
      .filter(Boolean)
      .join(' AND ');
    const like = kw && kw.trim() ? `AND name LIKE '%${kw.trim()}%'` : '';

    const sql = `
SELECT * FROM ${TABLE}
WHERE scope = $1 AND alias = $2
${range}
${like}
ORDER BY create_time DESC
LIMIT ${pageSize} OFFSET ${offset}
`
      .split('\n')
      .join(' ');
    /** COUNT(*) as total 不好用哦 */
    const count = `
SELECT id FROM ${TABLE}
WHERE scope = $1 AND alias = $2
${range}
${like}
`
      .split('\n')
      .join(' ');

    const total: { id: string }[] = await DB.db.select(count, [scope, alias]);
    const list = await DB.db.select(sql, [scope, alias]);
    const ret = { list: list as T[], total: total.length };
    console.log('query', {
      scope,
      alias,
      sql,
      count,
      ret,
    });
    return ret;
  }
}
