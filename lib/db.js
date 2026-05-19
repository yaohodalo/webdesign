// lib/db.js — Neon Postgres client (via Vercel Marketplace integration)
// The Neon integration injects DATABASE_URL automatically.
//
// `fullResults: true` makes Neon return { rows: [...], rowCount, ... }
// — same shape as the old @vercel/postgres driver, so the rest of the
// codebase using `const { rows } = await sql\`...\`` keeps working.
import { neon } from '@neondatabase/serverless';

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL;

if (!connectionString) {
  console.error('[db] No DATABASE_URL / POSTGRES_URL env var found.');
}

export const sql = neon(connectionString, { fullResults: true });

