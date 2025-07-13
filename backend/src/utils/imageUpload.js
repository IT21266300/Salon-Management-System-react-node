import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure upload directories exist
const ensureUploadDirs = () => {
  const baseUploadDir = path.join(__dirname, '../../../uploads');
  const dirs = [
    'customers',
    'staff', 
    'products',
    'services'
  ];
  
  // Create base upload directory if it doesn't exist
  if (!fs.existsSync(baseUploadDir)) {
    fs.mkdirSync(baseUploadDir, { recursive: true });
  }
  
  // Create subdirectories
  dirs.forEach(dir => {
    const fullPath = path.join(baseUploadDir, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
};

ensureUploadDirs();

// Configure multer for different entity types
const createMulterConfig = (entityType) => {
  return multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      // Check if file is an image
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    }
  });
};

// Process and save image
const processAndSaveImage = async (file, entityType, entityId, sizes = {}) => {
  try {
    // Generate unique filename
    const fileExtension = '.jpg'; // Convert all to jpg for consistency
    const filename = `${entityId}_${uuidv4()}${fileExtension}`;
    const uploadPath = path.join(__dirname, '../../../uploads', entityType);
    const filePath = path.join(uploadPath, filename);

    // Default sizes for different entity types
    const defaultSizes = {
      customers: { width: 300, height: 300 },
      staff: { width: 300, height: 300 },
      products: { width: 600, height: 400 },
      services: { width: 800, height: 600 }
    };

    const targetSize = sizes[entityType] || defaultSizes[entityType] || { width: 400, height: 400 };

    // Process image with sharp
    await sharp(file.buffer)
      .resize(targetSize.width, targetSize.height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85 })
      .toFile(filePath);

    // Return the relative path for database storage
    return `/${entityType}/${filename}`;
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image');
  }
};

// Delete image file
const deleteImage = (imagePath) => {
  try {
    if (imagePath && imagePath !== '/default-avatar.png') {
      const fullPath = path.join(__dirname, '../../../uploads', imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

// Multer configurations for different entity types
export const customerImageUpload = createMulterConfig('customers');
export const staffImageUpload = createMulterConfig('staff');
export const productImageUpload = createMulterConfig('products');
export const serviceImageUpload = createMulterConfig('services');

export { processAndSaveImage, deleteImage };
