import * as SQLite from 'expo-sqlite';
import { initDB } from './schema';

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (!_db) {
    _db = await initDB();
  }
  return _db;
}
