// Lightweight SQL client abstraction (placeholder for future fetch/connector implementation)
// This shim allows swapping underlying transport (direct API, Power Platform custom connector, etc.)

export interface SqlQueryResult<T = any> {
  rows: T[];
}

export interface ISqlClient {
  query<T = any>(sql: string, params?: any[]): Promise<SqlQueryResult<T>>;
}

// Temporary no-op client returning empty results; to be wired to backend API endpoints
declare const importMeta: ImportMeta;
// Vite provides import.meta.env but type may not be declared; fallback to globalThis
function getEnv(key: string, fallback?: string) {
  try {
    // @ts-ignore
    return (import.meta && import.meta.env && import.meta.env[key]) || fallback;
  } catch { return fallback; }
}
class HttpSqlClient implements ISqlClient {
  baseUrl: string;
  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || getEnv('VITE_API_URL','http://localhost:4000/api');
  }
  async query<T = any>(sql: string, params: any[] = []): Promise<SqlQueryResult<T>> {
    // Map known patterns to endpoints
  if (sql.startsWith('SELECT * FROM dbo.vw_ActiveCases')) {
      const res = await fetch(`${this.baseUrl}/cases`);
      if (!res.ok) return { rows: [] };
      const json = await res.json();
      return { rows: (json.data || []) as T[] };
    }
    if (sql.startsWith('EXEC dbo.usp_CreateCase')) {
      const body = {
        employeeId: params[0],
        employeeFirstName: params[1],
        employeeLastName: params[2],
        isPrmCase: params[3] === 1,
        dok: params[4],
        incidentDate: params[5],
        reportedDate: params[6],
        description: params[7],
        createdBy: params[8]
      };
      const res = await fetch(`${this.baseUrl}/cases`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) return { rows: [] };
      const json = await res.json();
      return { rows: (json.data || []) as T[] };
    }
    // Fallback: no-op
    return { rows: [] };
  }
}

export const sqlClient: ISqlClient = new HttpSqlClient();
