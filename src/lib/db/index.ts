import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

// В проде (Vercel) БД подключается к удалённому Turso/libsql через env-переменные.
// Локально (если TURSO_DATABASE_URL не задан) — файловая БД для разработки.
const url = process.env.TURSO_DATABASE_URL ?? "file:notes.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });
export const db = drizzle(client, { schema });
