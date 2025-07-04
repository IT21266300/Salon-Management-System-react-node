import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(__dirname, '../../database/salon.db'));
const result = db.prepare('PRAGMA foreign_keys').get();
console.log('PRAGMA foreign_keys:', result);
