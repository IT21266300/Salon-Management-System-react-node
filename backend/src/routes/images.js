import express from 'express';
import { 
  customerImageUpload, 
  staffImageUpload, 
  productImageUpload, 
  serviceImageUpload,
  processAndSaveImage,
  deleteImage 
} from '../utils/imageUpload.js';

const router = express.Router();

// Upload customer profile picture
router.post('/customers/:id', customerImageUpload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const db = req.app.locals.db;
    
    // Check if customer exists
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Delete old image if exists
    if (customer.profile_picture && customer.profile_picture !== '/default-avatar.png') {
      deleteImage(customer.profile_picture);
    }

    // Process and save new image
    const imagePath = await processAndSaveImage(file, 'customers', id);

    // Update database
    db.prepare('UPDATE customers SET profile_picture = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(imagePath, id);

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      imagePath
    });
  } catch (error) {
    console.error('Customer image upload error:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
});

// Upload staff profile picture
router.post('/staff/:id', staffImageUpload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const db = req.app.locals.db;
    
    // Check if staff member exists
    const staff = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Delete old image if exists
    if (staff.profile_picture && staff.profile_picture !== '/default-avatar.png') {
      deleteImage(staff.profile_picture);
    }

    // Process and save new image
    const imagePath = await processAndSaveImage(file, 'staff', id);

    // Update database
    db.prepare('UPDATE users SET profile_picture = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(imagePath, id);

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      imagePath
    });
  } catch (error) {
    console.error('Staff image upload error:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
});

// Upload product image
router.post('/products/:id', productImageUpload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const db = req.app.locals.db;
    
    // Check if product exists
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete old image if exists
    if (product.image_url) {
      deleteImage(product.image_url);
    }

    // Process and save new image
    const imagePath = await processAndSaveImage(file, 'products', id);

    // Update database
    db.prepare('UPDATE products SET image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(imagePath, id);

    res.json({
      success: true,
      message: 'Product image updated successfully',
      imagePath
    });
  } catch (error) {
    console.error('Product image upload error:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
});

// Upload service image
router.post('/services/:id', serviceImageUpload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const db = req.app.locals.db;
    
    // Check if service exists
    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Delete old image if exists
    if (service.image_url) {
      deleteImage(service.image_url);
    }

    // Process and save new image
    const imagePath = await processAndSaveImage(file, 'services', id);

    // Update database
    db.prepare('UPDATE services SET image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(imagePath, id);

    res.json({
      success: true,
      message: 'Service image updated successfully',
      imagePath
    });
  } catch (error) {
    console.error('Service image upload error:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
});

// Delete image endpoints
router.delete('/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;
    
    const customer = db.prepare('SELECT profile_picture FROM customers WHERE id = ?').get(id);
    if (customer && customer.profile_picture) {
      deleteImage(customer.profile_picture);
      db.prepare('UPDATE customers SET profile_picture = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(id);
    }

    res.json({ success: true, message: 'Profile picture removed successfully' });
  } catch (error) {
    console.error('Delete customer image error:', error);
    res.status(500).json({ message: 'Failed to delete image' });
  }
});

router.delete('/staff/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;
    
    const staff = db.prepare('SELECT profile_picture FROM users WHERE id = ?').get(id);
    if (staff && staff.profile_picture) {
      deleteImage(staff.profile_picture);
      db.prepare('UPDATE users SET profile_picture = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(id);
    }

    res.json({ success: true, message: 'Profile picture removed successfully' });
  } catch (error) {
    console.error('Delete staff image error:', error);
    res.status(500).json({ message: 'Failed to delete image' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;
    
    const product = db.prepare('SELECT image_url FROM products WHERE id = ?').get(id);
    if (product && product.image_url) {
      deleteImage(product.image_url);
      db.prepare('UPDATE products SET image_url = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(id);
    }

    res.json({ success: true, message: 'Product image removed successfully' });
  } catch (error) {
    console.error('Delete product image error:', error);
    res.status(500).json({ message: 'Failed to delete image' });
  }
});

router.delete('/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;
    
    const service = db.prepare('SELECT image_url FROM services WHERE id = ?').get(id);
    if (service && service.image_url) {
      deleteImage(service.image_url);
      db.prepare('UPDATE services SET image_url = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(id);
    }

    res.json({ success: true, message: 'Service image removed successfully' });
  } catch (error) {
    console.error('Delete service image error:', error);
    res.status(500).json({ message: 'Failed to delete image' });
  }
});

export default router;
