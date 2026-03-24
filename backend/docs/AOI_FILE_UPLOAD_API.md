# AOI File Upload API Documentation

## Overview
The AOI (Area of Interest) File Upload API allows users to upload KML or GeoJSON files to define their area of interest. The API validates the file, parses it, and returns the extracted coordinates in GeoJSON format.

## Endpoint

### POST /api/public/upload-aoi

Upload and parse a KML or GeoJSON file containing area of interest geometries.

**Authentication:** Not required (public endpoint)

**Content-Type:** `multipart/form-data`

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file | File | Yes | KML or GeoJSON file (max 5MB) |

**Supported File Types:**
- KML (`.kml`) - Keyhole Markup Language
- GeoJSON (`.geojson`, `.json`) - Geographic JSON

**File Size Limit:** 5MB

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "File parsed successfully",
  "data": {
    "geometries": [
      {
        "type": "Polygon",
        "coordinates": [
          [
            [-122.4, 37.8, 0],
            [-122.4, 37.7, 0],
            [-122.3, 37.7, 0],
            [-122.3, 37.8, 0],
            [-122.4, 37.8, 0]
          ]
        ],
        "properties": {
          "name": "Test Polygon",
          "description": "A test polygon for AOI upload"
        }
      }
    ],
    "count": 1,
    "originalFilename": "my-aoi.kml",
    "fileSize": 597
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| success | Boolean | Indicates if the operation was successful |
| message | String | Human-readable success message |
| data.geometries | Array | Array of parsed geometry objects |
| data.geometries[].type | String | Geometry type (Polygon, Point, LineString, etc.) |
| data.geometries[].coordinates | Array | Coordinate arrays in GeoJSON format |
| data.geometries[].properties | Object | Properties/metadata from the original file |
| data.count | Number | Number of geometries found in the file |
| data.originalFilename | String | Original name of the uploaded file |
| data.fileSize | Number | Size of the uploaded file in bytes |

**Error Responses:**

### 400 Bad Request - No File Provided
```json
{
  "error": "Bad Request",
  "message": "No file provided"
}
```

### 400 Bad Request - Invalid File Type
```json
{
  "error": "Bad Request",
  "message": "Invalid file type. Only KML and GeoJSON files are allowed"
}
```

### 400 Bad Request - Unsupported Format
```json
{
  "error": "Bad Request",
  "message": "Unsupported file format"
}
```

### 400 Bad Request - Parse Error
```json
{
  "error": "Bad Request",
  "message": "Failed to parse KML file: [error details]"
}
```

### 400 Bad Request - No Valid Geometries
```json
{
  "error": "Bad Request",
  "message": "No valid geometries found in file"
}
```

### 413 Payload Too Large
```json
{
  "error": "Payload Too Large",
  "message": "File size exceeds 5MB limit"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Failed to process file"
}
```

## Usage Examples

### JavaScript (Fetch API)

```javascript
const fileInput = document.getElementById('file-input');
const file = fileInput.files[0];

const formData = new FormData();
formData.append('file', file);

fetch('http://localhost:5000/api/public/upload-aoi', {
  method: 'POST',
  body: formData
})
  .then(response => response.json())
  .then(data => {
    console.log('Parsed geometries:', data.data.geometries);
    // Use the coordinates to display on map
  })
  .catch(error => {
    console.error('Upload error:', error);
  });
```

### JavaScript (Axios)

```javascript
import axios from 'axios';

const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(
      'http://localhost:5000/api/public/upload-aoi',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data.data.geometries;
  } catch (error) {
    if (error.response) {
      console.error('Error:', error.response.data.message);
    }
    throw error;
  }
};
```

### cURL

```bash
curl -X POST http://localhost:5000/api/public/upload-aoi \
  -F "file=@/path/to/your/file.kml"
```

### Node.js (with form-data)

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const formData = new FormData();
formData.append('file', fs.createReadStream('./my-aoi.kml'));

axios.post('http://localhost:5000/api/public/upload-aoi', formData, {
  headers: formData.getHeaders()
})
  .then(response => {
    console.log('Success:', response.data);
  })
  .catch(error => {
    console.error('Error:', error.response.data);
  });
```

## Supported Geometry Types

The API supports all standard GeoJSON geometry types:

- **Point** - Single coordinate
- **LineString** - Array of coordinates forming a line
- **Polygon** - Array of linear rings (first is outer boundary, rest are holes)
- **MultiPoint** - Array of points
- **MultiLineString** - Array of line strings
- **MultiPolygon** - Array of polygons
- **GeometryCollection** - Collection of different geometry types

## KML Parsing

The API uses `@tmcw/togeojson` library to convert KML to GeoJSON format. The following KML elements are supported:

- **Placemark** - Converted to GeoJSON Feature
- **Polygon** - Converted to GeoJSON Polygon
- **Point** - Converted to GeoJSON Point
- **LineString** - Converted to GeoJSON LineString
- **MultiGeometry** - Converted to appropriate Multi* type
- **Properties** - Name, description, and extended data are preserved

## GeoJSON Parsing

The API accepts standard GeoJSON formats:

- **FeatureCollection** - Multiple features with geometries
- **Feature** - Single feature with geometry
- **Geometry** - Direct geometry object (Point, Polygon, etc.)

## Validation Rules

1. **File Type Validation:**
   - File extension must be `.kml`, `.geojson`, or `.json`
   - MIME type must be one of:
     - `application/vnd.google-earth.kml+xml`
     - `application/geo+json`
     - `application/json`
     - `text/xml`
     - `application/xml`
     - `text/plain`

2. **File Size Validation:**
   - Maximum file size: 5MB (5,242,880 bytes)
   - Files exceeding this limit will be rejected with 413 error

3. **Content Validation:**
   - KML files must be valid XML with proper KML structure
   - GeoJSON files must be valid JSON with proper GeoJSON structure
   - At least one valid geometry must be present in the file

## Integration with Imagery Request

The parsed coordinates can be used directly with the Imagery Request API:

```javascript
// 1. Upload and parse file
const uploadResponse = await fetch('/api/public/upload-aoi', {
  method: 'POST',
  body: formData
});

const { data } = await uploadResponse.json();
const geometry = data.geometries[0]; // Use first geometry

// 2. Submit imagery request with parsed coordinates
const requestData = {
  full_name: "John Doe",
  email: "john@example.com",
  aoi_type: geometry.type.toLowerCase(),
  aoi_coordinates: {
    type: geometry.type,
    coordinates: geometry.coordinates
  },
  // ... other fields
};

await fetch('/api/public/imagery-requests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(requestData)
});
```

## Testing

A comprehensive test suite is available at `backend/scripts/test-aoi-upload.js`.

Run tests:
```bash
cd backend
node scripts/test-aoi-upload.js
```

The test suite covers:
- ✓ KML file upload and parsing
- ✓ GeoJSON file upload and parsing
- ✓ Invalid file type rejection
- ✓ File size limit enforcement
- ✓ No file provided error handling

## Security Considerations

1. **File Size Limits:** Enforced at 5MB to prevent DoS attacks
2. **File Type Validation:** Only KML and GeoJSON files are accepted
3. **Memory Storage:** Files are processed in memory (not saved to disk)
4. **Input Sanitization:** All parsed content is validated before returning
5. **Error Handling:** Detailed errors only shown in development mode

## Performance Notes

- Files are processed in memory using multer's `memoryStorage`
- No disk I/O required for file processing
- Parsing is synchronous but fast for files under 5MB
- Consider implementing rate limiting for production use

## Future Enhancements

Potential improvements for future versions:

1. Support for compressed files (KMZ)
2. Support for Shapefile format
3. Coordinate system transformation
4. Geometry simplification for large files
5. Async processing for very large files
6. Webhook notifications for processing completion
7. File validation preview before submission
