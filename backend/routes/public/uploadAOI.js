const express = require('express');
const multer = require('multer');
const { DOMParser } = require('@xmldom/xmldom');
const toGeoJSON = require('@tmcw/togeojson');
const router = express.Router();

// Configure multer for memory storage (we'll process files in memory)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Validate file type based on extension and mimetype
    const allowedExtensions = ['.kml', '.geojson', '.json'];
    const allowedMimetypes = [
      'application/vnd.google-earth.kml+xml',
      'application/geo+json',
      'application/json',
      'text/xml',
      'application/xml',
      'text/plain'
    ];
    
    const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
    
    if (allowedExtensions.includes(ext) || allowedMimetypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only KML and GeoJSON files are allowed'));
    }
  }
});

/**
 * Parse KML file to GeoJSON
 * @param {Buffer} fileBuffer - KML file buffer
 * @returns {Object} - GeoJSON object
 */
function parseKML(fileBuffer) {
  try {
    const kmlString = fileBuffer.toString('utf-8');
    const kmlDoc = new DOMParser().parseFromString(kmlString, 'text/xml');
    const geoJSON = toGeoJSON.kml(kmlDoc);
    return geoJSON;
  } catch (error) {
    throw new Error('Failed to parse KML file: ' + error.message);
  }
}

/**
 * Parse GeoJSON file
 * @param {Buffer} fileBuffer - GeoJSON file buffer
 * @returns {Object} - GeoJSON object
 */
function parseGeoJSON(fileBuffer) {
  try {
    const geoJSONString = fileBuffer.toString('utf-8');
    const geoJSON = JSON.parse(geoJSONString);
    
    // Validate that it's a valid GeoJSON structure
    if (!geoJSON.type) {
      throw new Error('Invalid GeoJSON: missing type property');
    }
    
    return geoJSON;
  } catch (error) {
    throw new Error('Failed to parse GeoJSON file: ' + error.message);
  }
}

/**
 * Strip altitude (z-coordinate) from coordinates to ensure 2D format
 * @param {Array} coords - Coordinate array
 * @param {String} geometryType - Geometry type
 * @returns {Array} - 2D coordinate array
 */
function stripAltitude(coords, geometryType) {
  if (geometryType === 'Point') {
    // Point: [lng, lat, alt?] -> [lng, lat]
    return coords.slice(0, 2);
  } else if (geometryType === 'LineString') {
    // LineString: [[lng, lat, alt?], ...] -> [[lng, lat], ...]
    return coords.map(coord => coord.slice(0, 2));
  } else if (geometryType === 'Polygon') {
    // Polygon: [[[lng, lat, alt?], ...], ...] -> [[[lng, lat], ...], ...]
    return coords.map(ring => ring.map(coord => coord.slice(0, 2)));
  } else if (geometryType === 'MultiPoint') {
    // MultiPoint: [[lng, lat, alt?], ...] -> [[lng, lat], ...]
    return coords.map(coord => coord.slice(0, 2));
  } else if (geometryType === 'MultiLineString') {
    // MultiLineString: [[[lng, lat, alt?], ...], ...] -> [[[lng, lat], ...], ...]
    return coords.map(line => line.map(coord => coord.slice(0, 2)));
  } else if (geometryType === 'MultiPolygon') {
    // MultiPolygon: [[[[lng, lat, alt?], ...], ...], ...] -> [[[[lng, lat], ...], ...], ...]
    return coords.map(polygon => polygon.map(ring => ring.map(coord => coord.slice(0, 2))));
  }
  
  return coords;
}

/**
 * Extract coordinates from GeoJSON
 * @param {Object} geoJSON - GeoJSON object
 * @returns {Array} - Array of coordinate arrays
 */
function extractCoordinates(geoJSON) {
  const coordinates = [];
  
  if (geoJSON.type === 'FeatureCollection') {
    // Extract coordinates from all features
    geoJSON.features.forEach(feature => {
      if (feature.geometry && feature.geometry.coordinates) {
        coordinates.push({
          type: feature.geometry.type,
          coordinates: stripAltitude(feature.geometry.coordinates, feature.geometry.type),
          properties: feature.properties || {}
        });
      }
    });
  } else if (geoJSON.type === 'Feature') {
    // Single feature
    if (geoJSON.geometry && geoJSON.geometry.coordinates) {
      coordinates.push({
        type: geoJSON.geometry.type,
        coordinates: stripAltitude(geoJSON.geometry.coordinates, geoJSON.geometry.type),
        properties: geoJSON.properties || {}
      });
    }
  } else if (geoJSON.type && geoJSON.coordinates) {
    // Direct geometry object
    coordinates.push({
      type: geoJSON.type,
      coordinates: stripAltitude(geoJSON.coordinates, geoJSON.type),
      properties: {}
    });
  }
  
  return coordinates;
}

/**
 * POST /api/public/upload-aoi
 * Upload and parse KML or GeoJSON file
 * Returns parsed coordinates in GeoJSON format
 */
router.post('/upload-aoi', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      // Handle multer errors
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            error: 'Payload Too Large',
            message: 'File size exceeds 5MB limit'
          });
        }
        return res.status(400).json({
          error: 'Bad Request',
          message: err.message
        });
      }
      
      if (err.message.includes('Invalid file type')) {
        return res.status(400).json({
          error: 'Bad Request',
          message: err.message
        });
      }
      
      // Handle busboy "Unexpected end of form" error (no file provided)
      if (err.message.includes('Unexpected end of form')) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'No file provided'
        });
      }
      
      return res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Failed to process file'
      });
    }
    
    // Continue with file processing
    processUpload(req, res);
  });
});

async function processUpload(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'No file provided'
      });
    }

    const fileExtension = req.file.originalname.toLowerCase().slice(req.file.originalname.lastIndexOf('.'));
    let geoJSON;

    // Parse file based on extension
    if (fileExtension === '.kml') {
      geoJSON = parseKML(req.file.buffer);
    } else if (fileExtension === '.geojson' || fileExtension === '.json') {
      geoJSON = parseGeoJSON(req.file.buffer);
    } else {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Unsupported file format'
      });
    }

    // Extract coordinates
    const coordinates = extractCoordinates(geoJSON);

    // Debug logging
    console.log('Parsed GeoJSON type:', geoJSON.type);
    console.log('Extracted coordinates count:', coordinates.length);
    if (process.env.NODE_ENV === 'development') {
      console.log('GeoJSON structure:', JSON.stringify(geoJSON, null, 2));
    }

    if (coordinates.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'No valid geometries found in file',
        debug: process.env.NODE_ENV === 'development' ? {
          geoJSONType: geoJSON.type,
          hasFeatures: !!geoJSON.features,
          hasGeometry: !!geoJSON.geometry,
          hasCoordinates: !!geoJSON.coordinates
        } : undefined
      });
    }

    res.status(200).json({
      success: true,
      message: 'File parsed successfully',
      data: {
        geometries: coordinates,
        count: coordinates.length,
        originalFilename: req.file.originalname,
        fileSize: req.file.size
      }
    });
  } catch (error) {
    console.error('File upload/parse error:', error);

    // Handle specific error types
    if (error.message.includes('File too large')) {
      return res.status(413).json({
        error: 'Payload Too Large',
        message: 'File size exceeds 5MB limit'
      });
    }

    if (error.message.includes('Invalid file type')) {
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message
      });
    }

    if (error.message.includes('Failed to parse')) {
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to process file'
    });
  }
}

module.exports = router;
