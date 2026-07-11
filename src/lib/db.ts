import Database from 'better-sqlite3';
import path from 'path';
import { initDatabase } from './db-init';

const DB_PATH = process.env.SQLITE_PATH || path.join(process.cwd(), 'dev.db');

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');
  initDatabase(_db);
  return _db;
}