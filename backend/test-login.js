import fetch from 'node-fetch';

async function testLogin() {
  const API_BASE_URL = 'http://localhost:3000/api';
  
  console.log('Testing login API...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      }),
    });
    
    const data = await response.json();
    console.log('Login response:', data);
    
    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('User:', data.user);
      console.log('Token:', data.token ? 'Token generated' : 'No token');
    } else {
      console.log('❌ Login failed:', data.message);
    }
    
  } catch (error) {
    console.error('Login test error:', error);
  }
}

// Wait for server to be ready
setTimeout(testLogin, 1000);
