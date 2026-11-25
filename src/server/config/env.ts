/**
 * Environment settings for the server.
 * Copy `.env.example` to `.env.local` and change these values.
 */

/** Connection string of a PostgreSQL database (Neon, Supabase, local). Keep it secret. */
export const DATABASE_URL = process.env.DATABASE_URL ?? "";

/**
 * Which database driver to use: "postgres", "file" or "memory".
 * If DATABASE_URL is set, PostgreSQL is used automatically.
 */
export const DB_DRIVER = process.env.DB_DRIVER ?? (DATABASE_URL ? "postgres" : "file");

/** Where the "file" driver saves its JSON file. */
export const DB_FILE_PATH = process.env.DB_FILE_PATH ?? ".data/efficht.json";

/** Secret used to sign login cookies. CHANGE THIS in production. */
export const SESSION_SECRET = process.env.SESSION_SECRET ?? "dev-only-secret-change-me";

/** Name of the login cookie. */
export const SESSION_COOKIE = "efficht_session";

/** How long a login lasts, in seconds (7 days). */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
