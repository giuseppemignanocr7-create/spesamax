import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, 'spesamax.db');

// Ensure directory exists
const dbDir = path.dirname(DB_PATH.startsWith('.') ? path.join(__dirname, '..', DB_PATH) : DB_PATH);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const resolvedPath = DB_PATH.startsWith('.') ? path.join(__dirname, '..', DB_PATH) : DB_PATH;

const db = new Database(resolvedPath);

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema
const schemaPath = path.join(__dirname, 'schema.sql');
if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
}

export default db;
