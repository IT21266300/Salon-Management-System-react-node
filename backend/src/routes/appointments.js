import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all appointments
router.get('/', (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = db.prepare(`
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
      ORDER BY a.date DESC, a.time DESC
    `).all();

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
    }

    const { customerId, serviceId, workstationId, staffId, date, time, duration, totalAmount, notes } = req.body;
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
    const { status, notes } = req.body;
    const db = req.app.locals.db;

    db.prepare('UPDATE appointments SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(status, notes, id);

    res.json({ success: true, message: 'Appointment updated successfully' });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;