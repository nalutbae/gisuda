-- ============================================================
-- 지수다(gisuda) — 데이터베이스 스키마 (SQLite 개발용)
-- 지구촌 뉴스 스크랩 공유 소모임
-- ============================================================

-- 사용자 (SUPER_ADMIN > ADMIN > USER)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'USER')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- 뉴스 스크랩
CREATE TABLE IF NOT EXISTS scraps (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scrap_date TEXT NOT NULL,       -- 회의 날짜 (YYYY-MM-DD)
  news_date TEXT NOT NULL,        -- 뉴스 날짜 (YYYY-MM-DD)
  title TEXT NOT NULL,            -- 뉴스 제목
  link TEXT NOT NULL,             -- 뉴스 링크 URL
  newspaper TEXT,                 -- 신문사
  region TEXT,                    -- 지역 (예: 중동, 유럽, 아시아)
  keywords TEXT,                  -- 키워드 (쉼표 구분)
  summary TEXT,                   -- 요약
  translation TEXT,               -- 번역
  commentary TEXT,               -- 한줄논평
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_scraps_user_id ON scraps (user_id);
CREATE INDEX IF NOT EXISTS idx_scraps_scrap_date ON scraps (scrap_date);
CREATE INDEX IF NOT EXISTS idx_scraps_news_date ON scraps (news_date);

-- 게시판
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_notice INTEGER NOT NULL DEFAULT 0,  -- 공지사항 여부
  is_pinned INTEGER NOT NULL DEFAULT 0,  -- 상단 고정 여부
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts (user_id);
CREATE INDEX IF NOT EXISTS idx_posts_notice ON posts (is_notice, is_pinned);

-- 캘린더 이벤트 (공지/일정)
CREATE TABLE IF NOT EXISTS calendar_events (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,               -- 이벤트 날짜 (YYYY-MM-DD)
  title TEXT NOT NULL,
  content TEXT,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events (date);