import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all workstations
router.get('/', (req, res) => {
  try {
    const db = req.app.locals.db;
    const workstations = db.prepare(`
      SELECT 
        w.id,
        w.name,
        w.type,
        w.status,
        w.assigned_staff_id,
        w.created_at,
        u.first_name || ' ' || u.last_name as assigned_staff_name,
        COUNT(a.id) as appointment_count
      FROM workstations w
      LEFT JOIN users u ON w.assigned_staff_id = u.id
      LEFT JOIN appointments a ON w.id = a.workstation_id AND a.status IN ('pending', 'confirmed', 'in-progress')
      GROUP BY w.id
      ORDER BY w.type, w.name
    `).all();

    res.json({ success: true, workstations });
  } catch (error) {
    console.error('Get workstations error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get workstation by ID
router.get('/:id', (req, res) => {
  try {
    const db = req.app.locals.db;
    const workstation = db.prepare(`
      SELECT 
        w.id,
        w.name,
        w.type,
        w.status,
        w.assigned_staff_id,
        w.created_at,
        u.first_name || ' ' || u.last_name as assigned_staff_name,
        COUNT(a.id) as appointment_count
      FROM workstations w
      LEFT JOIN users u ON w.assigned_staff_id = u.id
      LEFT JOIN appointments a ON w.id = a.workstation_id AND a.status IN ('pending', 'confirmed', 'in-progress')
      WHERE w.id = ?
      GROUP BY w.id
    `).get(req.params.id);

    if (!workstation) {
      return res.status(404).json({ success: false, message: 'Workstation not found' });
    }

    res.json({ success: true, workstation });
  } catch (error) {
    console.error('Get workstation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get workstation appointments
router.get('/:id/appointments', (req, res) => {
  try {
    const db = req.app.locals.db;
    const appointments = db.prepare(`
      SELECT 
        a.id,
        a.date as appointment_date,
        a.time as appointment_time,
        a.status,
        a.duration,
        a.total_amount,
        a.notes,
        a.created_at,
        a.updated_at,
        c.first_name || ' ' || c.last_name as customer_name,
        s.name as service,
        u.first_name || ' ' || u.last_name as staff_name
      FROM appointments a
      LEFT JOIN customers c ON a.customer_id = c.id
      LEFT JOIN services s ON a.service_id = s.id
      LEFT JOIN users u ON a.staff_id = u.id
      WHERE a.workstation_id = ?
      ORDER BY a.date, a.time
    `).all(req.params.id);

    res.json({ success: true, appointments });
  } catch (error) {
    console.error('Get workstation appointments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create workstation
router.post('/', [
  body('name').notEmpty().trim().withMessage('Workstation name is required'),
  body('type').notEmpty().trim().withMessage('Workstation type is required'),
  body('status').optional().isIn(['available', 'occupied', 'maintenance', 'out-of-order']).withMessage('Invalid status')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, type, status = 'available' } = req.body;
    const db = req.app.locals.db;

    // Check if workstation name already exists
    const existingWorkstation = db.prepare('SELECT id FROM workstations WHERE name = ?').get(name);
    if (existingWorkstation) {
      return res.status(400).json({ success: false, message: 'Workstation name already exists' });
    }

    const id = uuidv4();
    db.prepare(`
      INSERT INTO workstations (id, name, type, status)
      VALUES (?, ?, ?, ?)
    `).run(id, name, type, status);

    const newWorkstation = db.prepare(`
      SELECT 
        w.id,
        w.name,
        w.type,
        w.status,
        w.assigned_staff_id,
        w.created_at,
        u.first_name || ' ' || u.last_name as assigned_staff_name,
        0 as appointment_count
      FROM workstations w
      LEFT JOIN users u ON w.assigned_staff_id = u.id
      WHERE w.id = ?
    `).get(id);

    res.status(201).json({ success: true, workstation: newWorkstation });
  } catch (error) {
    console.error('Create workstation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update workstation
router.put('/:id', [
  body('name').notEmpty().trim().withMessage('Workstation name is required'),
  body('type').notEmpty().trim().withMessage('Workstation type is required'),
  body('status').optional().isIn(['available', 'occupied', 'maintenance', 'out-of-order']).withMessage('Invalid status')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, type, status } = req.body;
    const db = req.app.locals.db;

    // Check if workstation exists
    const existingWorkstation = db.prepare('SELECT id FROM workstations WHERE id = ?').get(req.params.id);
    if (!existingWorkstation) {
      return res.status(404).json({ success: false, message: 'Workstation not found' });
    }

    // Check if name is taken by another workstation
    const nameConflict = db.prepare('SELECT id FROM workstations WHERE name = ? AND id != ?').get(name, req.params.id);
    if (nameConflict) {
      return res.status(400).json({ success: false, message: 'Workstation name already exists' });
    }

    db.prepare(`
      UPDATE workstations 
      SET name = ?, type = ?, status = ?
      WHERE id = ?
    `).run(name, type, status, req.params.id);

    const updatedWorkstation = db.prepare(`
      SELECT 
        w.id,
        w.name,
        w.type,
        w.status,
        w.assigned_staff_id,
        w.created_at,
        u.first_name || ' ' || u.last_name as assigned_staff_name,
        COUNT(a.id) as appointment_count
      FROM workstations w
      LEFT JOIN users u ON w.assigned_staff_id = u.id
      LEFT JOIN appointments a ON w.id = a.workstation_id AND a.status IN ('pending', 'confirmed', 'in-progress')
      WHERE w.id = ?
      GROUP BY w.id
    `).get(req.params.id);

    res.json({ success: true, workstation: updatedWorkstation });
  } catch (error) {
    console.error('Update workstation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete workstation
router.delete('/:id', (req, res) => {
  try {
    const db = req.app.locals.db;

    // Check if workstation exists
    const workstation = db.prepare('SELECT id FROM workstations WHERE id = ?').get(req.params.id);
    if (!workstation) {
      return res.status(404).json({ success: false, message: 'Workstation not found' });
    }

    // Check if workstation has upcoming appointments
    const upcomingAppointments = db.prepare(`
      SELECT COUNT(*) as count 
      FROM appointments 
      WHERE workstation_id = ? AND status IN ('pending', 'confirmed', 'in-progress')
    `).get(req.params.id);

    if (upcomingAppointments.count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete workstation with upcoming appointments. Please reassign or cancel them first.' 
      });
    }

    db.prepare('DELETE FROM workstations WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Workstation deleted successfully' });
  } catch (error) {
    console.error('Delete workstation error:', error);
    res.status(500).json({ message: 'Internal server error', error: error?.message || error });
  }
});

// Update appointment status for workstation
router.put('/:id/appointments/:appointmentId/status', (req, res) => {
  try {
    const db = req.app.locals.db;
    const { status } = req.body;
    const workstationId = req.params.id;
    const appointmentId = req.params.appointmentId;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
      });
    }

    // Check if workstation exists
    const workstation = db.prepare('SELECT id FROM workstations WHERE id = ?').get(workstationId);
    if (!workstation) {
      return res.status(404).json({ success: false, message: 'Workstation not found' });
    }

    // Check if appointment exists and belongs to this workstation
    const appointment = db.prepare('SELECT id FROM appointments WHERE id = ? AND workstation_id = ?')
      .get(appointmentId, workstationId);
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found or does not belong to this workstation' 
      });
    }

    // Update appointment status
    db.prepare('UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(status, appointmentId);

    res.json({ success: true, message: 'Appointment status updated successfully' });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Assign staff to workstation
router.put('/:id/assign-staff', (req, res) => {
  try {
    const { staffId } = req.body;
    const db = req.app.locals.db;

    if (!staffId) {
      return res.status(400).json({ success: false, message: 'Staff ID is required' });
    }

    // Check if workstation exists
    const workstation = db.prepare('SELECT id FROM workstations WHERE id = ?').get(req.params.id);
    if (!workstation) {
      return res.status(404).json({ success: false, message: 'Workstation not found' });
    }

    // Check if staff exists
    const staff = db.prepare('SELECT id FROM users WHERE id = ? AND role IN (?, ?)').get(staffId, 'staff', 'manager');
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    // Check if staff is already assigned to another workstation
    const existingAssignment = db.prepare('SELECT id FROM workstations WHERE assigned_staff_id = ?').get(staffId);
    if (existingAssignment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Staff member is already assigned to another workstation' 
      });
    }

    db.prepare('UPDATE workstations SET assigned_staff_id = ? WHERE id = ?').run(staffId, req.params.id);
    res.json({ success: true, message: 'Staff assigned to workstation successfully' });
  } catch (error) {
    console.error('Assign staff error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove staff from workstation
router.put('/:id/remove-staff', (req, res) => {
  try {
    const db = req.app.locals.db;

    // Check if workstation exists
    const workstation = db.prepare('SELECT id FROM workstations WHERE id = ?').get(req.params.id);
    if (!workstation) {
      return res.status(404).json({ success: false, message: 'Workstation not found' });
    }

    db.prepare('UPDATE workstations SET assigned_staff_id = NULL WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Staff removed from workstation successfully' });
  } catch (error) {
    console.error('Remove staff error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
