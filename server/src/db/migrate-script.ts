import db from './connection';
import { migrateDatabase } from './migrate';

/**
 * Standalone script to run database migrations
 * Usage: ts-node src/db/migrate-script.ts
 * or: node dist/db/migrate-script.js
 */

console.log('Starting database migrations...');

try {
  migrateDatabase(db);
  console.log('All migrations completed successfully');
  process.exit(0);
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}

