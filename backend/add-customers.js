import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../database/salon.db');
const db = new Database(dbPath);

async function addSampleCustomers() {
  try {
    console.log('Adding sample customers...');

    const customers = [
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@email.com',
        phone: '555-0101',
        address: '123 Main St, Anytown, ST 12345',
        gender: 'male'
      },
      {
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'sarah.williams@email.com',
        phone: '555-0102',
        address: '456 Oak Ave, Anytown, ST 12345',
        gender: 'female'
      },
      {
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@email.com',
        phone: '555-0103',
        address: '789 Pine Rd, Anytown, ST 12345',
        gender: 'male'
      },
      {
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@email.com',
        phone: '555-0104',
        address: '321 Elm St, Anytown, ST 12345',
        gender: 'female'
      }
    ];

    for (const customer of customers) {
      const existing = db.prepare('SELECT id FROM customers WHERE email = ?').get(customer.email);
      
      if (!existing) {
        const customerId = uuidv4();
        db.prepare(`INSERT INTO customers (id, first_name, last_name, email, phone, address, gender)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
          customerId, customer.firstName, customer.lastName, customer.email, 
          customer.phone, customer.address, customer.gender
        );
        console.log(`Added customer: ${customer.firstName} ${customer.lastName}`);
      } else {
        console.log(`Customer ${customer.email} already exists, skipping...`);
      }
    }

    // Verify customers were added
    const customersResult = db.prepare('SELECT id, first_name, last_name, email, phone FROM customers').all();

    console.log('\nCustomers in database:');
    customersResult.forEach(customer => {
      console.log(`- ${customer.first_name} ${customer.last_name} (${customer.email})`);
    });

    console.log('\nSample customers added successfully!');
  } catch (error) {
    console.error('Error adding customers:', error);
  } finally {
    db.close();
  }
}

addSampleCustomers();
