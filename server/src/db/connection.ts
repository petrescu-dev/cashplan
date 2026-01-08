import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DATABASE_PATH = process.env.DATABASE_PATH || './data/cashplan.db';

// Ensure data directory exists
const dataDir = path.dirname(DATABASE_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize SQLite database
const db: Database.Database = new Database(DATABASE_PATH, {
  verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
});

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
const initializeDatabase = () => {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  
  // Execute schema (split by semicolons to handle multiple statements)
  db.exec(schema);
  
  console.log('Database initialized successfully');
  
  // Run migrations for existing databases
  try {
    const { migrateDatabase } = require('./migrate');
    migrateDatabase();
  } catch (error) {
    console.warn('Migration skipped or failed:', error);
  }
};

// Run initialization
initializeDatabase();

export default db;

