import fs from 'fs';
import path from 'path';

const routesDir = './src/routes';
const files = ['customers.js', 'inventory.js', 'appointments.js', 'reports.js', 'users.js', 'suppliers.js', 'sales.js'];

for (const file of files) {
  const filePath = path.join(routesDir, file);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace async route handlers with sync ones
    content = content.replace(/router\.(get|post|put|delete)\('([^']*)',\s*(?:\[[^\]]*\],\s*)?async\s*\(req,\s*res\)\s*=>/g, 
                             "router.$1('$2', (req, res) =>");
    
    // Replace db.execute patterns with better-sqlite3 patterns
    content = content.replace(/await\s+db\.execute\(\s*\{\s*sql:\s*([^,]+),\s*args:\s*([^\}]+)\s*\}\s*\)/g, 
                             "db.prepare($1).run(...$2)");
    content = content.replace(/await\s+db\.execute\(\s*\{\s*sql:\s*([^,]+)\s*\}\s*\)/g, 
                             "db.prepare($1).all()");
    content = content.replace(/await\s+db\.execute\(([^)]+)\)/g, 
                             "db.prepare($1).all()");
    
    // Replace result.rows with direct results
    content = content.replace(/result\.rows/g, 'result');
    
    // Remove await keywords where not needed
    content = content.replace(/const\s+(\w+)\s*=\s*await\s+db\.prepare/g, 'const $1 = db.prepare');
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
}

console.log('Route conversion completed!');
