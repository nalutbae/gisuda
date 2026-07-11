import Database from 'better-sqlite3';
import path from 'path';
import { neon } from '@neondatabase/serverless';
import { initDatabase } from './db-init';

const DB_PATH = process.env.SQLITE_PATH || path.join(process.cwd(), 'dev.db');
const USE_NEON = !!process.env.NEON_DATABASE_URL;

let _db: Database.Database | null = null;
let _sql: ReturnType<typeof neon> | null = null;

// ---------------------------------------------------------------------------
// Low-level client getters (kept for backward compat / internal use)
// ---------------------------------------------------------------------------

function getDb(): Database.Database {
  if (_db) return _db;
  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');
  initDatabase(_db);
  return _db;
}

function getSql(): ReturnType<typeof neon> {
  if (_sql) return _sql;
  if (!process.env.NEON_DATABASE_URL) throw new Error('NEON_DATABASE_URL not set');
  _sql = neon(process.env.NEON_DATABASE_URL);
  return _sql;
}

// ---------------------------------------------------------------------------
// Internal: convert "?  placeholder SQL + params array → Neon tagged-template call
// ---------------------------------------------------------------------------
function neonQuery(sqlFn: ReturnType<typeof neon>, sql: string, params: any[]) {
  // Neon's tagged-template function expects a TemplateStringsArray.
  // We convert "?  placeholders + params array → tagged-template call.
  const parts = sql.split('?') as string[] & { raw: string[] };
  parts.raw = [...parts];
  return sqlFn(parts, ...params);
}

// ---------------------------------------------------------------------------
// Unified async query helpers — same interface regardless of DB backend
// ---------------------------------------------------------------------------

/**
 * Execute a SELECT-like query and return **all** matching rows.
 *
 * @example
 * const rows = await query<User>('SELECT * FROM users WHERE role = ?', ['ADMIN']);
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  if (USE_NEON) {
    const rows = await neonQuery(getSql(), sql, params);
    return rows as T[];
  }
  return getDb().prepare(sql).all(...params) as T[];
}

/**
 * Execute a SELECT-like query and return **one** row (or undefined).
 *
 * @example
 * const user = await get<User>('SELECT * FROM users WHERE id = ?', [id]);
 */
export async function get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
  if (USE_NEON) {
    const rows = await neonQuery(getSql(), sql, params);
    return (rows as any[])[0] as T | undefined;
  }
  return getDb().prepare(sql).get(...params) as T | undefined;
}

/**
 * Execute a write query (INSERT / UPDATE / DELETE) and return void.
 *
 * @example
 * await run('INSERT INTO users (id, name) VALUES (?, ?)', [uuid(), 'Alice']);
 */
export async function run(sql: string, params: any[] = []): Promise<void> {
  if (USE_NEON) {
    await neonQuery(getSql(), sql, params);
    return;
  }
  getDb().prepare(sql).run(...params);
}

// ---------------------------------------------------------------------------
// Backward-compat exports (routes still referencing these can migrate gradually)
// ---------------------------------------------------------------------------
export { USE_NEON, getDb, getSql };