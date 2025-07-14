import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../database/salon.db');
const db = new Database(dbPath);

console.log('Adding sample services...');

const sampleServices = [
  {
    name: 'Hair Cut & Style',
    description: 'Professional haircut with styling',
    duration: 60,
    price: 45.00,
    category: 'Hair Styling',
    status: 'active'
  },
  {
    name: 'Hair Color - Full',
    description: 'Complete hair coloring service',
    duration: 180,
    price: 120.00,
    category: 'Hair Coloring',
    status: 'active'
  },
  {
    name: 'Highlights',
    description: 'Hair highlighting service',
    duration: 120,
    price: 85.00,
    category: 'Hair Coloring',
    status: 'active'
  },
  {
    name: 'Deep Conditioning Treatment',
    description: 'Intensive hair moisturizing treatment',
    duration: 45,
    price: 35.00,
    category: 'Hair Treatment',
    status: 'active'
  },
  {
    name: 'Manicure',
    description: 'Basic manicure service',
    duration: 45,
    price: 25.00,
    category: 'Nail Care',
    status: 'active'
  },
  {
    name: 'Pedicure',
    description: 'Basic pedicure service',
    duration: 60,
    price: 35.00,
    category: 'Nail Care',
    status: 'active'
  },
  {
    name: 'Gel Manicure',
    description: 'Long-lasting gel manicure',
    duration: 60,
    price: 40.00,
    category: 'Nail Care',
    status: 'active'
  },
  {
    name: 'European Facial',
    description: 'Classic European facial treatment',
    duration: 75,
    price: 70.00,
    category: 'Facial Treatment',
    status: 'active'
  },
  {
    name: 'Anti-Aging Facial',
    description: 'Advanced anti-aging facial with serums',
    duration: 90,
    price: 95.00,
    category: 'Facial Treatment',
    status: 'active'
  },
  {
    name: 'Eyebrow Threading',
    description: 'Professional eyebrow shaping',
    duration: 20,
    price: 15.00,
    category: 'Facial Treatment',
    status: 'active'
  },
  {
    name: 'Full Body Massage',
    description: 'Relaxing full body massage',
    duration: 90,
    price: 100.00,
    category: 'Massage',
    status: 'active'
  },
  {
    name: 'Hot Stone Massage',
    description: 'Therapeutic hot stone massage',
    duration: 90,
    price: 120.00,
    category: 'Massage',
    status: 'active'
  },
  {
    name: 'Swedish Massage',
    description: 'Classic Swedish massage',
    duration: 60,
    price: 75.00,
    category: 'Massage',
    status: 'active'
  },
  {
    name: 'Bridal Makeup',
    description: 'Complete bridal makeup service',
    duration: 120,
    price: 150.00,
    category: 'Makeup',
    status: 'active'
  },
  {
    name: 'Evening Makeup',
    description: 'Professional evening makeup',
    duration: 60,
    price: 65.00,
    category: 'Makeup',
    status: 'active'
  },
  {
    name: 'Hair Wash & Blow Dry',
    description: 'Hair washing and professional blow dry',
    duration: 30,
    price: 25.00,
    category: 'Hair Styling',
    status: 'active'
  },
  {
    name: 'Keratin Treatment',
    description: 'Hair smoothing keratin treatment',
    duration: 240,
    price: 200.00,
    category: 'Hair Treatment',
    status: 'active'
  },
  {
    name: 'Acrylic Nails',
    description: 'Full set of acrylic nails',
    duration: 90,
    price: 55.00,
    category: 'Nail Care',
    status: 'active'
  },
  {
    name: 'Nail Art',
    description: 'Creative nail art design',
    duration: 30,
    price: 20.00,
    category: 'Nail Care',
    status: 'active'
  },
  {
    name: 'Back Facial',
    description: 'Deep cleansing back treatment',
    duration: 60,
    price: 60.00,
    category: 'Body Treatment',
    status: 'active'
  }
];

async function addSampleServices() {
  try {
    // Check if services already exist
    const existingServices = db.prepare('SELECT COUNT(*) as count FROM services').get();
    
    if (existingServices && existingServices.count > 0) {
      console.log('Services already exist in the database. Skipping...');
      return;
    }

    const insertService = db.prepare(`
      INSERT INTO services (id, name, description, duration, price, category, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    console.log('Adding services to database...');
    for (const service of sampleServices) {
      const serviceId = uuidv4();
      insertService.run(
        serviceId,
        service.name,
        service.description,
        service.duration,
        service.price,
        service.category,
        service.status
      );
      console.log(`✓ Added: ${service.name}`);
    }

    console.log(`\n🎉 Successfully added ${sampleServices.length} services to the database!`);
    
    // Display summary
    const totalServices = db.prepare('SELECT COUNT(*) as count FROM services').get();
    const categories = db.prepare('SELECT DISTINCT category FROM services ORDER BY category').all();
    
    console.log(`\n📊 Database Summary:`);
    console.log(`Total Services: ${totalServices.count}`);
    console.log(`Categories: ${categories.map(c => c.category).join(', ')}`);
    
  } catch (error) {
    console.error('Error adding sample services:', error);
  }
}

addSampleServices();
