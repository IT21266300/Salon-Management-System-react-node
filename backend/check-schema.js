import Database from 'better-sqlite3';

const db = new Database('../database/salon.db');

console.log('Services table schema:');
console.log(db.prepare('PRAGMA table_info(services)').all());

console.log('\nAppointments table schema:');
console.log(db.prepare('PRAGMA table_info(appointments)').all());

console.log('\nSample services data:');
console.log(db.prepare('SELECT * FROM services LIMIT 3').all());

console.log('\nSample appointments data:');
console.log(db.prepare('SELECT * FROM appointments LIMIT 3').all());

db.close();
