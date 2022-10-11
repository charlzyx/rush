import Database from 'tauri-plugin-sql-api';
import { DROP, INIT, INSERT, TABLE } from './init';
import { PageQuery, StoreItem } from '@/shared/http';
import { makesure } from '../plugins/fs';
import { path } from '@tauri-apps/api';
import { nanoid } from 'nanoid';

export class DB {
  static db: null | Database = null;
  static async connect(): Promise<Database> {
    try {
      const home = await path.homeDir();
      const workdir = await path.join(home, '.rush');
      await makesure(workdir);
      const dbfile = await path.join(workdir, 'sqlite_rush.db');
      DB.db = await Database.load(dbfile);
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
      ...data,
      create_time: +new Date(),
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
