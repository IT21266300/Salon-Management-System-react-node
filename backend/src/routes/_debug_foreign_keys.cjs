const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, '../../database/salon.db'));
const result = db.prepare('PRAGMA foreign_keys').get();
console.log('PRAGMA foreign_keys:', result);
