import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3000/api';

async function testUserAPI() {
  console.log('Testing User API...');
  
  try {
    // Test getting all users
    console.log('\n1. Testing GET /users');
    const response = await fetch(`${API_BASE_URL}/users`);
    const data = await response.json();
    console.log('Response:', data);
    
    // Test creating a new user
    console.log('\n2. Testing POST /users');
    const newUser = {
      username: 'test.user',
      email: 'test.user@salon.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'staff'
    };
    
    const createResponse = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser),
    });
    
    const createData = await createResponse.json();
    console.log('Create response:', createData);
    
    if (createData.success) {
      const userId = createData.user.id;
      console.log('Created user ID:', userId);
      
      // Test updating the user
      console.log('\n3. Testing PUT /users/:id');
      const updateData = {
        ...newUser,
        firstName: 'Updated',
        lastName: 'User'
      };
      
      const updateResponse = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      const updateResult = await updateResponse.json();
      console.log('Update response:', updateResult);
      
      // Test status update
      console.log('\n4. Testing PATCH /users/:id/status');
      const statusResponse = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'inactive' }),
      });
      
      const statusResult = await statusResponse.json();
      console.log('Status update response:', statusResult);
      
      // Test deleting the user
      console.log('\n5. Testing DELETE /users/:id');
      const deleteResponse = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
      });
      
      const deleteResult = await deleteResponse.json();
      console.log('Delete response:', deleteResult);
    }
    
  } catch (error) {
    console.error('API Test Error:', error);
  }
}

// Wait a bit for the server to start
setTimeout(testUserAPI, 2000);
