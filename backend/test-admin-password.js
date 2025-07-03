import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const db = new Database('../database/salon.db');

async function testAdminPassword() {
  const admin = db.prepare('SELECT username, password_hash FROM users WHERE username = ?').get('admin');
  console.log('Admin user:', admin);

  if (admin) {
    console.log('Testing common passwords:');
    const testPasswords = ['admin', 'password', '123456', 'admin123', 'password123'];
    
    for (const testPass of testPasswords) {
      const isValid = await bcrypt.compare(testPass, admin.password_hash);
      console.log(`Password '${testPass}': ${isValid ? 'VALID' : 'invalid'}`);
    }
  }

  db.close();
}

testAdminPassword();
