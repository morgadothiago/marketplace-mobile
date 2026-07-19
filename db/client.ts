import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'marketplace.db';

/**
 * Migrations versionadas via `PRAGMA user_version`. Cada entrada do array
 * corresponde à versão `index + 1`; ao abrir o banco aplicamos apenas as
 * migrations ainda não executadas naquele dispositivo.
 *
 * O conteúdo SQL espelha `db/schema.sql` (mantido como documentação de
 * referência do modelo de dados completo do MVP).
 */
const MIGRATIONS: string[] = [
  `
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

  -- Tabela interna (não é uma entidade de negócio do plan.md): guarda o
  -- id do perfil que pertence a ESTE dispositivo, para diferenciar "meu
  -- perfil" de perfis de seed/terceiros que também moram em \`profiles\`.
  CREATE TABLE IF NOT EXISTS app_meta (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );
  `,
];

const LOCAL_PROFILE_ID_KEY = 'local_profile_id';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;

  for (let version = currentVersion; version < MIGRATIONS.length; version += 1) {
    const migration = MIGRATIONS[version];
    if (!migration) {
      continue;
    }
    await db.execAsync(migration);
    await db.execAsync(`PRAGMA user_version = ${version + 1}`);
  }
}

/**
 * Ponto único de acesso ao SQLite local. Nenhum outro módulo deve chamar
 * `expo-sqlite` diretamente — sempre passar por `repositories/*.ts`, que
 * dependem apenas de `getDatabase()`. Isso mantém a porta aberta para
 * trocar a implementação por um cliente HTTP no futuro sem tocar em UI.
 */
export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      await db.execAsync('PRAGMA journal_mode = WAL');
      await db.execAsync('PRAGMA foreign_keys = ON');
      await migrate(db);
      return db;
    })();
  }
  return dbPromise;
}

/** Uso exclusivo de testes/dev tools — força reabertura do banco. */
export function __resetDatabaseForTests(): void {
  dbPromise = null;
}

/**
 * Id do perfil que pertence a este dispositivo (ou `null` se o onboarding
 * ainda não foi concluído). Perfis de seed/terceiros nunca são retornados
 * aqui, mesmo que tenham sido inseridos antes do perfil real do usuário.
 */
export async function getLocalProfileId(): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_meta WHERE key = ?',
    LOCAL_PROFILE_ID_KEY,
  );
  return row?.value ?? null;
}

export async function setLocalProfileId(profileId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO app_meta (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    LOCAL_PROFILE_ID_KEY,
    profileId,
  );
}
