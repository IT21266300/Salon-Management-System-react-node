import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../database/salon.db');
const db = new Database(dbPath);

console.log('🔍 COMPREHENSIVE DATABASE VALIDATION\n');
console.log('='.repeat(60) + '\n');

// Expected tables and their expected minimum row counts
const expectedTables = {
  'users': { minRows: 1, description: 'System users (should have admin user)' },
  'customers': { minRows: 3, description: 'Sample customers' },
  'services': { minRows: 3, description: 'Sample services' },
  'workstations': { minRows: 3, description: 'Sample workstations' },
  'suppliers': { minRows: 2, description: 'Sample suppliers' },
  'products': { minRows: 3, description: 'Sample products' },
  'sales': { minRows: 0, description: 'Sales transactions (may be empty)' },
  'sale_items': { minRows: 0, description: 'Sale line items (may be empty)' },
  'appointments': { minRows: 0, description: 'Customer appointments (may be empty)' }
};

// Function to validate table structure
function validateTableStructure(tableName) {
  try {
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
    return {
      exists: true,
      columnCount: columns.length,
      columns: columns.map(col => ({
        name: col.name,
        type: col.type,
        notNull: col.notnull === 1,
        primaryKey: col.pk === 1
      }))
    };
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

// Function to validate foreign key constraints
function validateForeignKeys() {
  console.log('🔗 FOREIGN KEY CONSTRAINTS VALIDATION');
  console.log('-'.repeat(40));
  
  const foreignKeyChecks = [
    {
      table: 'appointments',
      column: 'customer_id',
      refTable: 'customers',
      refColumn: 'id'
    },
    {
      table: 'products',
      column: 'supplier_id',
      refTable: 'suppliers',
      refColumn: 'id'
    },
    {
      table: 'sales',
      column: 'customer_id',
      refTable: 'customers',
      refColumn: 'id'
    },
    {
      table: 'sale_items',
      column: 'sale_id',
      refTable: 'sales',
      refColumn: 'id'
    },
    {
      table: 'sale_items',
      column: 'product_id',
      refTable: 'products',
      refColumn: 'id'
    }
  ];

  let allFKValid = true;
  
  for (const fk of foreignKeyChecks) {
    try {
      // Check for orphaned records
      const orphanedQuery = `
        SELECT COUNT(*) as count 
        FROM ${fk.table} 
        WHERE ${fk.column} IS NOT NULL 
        AND ${fk.column} NOT IN (SELECT ${fk.refColumn} FROM ${fk.refTable})
      `;
      const result = db.prepare(orphanedQuery).get();
      
      if (result.count === 0) {
        console.log(`✅ ${fk.table}.${fk.column} -> ${fk.refTable}.${fk.refColumn}: Valid`);
      } else {
        console.log(`❌ ${fk.table}.${fk.column} -> ${fk.refTable}.${fk.refColumn}: ${result.count} orphaned records`);
        allFKValid = false;
      }
    } catch (error) {
      console.log(`❌ ${fk.table}.${fk.column} -> ${fk.refTable}.${fk.refColumn}: Error - ${error.message}`);
      allFKValid = false;
    }
  }
  
  console.log(`\n🔗 Foreign Key Integrity: ${allFKValid ? '✅ PASSED' : '❌ FAILED'}\n`);
  return allFKValid;
}

// Function to validate sample data
function validateSampleData() {
  console.log('📊 SAMPLE DATA VALIDATION');
  console.log('-'.repeat(40));
  
  const validations = [];
  
  // Check admin user
  try {
    const adminUser = db.prepare("SELECT * FROM users WHERE username = 'admin'").get();
    if (adminUser) {
      console.log('✅ Admin user exists');
      console.log(`   - Username: ${adminUser.username}`);
      console.log(`   - Email: ${adminUser.email}`);
      console.log(`   - Role: ${adminUser.role}`);
      console.log(`   - Status: ${adminUser.status}`);
      validations.push(true);
    } else {
      console.log('❌ Admin user NOT found');
      validations.push(false);
    }
  } catch (error) {
    console.log(`❌ Error checking admin user: ${error.message}`);
    validations.push(false);
  }
  
  // Check sample customers
  try {
    const customers = db.prepare("SELECT * FROM customers WHERE first_name IN ('Sarah', 'Michael', 'Emma')").all();
    console.log(`✅ Sample customers: ${customers.length}/3 found`);
    if (customers.length < 3) {
      console.log('⚠️  Some default sample customers missing');
    }
    validations.push(customers.length >= 3);
  } catch (error) {
    console.log(`❌ Error checking sample customers: ${error.message}`);
    validations.push(false);
  }
  
  // Check sample suppliers
  try {
    const suppliers = db.prepare("SELECT * FROM suppliers WHERE name IN ('Beauty Supply Co', 'Professional Hair Products')").all();
    console.log(`✅ Sample suppliers: ${suppliers.length}/2 found`);
    validations.push(suppliers.length >= 2);
  } catch (error) {
    console.log(`❌ Error checking sample suppliers: ${error.message}`);
    validations.push(false);
  }
  
  // Check sample services
  try {
    const services = db.prepare("SELECT * FROM services WHERE name IN ('Haircut & Style', 'Hair Color', 'Manicure')").all();
    console.log(`✅ Sample services: ${services.length}/3 found`);
    validations.push(services.length >= 3);
  } catch (error) {
    console.log(`❌ Error checking sample services: ${error.message}`);
    validations.push(false);
  }
  
  // Check sample workstations
  try {
    const workstations = db.prepare("SELECT * FROM workstations").all();
    console.log(`✅ Sample workstations: ${workstations.length} found`);
    validations.push(workstations.length >= 3);
  } catch (error) {
    console.log(`❌ Error checking sample workstations: ${error.message}`);
    validations.push(false);
  }
  
  const allValid = validations.every(v => v);
  console.log(`\n📊 Sample Data: ${allValid ? '✅ PASSED' : '⚠️  PARTIAL'}\n`);
  return allValid;
}

// Main validation function
function validateDatabase() {
  let allValid = true;
  
  console.log('📋 TABLE STRUCTURE VALIDATION');
  console.log('-'.repeat(40));
  
  // Check if all expected tables exist
  for (const [tableName, config] of Object.entries(expectedTables)) {
    const structure = validateTableStructure(tableName);
    
    if (structure.exists) {
      const count = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get();
      const hasMinRows = count.count >= config.minRows;
      
      console.log(`✅ ${tableName.toUpperCase()}`);
      console.log(`   - Columns: ${structure.columnCount}`);
      console.log(`   - Rows: ${count.count} (min required: ${config.minRows}) ${hasMinRows ? '✅' : '⚠️'}`);
      console.log(`   - Description: ${config.description}`);
      
      if (!hasMinRows && config.minRows > 0) {
        console.log(`   ⚠️  Table has fewer rows than expected`);
        allValid = false;
      }
    } else {
      console.log(`❌ ${tableName.toUpperCase()}: NOT FOUND`);
      console.log(`   - Error: ${structure.error}`);
      allValid = false;
    }
    console.log('');
  }
  
  // Validate foreign keys
  const fkValid = validateForeignKeys();
  
  // Validate sample data
  const sampleValid = validateSampleData();
  
  // Overall validation result
  console.log('='.repeat(60));
  console.log('🎯 OVERALL VALIDATION RESULT');
  console.log('='.repeat(60));
  
  console.log(`📋 Table Structure: ${allValid ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`🔗 Foreign Keys: ${fkValid ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`📊 Sample Data: ${sampleValid ? '✅ PASSED' : '⚠️  PARTIAL'}`);
  
  const overallResult = allValid && fkValid && sampleValid;
  console.log(`\n🏆 OVERALL: ${overallResult ? '✅ ALL SYSTEMS GO!' : '⚠️  NEEDS ATTENTION'}`);
  
  if (!overallResult) {
    console.log('\n💡 RECOMMENDATIONS:');
    if (!allValid) console.log('   - Check table creation scripts');
    if (!fkValid) console.log('   - Review foreign key constraints');
    if (!sampleValid) console.log('   - Verify sample data creation');
  }
  
  return overallResult;
}

// Run the validation
try {
  validateDatabase();
} catch (error) {
  console.log(`❌ CRITICAL ERROR: ${error.message}`);
} finally {
  db.close();
}
