import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../database/salon.db');
const db = new Database(dbPath);

async function addServicesAndWorkstations() {
  try {
    console.log('Adding services and workstations...');

    // Add services
    const services = [
      { name: 'Haircut & Style', description: 'Professional haircut and styling', duration: 60, price: 45.00, category: 'Hair' },
      { name: 'Hair Color', description: 'Hair coloring service', duration: 120, price: 85.00, category: 'Hair' },
      { name: 'Manicure', description: 'Hand nail care and styling', duration: 45, price: 25.00, category: 'Nails' },
      { name: 'Pedicure', description: 'Foot nail care and styling', duration: 60, price: 35.00, category: 'Nails' },
      { name: 'Facial Treatment', description: 'Relaxing facial treatment', duration: 90, price: 60.00, category: 'Skincare' }
    ];

    for (const service of services) {
      const existing = db.prepare('SELECT id FROM services WHERE name = ?').get(service.name);
      
      if (!existing) {
        const serviceId = uuidv4();
        db.prepare(`INSERT INTO services (id, name, description, duration, price, category)
                   VALUES (?, ?, ?, ?, ?, ?)`).run(
          serviceId, service.name, service.description, service.duration, service.price, service.category
        );
        console.log(`Added service: ${service.name}`);
      } else {
        console.log(`Service ${service.name} already exists, skipping...`);
      }
    }

    // Add workstations
    const workstations = [
      { name: 'Hair Station 1', type: 'Hair Styling' },
      { name: 'Hair Station 2', type: 'Hair Styling' },
      { name: 'Hair Station 3', type: 'Hair Styling' },
      { name: 'Nail Station 1', type: 'Nail Care' },
      { name: 'Nail Station 2', type: 'Nail Care' },
      { name: 'Facial Room 1', type: 'Skincare' }
    ];

    for (const workstation of workstations) {
      const existing = db.prepare('SELECT id FROM workstations WHERE name = ?').get(workstation.name);
      
      if (!existing) {
        const workstationId = uuidv4();
        db.prepare(`INSERT INTO workstations (id, name, type)
                   VALUES (?, ?, ?)`).run(
          workstationId, workstation.name, workstation.type
        );
        console.log(`Added workstation: ${workstation.name}`);
      } else {
        console.log(`Workstation ${workstation.name} already exists, skipping...`);
      }
    }

    // Verify what was added
    const servicesResult = db.prepare('SELECT id, name, price, duration FROM services').all();
    const workstationsResult = db.prepare('SELECT id, name, type FROM workstations').all();

    console.log('\nServices in database:');
    servicesResult.forEach(service => {
      console.log(`- ${service.name} ($${service.price}, ${service.duration}min)`);
    });

    console.log('\nWorkstations in database:');
    workstationsResult.forEach(workstation => {
      console.log(`- ${workstation.name} (${workstation.type})`);
    });

    console.log('\nServices and workstations added successfully!');
  } catch (error) {
    console.error('Error adding services and workstations:', error);
  } finally {
    db.close();
  }
}

addServicesAndWorkstations();
