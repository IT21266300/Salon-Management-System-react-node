// Test script to verify workstation staff assignment
const BASE_URL = 'http://localhost:3000/api';

async function testWorkstationAssignment() {
  try {
    // Get workstations
    const workstationsResponse = await fetch(`${BASE_URL}/workstations`);
    const workstationsData = await workstationsResponse.json();
    const workstation = workstationsData.workstations[0];
    
    console.log('Before assignment:', {
      id: workstation.id,
      name: workstation.name,
      assigned_staff_id: workstation.assigned_staff_id,
      assigned_staff_name: workstation.assigned_staff_name
    });
    
    // Get available staff
    const staffResponse = await fetch(`${BASE_URL}/users`);
    const staffData = await staffResponse.json();
    const availableStaff = staffData.users.filter(user => user.role === 'staff' || user.role === 'manager');
    const staffToAssign = availableStaff[0];
    
    console.log('Staff to assign:', {
      id: staffToAssign.id,
      name: `${staffToAssign.first_name} ${staffToAssign.last_name}`,
      role: staffToAssign.role
    });
    
    // Assign staff to workstation
    const assignResponse = await fetch(`${BASE_URL}/workstations/${workstation.id}/assign-staff`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        staffId: staffToAssign.id
      })
    });
    
    const assignResult = await assignResponse.json();
    console.log('Assignment result:', assignResult);
    
    // Verify assignment
    const verifyResponse = await fetch(`${BASE_URL}/workstations`);
    const verifyData = await verifyResponse.json();
    const updatedWorkstation = verifyData.workstations.find(ws => ws.id === workstation.id);
    
    console.log('After assignment:', {
      id: updatedWorkstation.id,
      name: updatedWorkstation.name,
      assigned_staff_id: updatedWorkstation.assigned_staff_id,
      assigned_staff_name: updatedWorkstation.assigned_staff_name
    });
    
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testWorkstationAssignment();
