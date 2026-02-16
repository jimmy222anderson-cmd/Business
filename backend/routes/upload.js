const express = require('express');
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');
const { uploadToS3, deleteFromS3, validateFileType, validateFileSize } = require('../services/upload');

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * POST /api/upload/image
 * Upload an image file
 * Requires authentication
 */
router.post('/image', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'No file provided' 
      });
    }

    // Validate file type
    if (!validateFileType(req.file.mimetype)) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed' 
      });
    }

    // Validate file size
    if (!validateFileSize(req.file.size)) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'File size exceeds 5MB limit' 
      });
    }

    // Upload to S3
    const url = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    res.status(201).json({
      success: true,
      url,
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to upload file' 
    });
  }
});

/**
 * DELETE /api/upload/image
 * Delete an image file
 * Requires authentication
 */
router.delete('/image', requireAuth, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'File URL is required' 
      });
    }

    await deleteFromS3(url);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to delete file' 
    });
  }
});

module.exports = router;
