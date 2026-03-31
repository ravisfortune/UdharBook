import * as SQLite from 'expo-sqlite';

export async function initDB(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync('udharbook.db');

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      avatar_color TEXT DEFAULT '#000666',
      avatar_letter TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      synced INTEGER DEFAULT 0,
      deleted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      contact_id TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      note TEXT,
      date INTEGER NOT NULL,
      split_id TEXT,
      created_at INTEGER NOT NULL,
      synced INTEGER DEFAULT 0,
      deleted INTEGER DEFAULT 0,
      FOREIGN KEY (contact_id) REFERENCES contacts(id)
    );

    CREATE TABLE IF NOT EXISTS splits (
      id TEXT PRIMARY KEY,
      title TEXT,
      emoji TEXT DEFAULT '💸',
      split_type TEXT NOT NULL,
      split_method TEXT,
      total_amount REAL NOT NULL,
      created_at INTEGER NOT NULL,
      settled INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS split_members (
      id TEXT PRIMARY KEY,
      split_id TEXT NOT NULL,
      contact_id TEXT NOT NULL,
      amount REAL NOT NULL,
      percentage REAL,
      paid INTEGER DEFAULT 0,
      FOREIGN KEY (split_id) REFERENCES splits(id),
      FOREIGN KEY (contact_id) REFERENCES contacts(id)
    );

    CREATE INDEX IF NOT EXISTS idx_txn_contact ON transactions(contact_id);
    CREATE INDEX IF NOT EXISTS idx_txn_date ON transactions(date DESC);
  `);

  return db;
}
