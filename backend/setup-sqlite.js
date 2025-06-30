import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../database/salon.db');

console.log('Creating database at:', dbPath);

const db = new Database(dbPath);

// Create users table
const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'staff', 'cashier')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

console.log('Creating users table...');
db.exec(createUsersTable);

// Check if admin user exists
const adminCheck = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');

if (!adminCheck) {
  console.log('Creating admin user...');
  const adminId = uuidv4();
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  
  const insertAdmin = db.prepare(`
    INSERT INTO users (id, username, email, password_hash, first_name, last_name, role)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  insertAdmin.run(adminId, 'admin', 'admin@salon.com', hashedPassword, 'System', 'Administrator', 'admin');
  console.log('Admin user created successfully');
}

// Verify the user was created
const users = db.prepare('SELECT username, role FROM users').all();
console.log('Users in database:', users);

db.close();
console.log('Database setup complete!');
