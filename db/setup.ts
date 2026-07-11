// 지수다(gisuda) — DB 초기화 + 시드 데이터
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { v4 as uuid } from "uuid";
import bcrypt from "bcryptjs";

const DB_PATH = path.join(process.cwd(), "dev.db");
const SCHEMA_PATH = path.join(process.cwd(), "db", "schema-sqlite.sql");

function main() {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // 스키마 초기화
  const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
  db.exec(schema);
  console.log("[DB] 스키마 초기화 완료");

  // 슈퍼 관리자 계정 (이메일: admin@gisuda.kr, 비번: vudghkakstp`)
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get("admin@gisuda.kr");
  if (!existing) {
    const id = uuid();
    const hash = bcrypt.hashSync("vudghkakstp`", 10);
    db.prepare("INSERT INTO users (id, email, name, password_hash, role) VALUES (?, ?, ?, ?, ?)")
      .run(id, "admin@gisuda.kr", "슈퍼관리자", hash, "SUPER_ADMIN");
    console.log(`[DB] 슈퍼관리자 계정 생성: admin@gisuda.kr / vudghkakstp\` (ID: ${id})`);
  } else {
    console.log("[DB] 슈퍼관리자 계정 이미 존재");
  }

  db.close();
  console.log("[DB] 설정 완료");
}

main();