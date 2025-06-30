import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../database/salon.db');
const db = new Database(dbPath);

async function addSampleProducts() {
  try {
    console.log('Adding sample products...');

    const products = [
      {
        name: 'Hair Shampoo - Professional',
        description: 'Professional grade shampoo for all hair types',
        category: 'Hair Care',
        purchasePrice: 12.50,
        sellingPrice: 25.00,
        quantityInStock: 50,
        reorderLevel: 10
      },
      {
        name: 'Hair Conditioner - Moisturizing',
        description: 'Deep moisturizing conditioner',
        category: 'Hair Care',
        purchasePrice: 15.00,
        sellingPrice: 30.00,
        quantityInStock: 40,
        reorderLevel: 8
      },
      {
        name: 'Hair Styling Gel',
        description: 'Strong hold styling gel',
        category: 'Hair Care',
        purchasePrice: 8.00,
        sellingPrice: 18.00,
        quantityInStock: 25,
        reorderLevel: 5
      },
      {
        name: 'Nail Polish - Red',
        description: 'Premium red nail polish',
        category: 'Nail Care',
        purchasePrice: 3.00,
        sellingPrice: 8.00,
        quantityInStock: 30,
        reorderLevel: 10
      },
      {
        name: 'Nail Polish - Pink',
        description: 'Premium pink nail polish',
        category: 'Nail Care',
        purchasePrice: 3.00,
        sellingPrice: 8.00,
        quantityInStock: 35,
        reorderLevel: 10
      },
      {
        name: 'Face Mask - Hydrating',
        description: 'Hydrating face mask for all skin types',
        category: 'Skincare',
        purchasePrice: 5.00,
        sellingPrice: 12.00,
        quantityInStock: 20,
        reorderLevel: 5
      },
      {
        name: 'Hair Oil Treatment',
        description: 'Nourishing hair oil treatment',
        category: 'Hair Care',
        purchasePrice: 18.00,
        sellingPrice: 35.00,
        quantityInStock: 15,
        reorderLevel: 3
      },
      {
        name: 'Cuticle Oil',
        description: 'Nourishing cuticle oil',
        category: 'Nail Care',
        purchasePrice: 4.00,
        sellingPrice: 10.00,
        quantityInStock: 40,
        reorderLevel: 8
      }
    ];

    for (const product of products) {
      const existing = db.prepare('SELECT id FROM products WHERE name = ?').get(product.name);
      
      if (!existing) {
        const productId = uuidv4();
        db.prepare(`INSERT INTO products (id, name, description, category, purchase_price, selling_price, quantity_in_stock, reorder_level)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
          .run(productId, product.name, product.description, product.category, 
               product.purchasePrice, product.sellingPrice, product.quantityInStock, product.reorderLevel);
        console.log(`Added product: ${product.name} - $${product.sellingPrice}`);
      } else {
        console.log(`Product ${product.name} already exists, skipping...`);
      }
    }

    // Verify products were added
    const productsResult = db.prepare('SELECT id, name, selling_price, quantity_in_stock FROM products').all();

    console.log('\nProducts in database:');
    productsResult.forEach(product => {
      console.log(`- ${product.name} - $${product.selling_price} (Stock: ${product.quantity_in_stock})`);
    });

    console.log('\nSample products added successfully!');
  } catch (error) {
    console.error('Error adding products:', error);
  } finally {
    db.close();
  }
}

addSampleProducts();
