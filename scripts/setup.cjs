#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Brilliance Salon Management System...');

// Create backend directory if it doesn't exist
const backendDir = path.join(__dirname, '..', 'backend');
if (!fs.existsSync(backendDir)) {
  fs.mkdirSync(backendDir, { recursive: true });
  console.log('✅ Created backend directory');
}

// Create backend package.json if it doesn't exist
const backendPackageJson = path.join(backendDir, 'package.json');
if (!fs.existsSync(backendPackageJson)) {
  const backendPackage = {
    "name": "brilliance-salon-backend",
    "version": "1.0.0",
    "description": "Backend API for Brilliance Salon Management System",
    "main": "src/app.js",
    "scripts": {
      "dev": "node src/app.js",
      "start": "node src/app.js"
    },
    "dependencies": {
      "express": "^4.18.2",
      "cors": "^2.8.5",
      "dotenv": "^16.3.1"
    }
  };
  
  fs.writeFileSync(backendPackageJson, JSON.stringify(backendPackage, null, 2));
  console.log('✅ Created backend package.json');
}

// Create backend .env file if it doesn't exist
const backendEnv = path.join(backendDir, '.env');
if (!fs.existsSync(backendEnv)) {
  const envContent = `PORT=3001
NODE_ENV=development
`;
  fs.writeFileSync(backendEnv, envContent);
  console.log('✅ Created backend .env file');
}

// Create basic backend app.js if it doesn't exist
const backendApp = path.join(backendDir, 'src', 'app.js');
const backendSrcDir = path.join(backendDir, 'src');

if (!fs.existsSync(backendSrcDir)) {
  fs.mkdirSync(backendSrcDir, { recursive: true });
}

if (!fs.existsSync(backendApp)) {
  const appContent = `const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Brilliance Salon API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(\`🚀 Backend server running on port \${PORT}\`);
});

module.exports = app;
`;
  fs.writeFileSync(backendApp, appContent);
  console.log('✅ Created basic backend application');
}

console.log('✨ Setup completed successfully!');
console.log('');
console.log('Next steps:');
console.log('1. Run "cd backend && npm install" to install backend dependencies');
console.log('2. Run "npm run dev" to start both frontend and backend servers');