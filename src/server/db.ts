import "server-only";
import postgres from "postgres";
import { env } from "./env";
import { SCHEMA } from "./schema";

/*
 * One Postgres connection pool for the process, and the tables, created on first use (so a new
 * database needs no setup step; `pnpm db:setup` does the same thing ahead of time). Every query
 * uses tagged templates, so values are always sent as parameters, never pasted into SQL.
 */

declare global {
  var __lbSql: postgres.Sql | undefined;
  var __lbSchema: Promise<void> | undefined;
}

function connect() {
  if (!env.databaseUrl) throw new Error("DATABASE_URL is not set");
  return postgres(env.databaseUrl, {
    max: env.dbPoolMax,
    // a new connection costs several round trips (TCP, TLS, sign-in): keep them for 5 minutes
    idle_timeout: env.dbIdleSeconds,
    connect_timeout: 15,
    // prepared statements: one round trip per query instead of two. Neon's pooler supports them;
    // set DATABASE_PREPARE=false for a pooler that doesn't (older PgBouncer in transaction mode).
    prepare: env.dbPrepare,
    // local databases usually have no TLS; hosted ones get it from the URL (?sslmode=require)
    onnotice: () => {},
  });
}

/** The pool, with the tables in place. */
export async function db() {
  globalThis.__lbSql ??= connect();
  const sql = globalThis.__lbSql;
  globalThis.__lbSchema ??= sql.unsafe(SCHEMA).then(() => undefined);
  try {
    await globalThis.__lbSchema;
  } catch (err) {
    globalThis.__lbSchema = undefined; // try again on the next request
    throw err;
  }
  return sql;
}

/** A JSON value as a parameter for a jsonb column. */
export const json = (v: unknown) => JSON.stringify(v ?? null);
