-- Schema local do MarketPlace Mobile (MVP, sem backend).
-- Todas as 4 tabelas são criadas desde já, mesmo que apenas `profiles`
-- seja consumida na Fase 1 — evita migrations incrementais dolorosas
-- quando as fases 2-6 chegarem.

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  photo_uri TEXT,
  neighborhood TEXT NOT NULL,
  lat REAL,
  lng REAL,
  external_contact TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS listings (
  id TEXT PRIMARY KEY NOT NULL,
  owner_id TEXT NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price REAL,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('product', 'service')),
  photos TEXT NOT NULL DEFAULT '[]',
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'deleted')),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY NOT NULL,
  listing_id TEXT NOT NULL REFERENCES listings(id),
  sender_id TEXT NOT NULL REFERENCES profiles(id),
  body TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY NOT NULL,
  listing_id TEXT NOT NULL REFERENCES listings(id),
  reviewer_id TEXT NOT NULL REFERENCES profiles(id),
  reviewee_id TEXT NOT NULL REFERENCES profiles(id),
  stars INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_listings_owner ON listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_messages_listing ON messages(listing_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_id);
