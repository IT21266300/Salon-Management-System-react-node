import Database from 'better-sqlite3';
const db = new Database('../database/salon.db');

console.log('Testing appointment status update...');

// Get a sample appointment
const appointment = db.prepare('SELECT * FROM appointments WHERE workstation_id IS NOT NULL AND status IS NOT NULL LIMIT 1').get();
if (!appointment) {
  console.log('No appointments found with workstation assignment');
  process.exit(1);
}

console.log('Original appointment:', {
  id: appointment.id,
  workstation_id: appointment.workstation_id,
  status: appointment.status,
  updated_at: appointment.updated_at
});

// Test the update query directly
const newStatus = appointment.status === 'pending' ? 'confirmed' : 'pending';
console.log(`\nUpdating status from ${appointment.status} to ${newStatus}...`);

try {
  const result = db.prepare('UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(newStatus, appointment.id);
  
  console.log('Update result:', result);

  // Check if the update worked
  const updatedAppointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(appointment.id);
  console.log('Updated appointment:', {
    id: updatedAppointment.id,
    workstation_id: updatedAppointment.workstation_id,
    status: updatedAppointment.status,
    updated_at: updatedAppointment.updated_at
  });

  console.log('\nStatus update test successful!');
} catch (error) {
  console.error('Error updating appointment status:', error);
}

db.close();
