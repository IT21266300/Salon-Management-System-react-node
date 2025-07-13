import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../database/salon.db');
const db = new Database(dbPath);

// Function to check if column exists
function columnExists(tableName, columnName) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  return columns.some(col => col.name === columnName);
}

console.log('🔄 Adding image columns to database tables...');

try {
  // Add profile_picture column to customers table
  if (!columnExists('customers', 'profile_picture')) {
    db.prepare('ALTER TABLE customers ADD COLUMN profile_picture TEXT').run();
    console.log('✅ Added profile_picture column to customers table');
  } else {
    console.log('ℹ️  profile_picture column already exists in customers table');
  }

  // Add profile_picture column to users table (staff)
  if (!columnExists('users', 'profile_picture')) {
    db.prepare('ALTER TABLE users ADD COLUMN profile_picture TEXT').run();
    console.log('✅ Added profile_picture column to users table');
  } else {
    console.log('ℹ️  profile_picture column already exists in users table');
  }

  // Add image_url column to products table
  if (!columnExists('products', 'image_url')) {
    db.prepare('ALTER TABLE products ADD COLUMN image_url TEXT').run();
    console.log('✅ Added image_url column to products table');
  } else {
    console.log('ℹ️  image_url column already exists in products table');
  }

  // Add image_url column to services table
  if (!columnExists('services', 'image_url')) {
    db.prepare('ALTER TABLE services ADD COLUMN image_url TEXT').run();
    console.log('✅ Added image_url column to services table');
  } else {
    console.log('ℹ️  image_url column already exists in services table');
  }

  console.log('✅ Database schema updated successfully!');

} catch (error) {
  console.error('❌ Error updating database schema:', error);
} finally {
  db.close();
}
