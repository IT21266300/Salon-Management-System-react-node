import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../database/salon.db');
const db = new Database(dbPath);

async function addStaffMembers() {
  try {
    console.log('Adding staff members...');

    const staffMembers = [
      {
        username: 'sarah.johnson',
        email: 'sarah.johnson@salon.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'manager'
      },
      {
        username: 'mike.chen',
        email: 'mike.chen@salon.com',
        firstName: 'Mike',
        lastName: 'Chen',
        role: 'staff'
      },
      {
        username: 'emma.davis',
        email: 'emma.davis@salon.com',
        firstName: 'Emma',
        lastName: 'Davis',
        role: 'staff'
      },
      {
        username: 'alex.rodriguez',
        email: 'alex.rodriguez@salon.com',
        firstName: 'Alex',
        lastName: 'Rodriguez',
        role: 'staff'
      }
    ];

    for (const staff of staffMembers) {
      // Check if user already exists
      const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(staff.username, staff.email);

      if (!existing) {
        const staffId = uuidv4();
        const hashedPassword = await bcrypt.hash('staff123', 10); // Default password

        db.prepare(`INSERT INTO users (id, username, email, password_hash, first_name, last_name, role)
              VALUES (?, ?, ?, ?, ?, ?, ?)`).run(staffId, staff.username, staff.email, hashedPassword, staff.firstName, staff.lastName, staff.role);

        console.log(`Added ${staff.role}: ${staff.firstName} ${staff.lastName} (${staff.username})`);
      } else {
        console.log(`User ${staff.username} already exists, skipping...`);
      }
    }

    // Verify staff members were added
    const staffResult = db.prepare("SELECT id, username, first_name, last_name, role FROM users WHERE role IN ('staff', 'manager')").all();

    console.log('\nStaff members in database:');
    staffResult.forEach(staff => {
      console.log(`- ${staff.first_name} ${staff.last_name} (${staff.username}) - ${staff.role}`);
    });

    console.log('\nStaff members added successfully!');
  } catch (error) {
    console.error('Error adding staff members:', error);
  } finally {
    db.close();
  }
}

addStaffMembers();
