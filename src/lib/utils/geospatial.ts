/**
 * Utility functions for geospatial data conversion and export
 */

/**
 * Convert GeoJSON geometry to KML format
 */
export function geoJSONToKML(geometry: any, name: string = 'AOI'): string {
  const kmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${escapeXML(name)}</name>
    <Style id="aoiStyle">
      <LineStyle>
        <color>ff00ffff</color>
        <width>2</width>
      </LineStyle>
      <PolyStyle>
        <color>4d00ffff</color>
      </PolyStyle>
    </Style>
    <Placemark>
      <name>${escapeXML(name)}</name>
      <styleUrl>#aoiStyle</styleUrl>`;

  const kmlFooter = `    </Placemark>
  </Document>
</kml>`;

  let kmlGeometry = '';

  if (geometry.type === 'Polygon') {
    kmlGeometry = convertPolygonToKML(geometry.coordinates);
  } else if (geometry.type === 'Point') {
    kmlGeometry = convertPointToKML(geometry.coordinates);
  } else if (geometry.type === 'LineString') {
    kmlGeometry = convertLineStringToKML(geometry.coordinates);
  } else if (geometry.type === 'MultiPolygon') {
    kmlGeometry = convertMultiPolygonToKML(geometry.coordinates);
  } else {
    throw new Error(`Unsupported geometry type: ${geometry.type}`);
  }

  return kmlHeader + kmlGeometry + kmlFooter;
}

/**
 * Convert Polygon coordinates to KML format
 */
function convertPolygonToKML(coordinates: number[][][]): string {
  let kml = '\n      <Polygon>\n';
  
  // Outer boundary
  kml += '        <outerBoundaryIs>\n';
  kml += '          <LinearRing>\n';
  kml += '            <coordinates>\n';
  kml += coordinatesToKMLString(coordinates[0]);
  kml += '            </coordinates>\n';
  kml += '          </LinearRing>\n';
  kml += '        </outerBoundaryIs>\n';
  
  // Inner boundaries (holes)
  for (let i = 1; i < coordinates.length; i++) {
    kml += '        <innerBoundaryIs>\n';
    kml += '          <LinearRing>\n';
    kml += '            <coordinates>\n';
    kml += coordinatesToKMLString(coordinates[i]);
    kml += '            </coordinates>\n';
    kml += '          </LinearRing>\n';
    kml += '        </innerBoundaryIs>\n';
  }
  
  kml += '      </Polygon>\n';
  return kml;
}

/**
 * Convert MultiPolygon coordinates to KML format
 */
function convertMultiPolygonToKML(coordinates: number[][][][]): string {
  let kml = '\n      <MultiGeometry>\n';
  
  for (const polygonCoords of coordinates) {
    kml += '        <Polygon>\n';
    kml += '          <outerBoundaryIs>\n';
    kml += '            <LinearRing>\n';
    kml += '              <coordinates>\n';
    kml += coordinatesToKMLString(polygonCoords[0]);
    kml += '              </coordinates>\n';
    kml += '            </LinearRing>\n';
    kml += '          </outerBoundaryIs>\n';
    kml += '        </Polygon>\n';
  }
  
  kml += '      </MultiGeometry>\n';
  return kml;
}

/**
 * Convert Point coordinates to KML format
 */
function convertPointToKML(coordinates: number[]): string {
  return `\n      <Point>
        <coordinates>${coordinates[0]},${coordinates[1]},0</coordinates>
      </Point>\n`;
}

/**
 * Convert LineString coordinates to KML format
 */
function convertLineStringToKML(coordinates: number[][]): string {
  let kml = '\n      <LineString>\n';
  kml += '        <coordinates>\n';
  kml += coordinatesToKMLString(coordinates);
  kml += '        </coordinates>\n';
  kml += '      </LineString>\n';
  return kml;
}

/**
 * Convert coordinate array to KML coordinate string
 * GeoJSON format: [lng, lat] -> KML format: lng,lat,0
 */
function coordinatesToKMLString(coordinates: number[][]): string {
  return coordinates
    .map(coord => `              ${coord[0]},${coord[1]},0`)
    .join('\n') + '\n';
}

/**
 * Escape XML special characters
 */
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Trigger file download in the browser
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate timestamp for filename
 */
export function generateTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
}

/**
 * Export AOI as GeoJSON file
 */
export function exportAsGeoJSON(geometry: any, filename?: string): void {
  const geoJSON = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          name: 'Area of Interest',
          exported_at: new Date().toISOString(),
        },
        geometry: geometry,
      },
    ],
  };

  const content = JSON.stringify(geoJSON, null, 2);
  const timestamp = generateTimestamp();
  const defaultFilename = `aoi-export-${timestamp}.geojson`;
  
  downloadFile(content, filename || defaultFilename, 'application/geo+json');
}

/**
 * Export AOI as KML file
 */
export function exportAsKML(geometry: any, filename?: string): void {
  const kmlContent = geoJSONToKML(geometry, 'Area of Interest');
  const timestamp = generateTimestamp();
  const defaultFilename = `aoi-export-${timestamp}.kml`;
  
  downloadFile(kmlContent, filename || defaultFilename, 'application/vnd.google-earth.kml+xml');
}
