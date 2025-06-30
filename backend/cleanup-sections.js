import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../database/salon.db');
const db = new Database(dbPath);

console.log('🧹 Starting sections cleanup...');

try {
  // Disable foreign key constraints temporarily
  db.pragma('foreign_keys = OFF');
  
  // Begin transaction for safety
  db.exec('BEGIN TRANSACTION');

  // Remove section_id from appointments table
  console.log('📝 Updating appointments table structure...');
  
  // Create new appointments table without section_id
  db.exec(`
    CREATE TABLE appointments_new (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      service_id TEXT NOT NULL,
      workstation_id TEXT,
      staff_id TEXT,
      date DATE NOT NULL,
      time TIME NOT NULL,
      duration INTEGER NOT NULL,
      status TEXT,
      total_amount REAL NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (service_id) REFERENCES services(id),
      FOREIGN KEY (workstation_id) REFERENCES workstations(id),
      FOREIGN KEY (staff_id) REFERENCES users(id)
    )
  `);

  // Copy data from old table to new (excluding section_id)
  db.exec(`
    INSERT INTO appointments_new (
      id, customer_id, service_id, workstation_id, staff_id, 
      date, time, duration, status, total_amount, notes, 
      created_at, updated_at
    )
    SELECT 
      id, customer_id, service_id, workstation_id, staff_id, 
      date, time, duration, status, total_amount, notes, 
      created_at, updated_at
    FROM appointments
  `);

  // Drop old table and rename new one
  db.exec('DROP TABLE appointments');
  db.exec('ALTER TABLE appointments_new RENAME TO appointments');

  console.log('✓ Appointments table updated');

  // Remove section_id from users table
  console.log('👥 Updating users table structure...');

  // Create new users table without section_id
  db.exec(`
    CREATE TABLE users_new (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'staff',
      status TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Copy data from old table to new (excluding section_id)
  db.exec(`
    INSERT INTO users_new (
      id, username, email, password_hash, first_name, last_name, 
      role, status, created_at, updated_at
    )
    SELECT 
      id, username, email, password_hash, first_name, last_name, 
      role, status, created_at, updated_at
    FROM users
  `);

  // Drop old table and rename new one
  db.exec('DROP TABLE users');
  db.exec('ALTER TABLE users_new RENAME TO users');

  console.log('✓ Users table updated');

  // Drop sections table if it exists
  console.log('🗑️ Removing sections table...');
  db.exec('DROP TABLE IF EXISTS sections');
  console.log('✓ Sections table removed');

  // Remove section-related triggers
  console.log('🔧 Removing section-related triggers...');
  db.exec('DROP TRIGGER IF EXISTS update_sections_timestamp');
  console.log('✓ Triggers removed');

  // Commit transaction
  db.exec('COMMIT');
  
  // Re-enable foreign key constraints
  db.pragma('foreign_keys = ON');
  
  console.log('');
  console.log('🎉 Sections cleanup completed successfully!');
  console.log('');
  console.log('📊 Summary of changes:');
  console.log('  ✓ Removed section_id column from appointments table');
  console.log('  ✓ Removed section_id column from users table');
  console.log('  ✓ Dropped sections table');
  console.log('  ✓ Removed section-related triggers');
  console.log('');
  console.log('🔄 The database has been successfully cleaned up.');

} catch (error) {
  // Rollback on error
  console.error('❌ Error during cleanup:', error);
  db.exec('ROLLBACK');
  throw error;
} finally {
  db.close();
}
