import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  // dialect "turso" = libsql: локально файл, на проде — удалённая Turso-БД по URL
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL ?? "./notes.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
