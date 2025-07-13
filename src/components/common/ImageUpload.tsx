import React, { useState, useRef } from 'react';
import {
  Box,
  Avatar,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';

interface ImageUploadProps {
  currentImage?: string | null;
  entityType: 'customers' | 'staff' | 'products' | 'services';
  entityId: string;
  onImageUpdate?: (newImagePath: string | null) => void;
  size?: number;
  variant?: 'avatar' | 'rectangle';
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  entityType,
  entityId,
  onImageUpdate,
  size = 100,
  variant = 'avatar',
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return null;
    // Handle full URLs (for external images) or relative paths (for local uploads)
    if (imagePath.startsWith('http')) return imagePath;
    // The backend returns paths like "/customers/filename.jpg", so we add the uploads prefix
    const fullUrl = `http://localhost:3000/uploads${imagePath}`;
    return fullUrl;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`http://localhost:3000/api/images/${entityType}/${entityId}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned invalid response format');
      }

      const data = await response.json();

      if (data.success) {
        onImageUpdate?.(data.imagePath);
      } else {
        setError(data.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to upload image');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    setUploading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3000/api/images/${entityType}/${entityId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        onImageUpdate?.(null);
      } else {
        setError(data.message || 'Failed to delete image');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete image');
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const imageUrl = getImageUrl(currentImage);

  if (variant === 'avatar') {
    return (
      <Box sx={{ position: 'relative', display: 'inline-block' }}>
        <Avatar
          src={imageUrl || undefined}
          sx={{ 
            width: size, 
            height: size, 
            cursor: disabled ? 'default' : 'pointer',
            bgcolor: 'primary.light'
          }}
          onClick={!disabled ? () => setPreviewOpen(true) : undefined}
        >
          {!imageUrl && <PhotoCameraIcon />}
        </Avatar>
        
        {!disabled && (
          <>
            <IconButton
              size="small"
              sx={{
                position: 'absolute',
                bottom: -5,
                right: -5,
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
              onClick={triggerFileInput}
              disabled={uploading}
            >
              {uploading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <PhotoCameraIcon fontSize="small" />
              )}
            </IconButton>

            {imageUrl && (
              <IconButton
                size="small"
                sx={{
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  bgcolor: 'error.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'error.dark' },
                }}
                onClick={handleDeleteImage}
                disabled={uploading}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 1, maxWidth: size }}>
            {error}
          </Alert>
        )}

        {/* Image Preview Dialog */}
        <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md">
          <DialogTitle>Image Preview</DialogTitle>
          <DialogContent>
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Preview"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // Rectangle variant for products/services
  return (
    <Box>
      <Box
        sx={{
          width: '100%',
          height: 200,
          border: '2px dashed',
          borderColor: imageUrl ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          cursor: disabled ? 'default' : 'pointer',
          backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: imageUrl ? 'transparent' : 'grey.50',
        }}
        onClick={!disabled ? triggerFileInput : undefined}
      >
        {!imageUrl && (
          <>
            <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Click to upload image
            </Typography>
          </>
        )}

        {uploading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {imageUrl && !disabled && (
          <IconButton
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'error.main',
              color: 'white',
              '&:hover': { bgcolor: 'error.dark' },
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteImage();
            }}
            disabled={uploading}
          >
            <DeleteIcon />
          </IconButton>
        )}
      </Box>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ImageUpload;
