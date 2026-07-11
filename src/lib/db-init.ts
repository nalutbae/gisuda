import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

export function initDatabase(db: Database.Database): void {
  // Check if scraps table has the new columns
  const columns = db.prepare("PRAGMA table_info(scraps)").all() as { name: string }[];
  const columnNames = columns.map(c => c.name);

  if (columnNames.length === 0) {
    // Table doesn't exist yet — create from schema
    const schemaPath = path.join(process.cwd(), 'db', 'schema-sqlite.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      db.exec(schema);
      console.log('[DB] Schema initialized from schema-sqlite.sql');
    }
  } else {
    // Table exists — add new columns if missing
    const newColumns = [
      { name: 'region', sql: 'ALTER TABLE scraps ADD COLUMN region TEXT' },
      { name: 'translation', sql: 'ALTER TABLE scraps ADD COLUMN translation TEXT' },
      { name: 'commentary', sql: 'ALTER TABLE scraps ADD COLUMN commentary TEXT' },
      { name: 'deleted_at', sql: "ALTER TABLE scraps ADD COLUMN deleted_at TEXT DEFAULT NULL" },
    ];
    for (const col of newColumns) {
      if (!columnNames.includes(col.name)) {
        try {
          db.exec(col.sql);
          console.log(`[DB] Added column: ${col.name} to scraps`);
        } catch (e: any) {
          if (!e.message.includes('duplicate column')) throw e;
        }
      }
    }

    // Check posts table for deleted_at column
    const postColumns = db.prepare("PRAGMA table_info(posts)").all() as { name: string }[];
    const postColumnNames = postColumns.map(c => c.name);
    const postNewColumns = [
      { name: 'deleted_at', sql: "ALTER TABLE posts ADD COLUMN deleted_at TEXT DEFAULT NULL" },
    ];
    for (const col of postNewColumns) {
      if (!postColumnNames.includes(col.name)) {
        try {
          db.exec(col.sql);
          console.log(`[DB] Added column: ${col.name} to posts`);
        } catch (e: any) {
          if (!e.message.includes('duplicate column')) throw e;
        }
      }
    }
  }
}