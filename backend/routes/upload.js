const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Create uploads directory structure if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
const categoriesDir = {
  products: path.join(uploadsDir, 'products'),
  industries: path.join(uploadsDir, 'industries'),
  partners: path.join(uploadsDir, 'partners'),
  blog: path.join(uploadsDir, 'blog'),
  general: path.join(uploadsDir, 'general')
};

// Ensure all directories exist
Object.values(categoriesDir).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for disk storage with organized folders
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Get category from request body or default to 'general'
    const category = req.body.category || 'general';
    const uploadPath = categoriesDir[category] || categoriesDir.general;
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Get custom name from request or use original name
    const customName = req.body.name || '';
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    
    // Create filename: customName or originalName + timestamp
    const baseName = customName || nameWithoutExt;
    const sanitizedName = baseName.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
    const timestamp = Date.now();
    const filename = `${sanitizedName}-${timestamp}${ext}`;
    
    cb(null, filename);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed'));
    }
  }
});

/**
 * POST /api/upload
 * Upload an image file to organized folders
 * Requires authentication
 * Body params: category (products|industries|partners|blog|general), name (optional custom name)
 */
router.post('/', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'No file provided' 
      });
    }

    // Get category from request
    const category = req.body.category || 'general';
    
    // Construct URL path
    const url = `/uploads/${category}/${req.file.filename}`;

    res.status(201).json({
      success: true,
      url,
      fileUrl: url, // For backward compatibility
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      category: category,
      path: req.file.path
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message || 'Failed to upload file' 
    });
  }
});

/**
 * POST /api/upload/image (backward compatibility)
 */
router.post('/image', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'No file provided' 
      });
    }

    const category = req.body.category || 'general';
    const url = `/uploads/${category}/${req.file.filename}`;

    res.status(201).json({
      success: true,
      url,
      fileUrl: url,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message || 'Failed to upload file' 
    });
  }
});

/**
 * DELETE /api/upload
 * Delete an image file
 * Requires authentication
 */
router.delete('/', requireAuth, async (req, res) => {
  try {
    const { url, path: filePath } = req.body;

    if (!url && !filePath) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'File URL or path is required' 
      });
    }

    // Extract file path from URL if provided
    let fileToDelete = filePath;
    if (url && url.startsWith('/uploads/')) {
      fileToDelete = path.join(__dirname, '..', url);
    }

    // Delete file if it exists
    if (fileToDelete && fs.existsSync(fileToDelete)) {
      fs.unlinkSync(fileToDelete);
    }

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

/**
 * DELETE /api/upload/image (backward compatibility)
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

    if (url.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

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
