import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../database/salon.db');
console.log('Database path:', dbPath);

const db = new Database(dbPath);

console.log('Testing database connection...');

try {
  // Test basic connection
  const testResult = db.prepare('SELECT 1 as test').get();
  console.log('Database connection successful:', testResult);

  // Check if users table exists
  const tablesResult = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").all();
  console.log('Users table exists:', tablesResult.length > 0);

  if (tablesResult.length > 0) {
    // Check users in the table
    const usersResult = db.prepare('SELECT username, role, status FROM users').all();
    console.log('Users in database:', usersResult);
    
    // Specifically check admin user
    const adminUser = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
    console.log('Admin user details:', adminUser);
  }
} catch (error) {
  console.error('Database error:', error);
} finally {
  db.close();
}
