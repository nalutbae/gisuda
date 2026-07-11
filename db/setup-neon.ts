// 지수다(gisuda) — Neon DB 초기화 + 시드 데이터
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const NEON_URL = process.env.NEON_DATABASE_URL!;
const sql = neon(NEON_URL);

async function main() {
  console.log('[Neon] 스키마 초기화 시작...');

  // 스키마 실행 (개별 CREATE TABLE IF NOT EXISTS)
  await sql`CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'USER')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS scraps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scrap_date TEXT NOT NULL,
    news_date TEXT NOT NULL,
    title TEXT NOT NULL,
    link TEXT NOT NULL,
    newspaper TEXT,
    region TEXT,
    keywords TEXT,
    summary TEXT,
    translation TEXT,
    commentary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_notice INTEGER NOT NULL DEFAULT 0,
    is_pinned INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;

  console.log('[Neon] 스키마 초기화 완료');

  // 인덱스
  await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_scraps_user_id ON scraps (user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_scraps_scrap_date ON scraps (scrap_date)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts (user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events (date)`;

  // 슈퍼 관리자 시드
  const existing = await sql`SELECT id FROM users WHERE email = 'admin@gisuda.kr'`;
  if (existing.length === 0) {
    const hash = bcrypt.hashSync('vudghkakstp`', 10);
    await sql`INSERT INTO users (email, name, password_hash, role) VALUES ('admin@gisuda.kr', '슈퍼관리자', ${hash}, 'SUPER_ADMIN')`;
    console.log('[Neon] 슈퍼관리자 계정 생성: admin@gisuda.kr');
  } else {
    console.log('[Neon] 슈퍼관리자 계정 이미 존재');
  }

  console.log('[Neon] 설정 완료');
}

main().catch(err => { console.error(err); process.exit(1); });