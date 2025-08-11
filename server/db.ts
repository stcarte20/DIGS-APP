import 'dotenv/config';
import sql from 'mssql';

const config: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || '',
  database: process.env.DB_NAME,
  options: { encrypt: (process.env.DB_ENCRYPT ?? 'true') !== 'false' }
};

let pool: sql.ConnectionPool | null = null;

export async function getPool() {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}

export async function query<T = any>(q: string, params: any[] = []): Promise<T[]> {
  const p = await getPool();
  const request = p.request();
  params.forEach((val, i) => request.input(`p${i}`, val));
  const result = await request.query(q);
  return result.recordset as T[];
}

export async function execProc<T = any>(proc: string, inputs: Record<string, any>): Promise<T[]> {
  const p = await getPool();
  const request = p.request();
  Object.entries(inputs).forEach(([k,v]) => request.input(k, v));
  const result = await request.execute(proc);
  return (result.recordset || []) as T[];
}
