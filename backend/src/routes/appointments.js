import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all appointments
router.get('/', (req, res) => {
  try {
    const db = req.app.locals.db;
    
    let query = `
      SELECT a.*, 
             c.first_name || ' ' || c.last_name as customer_name,
             s.name as service_name,
             w.name as workstation_name,
             u.first_name || ' ' || u.last_name as staff_name
      FROM appointments a
      LEFT JOIN customers c ON a.customer_id = c.id
      LEFT JOIN services s ON a.service_id = s.id
      LEFT JOIN workstations w ON a.workstation_id = w.id
      LEFT JOIN users u ON a.staff_id = u.id
    `;
    
    query += ' ORDER BY a.date DESC, a.time DESC';
    
    const result = db.prepare(query).all();

    res.json({ success: true, appointments: result });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create appointment
router.post('/', (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }    const { customerId, serviceId, workstationId, staffId, date, time, duration, totalAmount, notes } = req.body;
    const db = req.app.locals.db;

    const appointmentId = uuidv4();
    db.prepare(`INSERT INTO appointments (id, customer_id, service_id, workstation_id, staff_id, date, time, duration, total_amount, notes)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(appointmentId, customerId, serviceId, workstationId, staffId, date, time, duration, totalAmount, notes);

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      appointmentId,
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update appointment
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, staffId, workstationId, date, time, duration, totalAmount } = req.body;
    const db = req.app.locals.db;

    // Build dynamic update query based on provided fields
    const fields = [];
    const values = [];
    
    if (status !== undefined) { fields.push('status = ?'); values.push(status); }
    if (notes !== undefined) { fields.push('notes = ?'); values.push(notes); }
    if (staffId !== undefined) { fields.push('staff_id = ?'); values.push(staffId); }
    if (workstationId !== undefined) { fields.push('workstation_id = ?'); values.push(workstationId); }
    if (date !== undefined) { fields.push('date = ?'); values.push(date); }
    if (time !== undefined) { fields.push('time = ?'); values.push(time); }
    if (duration !== undefined) { fields.push('duration = ?'); values.push(duration); }
    if (totalAmount !== undefined) { fields.push('total_amount = ?'); values.push(totalAmount); }
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `UPDATE appointments SET ${fields.join(', ')} WHERE id = ?`;
    db.prepare(query).run(...values);

    res.json({ success: true, message: 'Appointment updated successfully' });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Check-in appointment
router.patch('/:id/checkin', (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;

    // Update appointment status to in-progress
    db.prepare('UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run('in-progress', id);

    res.json({ success: true, message: 'Customer checked in successfully' });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Check-out appointment (complete)
router.patch('/:id/checkout', (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;

    // Update appointment status to completed
    db.prepare('UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run('completed', id);

    res.json({ success: true, message: 'Customer checked out successfully' });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;