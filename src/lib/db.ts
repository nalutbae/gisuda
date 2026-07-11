import Database from 'better-sqlite3';
import path from 'path';
import { neon } from '@neondatabase/serverless';
import { initDatabase } from './db-init';

const DB_PATH = process.env.SQLITE_PATH || path.join(process.cwd(), 'dev.db');
const USE_NEON = !!process.env.NEON_DATABASE_URL;

let _db: Database.Database | null = null;

// SQLite client (development)
export function getDb(): Database.Database {
  if (_db) return _db;
  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');
  initDatabase(_db);
  return _db;
}

// Neon SQL tagged template literal (production)
export function getSql() {
  if (!process.env.NEON_DATABASE_URL) throw new Error('NEON_DATABASE_URL not set');
  return neon(process.env.NEON_DATABASE_URL);
}

export { USE_NEON };