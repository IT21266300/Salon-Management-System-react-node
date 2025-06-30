import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../database/salon.db');

const db = new Database(dbPath);

try {
  // Check all tables
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('All tables:', tables.map(t => t.name));
  
  // Check if customers table exists
  const customersTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='customers'").all();
  console.log('Customers table exists:', customersTable.length > 0);
  
  if (customersTable.length > 0) {
    // Get table schema
    const schema = db.prepare("PRAGMA table_info(customers)").all();
    console.log('Customers table schema:', schema);
    
    // Count customers
    const customerCount = db.prepare('SELECT COUNT(*) as count FROM customers').get();
    console.log('Number of customers:', customerCount.count);
    
    // Get sample customers
    const sampleCustomers = db.prepare('SELECT * FROM customers LIMIT 3').all();
    console.log('Sample customers:', sampleCustomers);
  }
} catch (error) {
  console.error('Error:', error);
} finally {
  db.close();
}
