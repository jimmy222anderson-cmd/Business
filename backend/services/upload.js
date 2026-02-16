const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const path = require('path');

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

/**
 * Upload file to S3
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} originalName - Original filename
 * @param {string} mimetype - File MIME type
 * @returns {Promise<string>} - Public URL of uploaded file
 */
async function uploadToS3(fileBuffer, originalName, mimetype) {
  try {
    // Generate unique filename
    const fileExtension = path.extname(originalName);
    const fileName = `${crypto.randomBytes(16).toString('hex')}${fileExtension}`;
    const key = `uploads/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: mimetype,
      ACL: 'public-read'
    });

    await s3Client.send(command);

    // Construct public URL
    const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    
    return url;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload file to S3');
  }
}

/**
 * Delete file from S3
 * @param {string} fileUrl - Public URL of file to delete
 * @returns {Promise<void>}
 */
async function deleteFromS3(fileUrl) {
  try {
    // Extract key from URL
    const urlParts = fileUrl.split('.amazonaws.com/');
    if (urlParts.length < 2) {
      throw new Error('Invalid S3 URL');
    }
    
    const key = urlParts[1];

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('S3 delete error:', error);
    throw new Error('Failed to delete file from S3');
  }
}

/**
 * Validate file type
 * @param {string} mimetype - File MIME type
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @returns {boolean}
 */
function validateFileType(mimetype, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']) {
  return allowedTypes.includes(mimetype);
}

/**
 * Validate file size
 * @param {number} size - File size in bytes
 * @param {number} maxSize - Maximum size in bytes (default 5MB)
 * @returns {boolean}
 */
function validateFileSize(size, maxSize = 5 * 1024 * 1024) {
  return size <= maxSize;
}

module.exports = {
  uploadToS3,
  deleteFromS3,
  validateFileType,
  validateFileSize
};
