/*
 * Create the database tables ahead of time (the app also does it on first use).
 * Usage: DATABASE_URL=... pnpm db:setup
 */
import postgres from "postgres";
import { SCHEMA } from "../src/server/schema.ts";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Set DATABASE_URL first (see .env.example).");
  process.exit(1);
}
const sql = postgres(url, { prepare: false, onnotice: () => {} });
try {
  await sql.unsafe(SCHEMA);
  const tables = await sql`select table_name from information_schema.tables where table_schema = 'public' order by 1`;
  console.log("Database ready. Tables:", tables.map((t) => t.table_name).join(", "));
} finally {
  await sql.end();
}
