import pg from "pg"

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
})

export async function query<T extends pg.QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const result = await pool.query<T>(text, params)
  return result.rows
}
