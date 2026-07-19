/**
 * Banco em memória que implementa a mesma interface usada por
 * `db/client.ts` (`execAsync`/`runAsync`/`getAllAsync`/`getFirstAsync`),
 * suficiente para exercitar exatamente as queries emitidas pelos
 * repositories (`profiles`, `listings`, `messages`, `reviews`, `app_meta`).
 *
 * Não é um motor SQL genérico: interpreta apenas os formatos de query
 * usados hoje nos repositories (ver `repositories/*.repository.ts` e
 * `db/client.ts`). Isso evita depender do runtime nativo do `expo-sqlite`
 * (que não roda fora de um dispositivo/simulador) mantendo cobertura real
 * da lógica de mapeamento de linha e das regras de negócio (soft-delete,
 * upsert de `app_meta`, agregação de reviews).
 */

type Row = Record<string, unknown>;

export type FakeDatabase = {
  tables: Record<string, Row[]>;
  execAsync: (sql: string) => Promise<void>;
  runAsync: (sql: string, ...params: unknown[]) => Promise<void>;
  getFirstAsync: <T extends Row>(sql: string, ...params: unknown[]) => Promise<T | null>;
  getAllAsync: <T extends Row>(sql: string, ...params: unknown[]) => Promise<T[]>;
};

function extractTableName(sql: string): string {
  const match = sql.match(/(?:FROM|INTO|UPDATE)\s+(\w+)/i);
  if (!match || !match[1]) {
    throw new Error(`fakeDatabase: não foi possível extrair o nome da tabela de: ${sql}`);
  }
  return match[1];
}

export function createFakeDatabase(): FakeDatabase {
  const tables: Record<string, Row[]> = {
    profiles: [],
    listings: [],
    messages: [],
    reviews: [],
    app_meta: [],
  };

  function insert(sql: string, params: unknown[]): void {
    const table = extractTableName(sql);
    const columnsMatch = sql.match(/\(([^)]+)\)\s*VALUES/i);
    if (!columnsMatch || !columnsMatch[1]) {
      throw new Error(`fakeDatabase: não foi possível parsear colunas do INSERT: ${sql}`);
    }
    const columns = columnsMatch[1].split(',').map((column) => column.trim());

    if (/ON CONFLICT/i.test(sql)) {
      const [key, value] = params;
      const existing = tables[table]!.find((row) => row.key === key);
      if (existing) {
        existing.value = value;
      } else {
        tables[table]!.push({ key, value });
      }
      return;
    }

    const row: Row = {};
    columns.forEach((column, index) => {
      row[column] = params[index];
    });
    tables[table]!.push(row);
  }

  function update(sql: string, params: unknown[]): void {
    const table = extractTableName(sql);
    const setMatch = sql.match(/SET\s+(.+?)\s+WHERE/is);
    if (!setMatch || !setMatch[1]) {
      throw new Error(`fakeDatabase: não foi possível parsear SET do UPDATE: ${sql}`);
    }
    const columns = setMatch[1]
      .split(',')
      .map((assignment) => assignment.split('=')[0]!.trim());
    const id = params[params.length - 1];
    const row = tables[table]!.find((candidate) => candidate.id === id);
    if (!row) {
      return;
    }
    columns.forEach((column, index) => {
      row[column] = params[index];
    });
  }

  function remove(sql: string, params: unknown[]): void {
    const table = extractTableName(sql);
    const [id] = params;
    tables[table] = tables[table]!.filter((row) => row.id !== id);
  }

  return {
    tables,
    execAsync: async () => {},
    runAsync: async (sql, ...params) => {
      if (/^\s*INSERT/i.test(sql)) {
        insert(sql, params);
      } else if (/^\s*UPDATE/i.test(sql)) {
        update(sql, params);
      } else if (/^\s*DELETE/i.test(sql)) {
        remove(sql, params);
      }
    },
    getFirstAsync: async <T extends Row>(sql: string, ...params: unknown[]) => {
      const table = extractTableName(sql);

      if (/AVG\(stars\)/i.test(sql)) {
        const [revieweeId] = params;
        const rows = tables.reviews!.filter((row) => row.reviewee_id === revieweeId);
        if (rows.length === 0) {
          return { average: null, count: 0 } as unknown as T;
        }
        const total = rows.reduce((sum, row) => sum + (row.stars as number), 0);
        return { average: total / rows.length, count: rows.length } as unknown as T;
      }

      if (/WHERE\s+reviewer_id\s*=\s*\?\s+AND\s+listing_id\s*=\s*\?/i.test(sql)) {
        const [reviewerId, listingId] = params;
        const row = tables[table]!.find(
          (candidate) => candidate.reviewer_id === reviewerId && candidate.listing_id === listingId,
        );
        return (row as T) ?? null;
      }

      if (/WHERE\s+key\s*=\s*\?/i.test(sql)) {
        const [key] = params;
        const row = tables[table]!.find((candidate) => candidate.key === key);
        return (row as T) ?? null;
      }

      if (/WHERE\s+id\s*=\s*\?/i.test(sql)) {
        const [id] = params;
        const row = tables[table]!.find((candidate) => candidate.id === id);
        return (row as T) ?? null;
      }

      return null;
    },
    getAllAsync: async <T extends Row>(sql: string, ...params: unknown[]) => {
      const table = extractTableName(sql);
      let rows = [...tables[table]!];

      if (/status\s*=\s*'active'/i.test(sql)) {
        rows = rows.filter((row) => row.status === 'active');
      }
      if (/owner_id\s*=\s*\?/i.test(sql)) {
        rows = rows.filter((row) => row.owner_id === params[0]);
      }
      if (/status\s*!=\s*'deleted'/i.test(sql)) {
        rows = rows.filter((row) => row.status !== 'deleted');
      }
      if (/listing_id\s*=\s*\?/i.test(sql)) {
        rows = rows.filter((row) => row.listing_id === params[0]);
      }
      if (/reviewee_id\s*=\s*\?/i.test(sql)) {
        rows = rows.filter((row) => row.reviewee_id === params[0]);
      }

      if (/ORDER BY created_at DESC/i.test(sql)) {
        rows.sort((a, b) => ((a.created_at as string) < (b.created_at as string) ? 1 : -1));
      } else if (/ORDER BY created_at ASC/i.test(sql)) {
        rows.sort((a, b) => ((a.created_at as string) < (b.created_at as string) ? -1 : 1));
      }

      return rows as T[];
    },
  };
}
