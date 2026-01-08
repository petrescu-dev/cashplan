import Database from 'better-sqlite3';

/**
 * Migration script to add start_date column to existing plans table
 * This handles the case where the database already exists without the start_date column
 */
interface ColumnInfo {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: any;
  pk: number;
}

export const migrateDatabase = (db: Database.Database) => {
  console.log('Running database migrations...');
  
  try {
    // Check if start_date column exists in plans table
    const tableInfo = db.pragma('table_info(plans)') as ColumnInfo[];
    const hasStartDate = tableInfo.some((col) => col.name === 'start_date');
    
    if (!hasStartDate) {
      console.log('Adding start_date column to plans table...');
      
      // Add start_date column with a default value (current date)
      db.exec(`
        ALTER TABLE plans ADD COLUMN start_date TEXT NOT NULL DEFAULT (date('now'));
      `);
      
      console.log('✓ Migration completed: start_date column added');
    } else {
      console.log('✓ Plans table already has start_date column');
    }
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
};

