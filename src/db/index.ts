import Database from 'tauri-plugin-sql-api';
import { DROP, INIT, INSERT, QUERY, TABLE } from './init';
import { PageQuery, StoreItem } from '@/shared/http';
import { nanoid } from 'nanoid';

export class DB {
  static db: null | Database = null;
  static async connect(): Promise<Database> {
    try {
      DB.db = await Database.load('sqlite:test.db');
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

  static async insert(scope: string, data: StoreItem) {
    if (!DB.db) {
      return Promise.reject('DB not connected.');
    }
    const id = `${+new Date()}_${nanoid()}`;
    const sql = INSERT({
      id,
      scope,
      create_time: +new Date(),
      ...data,
    });
    return DB.db.execute(sql[0], sql[1]);
  }

  static async drop() {
    if (!DB.db) {
      return Promise.reject('DB not connected.');
    } else {
      return DB.db.execute(DROP);
    }
  }

  static async exist(scope: string, query: { md5: string }) {
    if (!DB.db) {
      return Promise.reject('DB not connected.');
    } else {
      const sql = `
SELECT * FROM ${TABLE}
WHERE scope = $1 AND md5 = $2`
        .split('\n')
        .join(' ');
      const ret = await DB.db.select(sql, [scope, query.md5]);
      return (ret as any)?.[0];
    }
  }

  static async query<T>(scope: string, query: PageQuery) {
    if (!DB.db) {
      return Promise.reject('DB not connected.');
    }
    const { pageNumber = 1, pageSize = 10, endTime, kw, startTime } = query;

    const offset = Math.max(pageNumber - 1, 0) * pageSize;
    const range = [
      startTime || endTime ? ' ' : null,
      startTime ? `create_time >= ${startTime}` : '',
      endTime ? `create_time <= ${endTime}` : '',
    ]
      .filter(Boolean)
      .join('AND');
    const like = kw && kw.trim() ? `AND name LIKE '%${kw.trim()}%'` : '';

    const sql = `
SELECT * FROM ${TABLE}
WHERE scope = $1
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
WHERE scope = $1
${range}
${like}
`
      .split('\n')
      .join(' ');
    console.log('query', {
      scope,
      sql,
      count,
    });
    const total: { id: string }[] = await DB.db.select(count, [scope]);
    const list = await DB.db.select(sql, [scope]);
    const ret = { list: list as T[], total: total.length };

    return ret;
  }
}
