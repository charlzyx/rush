import Database from 'tauri-plugin-sql-api';
import { INIT } from './init';
import type { QueryResult } from 'tauri-plugin-sql-api';

export class DB {
  static db: null | Database = null;
  static async connect(): Promise<Database> {
    try {
      DB.db = await Database.load('sqlite:test.db');
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
}
