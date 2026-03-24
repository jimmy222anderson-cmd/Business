import { useState, useRef, useCallback } from 'react';
import { Upload, FileUp, X, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { exportAsGeoJSON, exportAsKML } from '@/lib/utils/geospatial';

interface AOIFileUploadProps {
  onGeometriesLoaded: (geometries: any[]) => void;
  onClearAOI?: () => void;
  currentAOI?: any | null;
  className?: string;
}

interface UploadedFile {
  name: string;
  size: number;
  geometries: any[];
}

export const AOIFileUpload = ({ onGeometriesLoaded, onClearAOI, currentAOI = null, className = '' }: AOIFileUploadProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Validate file before upload
  const validateFile = (file: File): string | null => {
    const validExtensions = ['.kml', '.geojson', '.json'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      return 'Invalid file type. Please upload a KML or GeoJSON file.';
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return 'File size exceeds 5MB limit.';
    }
    
    return null;
  };

  // Calculate geodesic area using spherical excess formula
  // Returns area in square kilometers
  const calculateGeodesicArea = (latlngs: Array<{lat: number, lng: number}>): number => {
    const earthRadius = 6371; // Earth's radius in kilometers
    
    if (latlngs.length < 3) return 0;
    
    let area = 0;
    const len = latlngs.length;
    
    for (let i = 0; i < len; i++) {
      const p1 = latlngs[i];
      const p2 = latlngs[(i + 1) % len];
      
      // Convert to radians
      const lat1Rad = (p1.lat * Math.PI) / 180;
      const lat2Rad = (p2.lat * Math.PI) / 180;
      const lngDiff = ((p2.lng - p1.lng) * Math.PI) / 180;
      
      // Spherical excess formula
      area += lngDiff * (2 + Math.sin(lat1Rad) + Math.sin(lat2Rad));
    }
    
    area = Math.abs(area * earthRadius * earthRadius / 2);
    
    return parseFloat(area.toFixed(2));
  };

  // Validate geometry coordinates are in 2D format
  const validateGeometry = (geometry: any): boolean => {
    if (!geometry || !geometry.coordinates) return false;
    
    try {
      if (geometry.type === 'Polygon') {
        // Check if all coordinates are 2D [lng, lat]
        return geometry.coordinates[0].every((coord: number[]) => 
          Array.isArray(coord) && coord.length === 2
        );
      } else if (geometry.type === 'Point') {
        return Array.isArray(geometry.coordinates) && geometry.coordinates.length === 2;
      } else if (geometry.type === 'LineString') {
        return geometry.coordinates.every((coord: number[]) => 
          Array.isArray(coord) && coord.length === 2
        );
      } else if (geometry.type === 'MultiPolygon') {
        return geometry.coordinates[0][0].every((coord: number[]) => 
          Array.isArray(coord) && coord.length === 2
        );
      }
      
      return true;
    } catch (error) {
      return false;
    }
  };

  // Validate geometry area is within acceptable range (1-5000 km²)
  const validateGeometryArea = (geometry: any): { valid: boolean; area?: number; error?: string } => {
    if (!geometry || !geometry.coordinates) {
      return { valid: false, error: 'Invalid geometry' };
    }
    
    try {
      if (geometry.type === 'Polygon') {
        // Convert coordinates to lat/lng format
        const coords = geometry.coordinates[0].map((coord: number[]) => ({
          lat: coord[1],
          lng: coord[0]
        }));
        
        const areaInKm2 = calculateGeodesicArea(coords);
        
        if (areaInKm2 < 1) {
          return { valid: false, area: areaInKm2, error: 'Area too small (minimum 1 km²)' };
        }
        
        if (areaInKm2 > 5000) {
          return { valid: false, area: areaInKm2, error: 'Area too large (maximum 5,000 km²)' };
        }
        
        return { valid: true, area: areaInKm2 };
      } else if (geometry.type === 'MultiPolygon') {
        // For MultiPolygon, validate the first polygon
        const coords = geometry.coordinates[0][0].map((coord: number[]) => ({
          lat: coord[1],
          lng: coord[0]
        }));
        
        const areaInKm2 = calculateGeodesicArea(coords);
        
        if (areaInKm2 < 1) {
          return { valid: false, area: areaInKm2, error: 'Area too small (minimum 1 km²)' };
        }
        
        if (areaInKm2 > 5000) {
          return { valid: false, area: areaInKm2, error: 'Area too large (maximum 5,000 km²)' };
        }
        
        return { valid: true, area: areaInKm2 };
      }
      
      // For non-polygon types, skip area validation
      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Failed to calculate area' };
    }
  };

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    setError(null);
    
    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      toast({
        title: 'Invalid File',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const response = await apiClient.uploadFile('/public/upload-aoi', file);
      
      if (response.success && response.data) {
        const { geometries, count, originalFilename, fileSize } = response.data;
        
        // Validate that geometries are in correct 2D format
        const invalidGeometries = geometries.filter((g: any) => !validateGeometry(g));
        
        if (invalidGeometries.length > 0) {
          setError('The uploaded file contains 3D coordinates. Please restart the backend server or use a file with 2D coordinates only.');
          toast({
            title: 'Invalid Coordinates',
            description: 'The file contains 3D coordinates (with altitude). Please restart the backend server to apply the fix.',
            variant: 'destructive',
          });
          return;
        }
        
        // Validate geometry area for polygons
        const firstGeometry = geometries[0];
        if (firstGeometry.type === 'Polygon' || firstGeometry.type === 'MultiPolygon') {
          const areaValidation = validateGeometryArea(firstGeometry);
          
          if (!areaValidation.valid) {
            const areaText = areaValidation.area 
              ? ` (${areaValidation.area.toFixed(2)} km²)` 
              : '';
            setError(areaValidation.error + areaText);
            toast({
              title: 'Invalid Area',
              description: areaValidation.error + areaText,
              variant: 'destructive',
            });
            return;
          }
        }
        
        setUploadedFile({
          name: originalFilename,
          size: fileSize,
          geometries,
        });
        
        // Notify parent component
        onGeometriesLoaded(geometries);
        
        toast({
          title: 'File Uploaded Successfully',
          description: `Loaded ${count} ${count === 1 ? 'geometry' : 'geometries'} from ${originalFilename}`,
        });
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to upload file. Please try again.';
      setError(errorMessage);
      toast({
        title: 'Upload Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  }, [onGeometriesLoaded, toast]);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset input value to allow uploading the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag and drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle clear uploaded file
  const handleClear = () => {
    setUploadedFile(null);
    setError(null);
    // Clear the AOI from the map as well
    if (onClearAOI) {
      onClearAOI();
    }
  };

  // Handle click on upload area
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Handle download as GeoJSON
  const handleDownloadGeoJSON = () => {
    if (!currentAOI?.geoJSON?.geometry) {
      toast({
        title: 'No AOI Available',
        description: 'Please draw or upload an area of interest first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      exportAsGeoJSON(currentAOI.geoJSON.geometry);
      toast({
        title: 'Download Started',
        description: 'Your AOI has been exported as GeoJSON.',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export AOI as GeoJSON.',
        variant: 'destructive',
      });
    }
  };

  // Handle download as KML
  const handleDownloadKML = () => {
    if (!currentAOI?.geoJSON?.geometry) {
      toast({
        title: 'No AOI Available',
        description: 'Please draw or upload an area of interest first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      exportAsKML(currentAOI.geoJSON.geometry);
      toast({
        title: 'Download Started',
        description: 'Your AOI has been exported as KML.',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export AOI as KML.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".kml,.geojson,.json"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload Area */}
      {!uploadedFile && (
        <Card
          className={`
            border-2 border-dashed transition-all cursor-pointer
            ${isDragging 
              ? 'border-yellow-500 bg-yellow-500/10' 
              : 'border-slate-600 hover:border-yellow-500/50 bg-slate-800'
            }
            ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={!isUploading ? handleClick : undefined}
        >
          <div className="p-6 text-center">
            <div className="flex justify-center mb-3">
              {isUploading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
              ) : (
                <FileUp className="h-12 w-12 text-slate-400" />
              )}
            </div>
            
            <h3 className="text-sm font-semibold text-white mb-1">
              {isUploading ? 'Uploading...' : 'Upload AOI File'}
            </h3>
            
            <p className="text-xs text-slate-400 mb-3">
              {isUploading 
                ? 'Processing your file...' 
                : 'Drag and drop or click to browse'
              }
            </p>
            
            {!isUploading && (
              <div className="space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-yellow-500 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick();
                  }}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </Button>
                
                <p className="text-xs text-slate-500">
                  Supported formats: KML, GeoJSON (max 5MB)
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Uploaded File Info */}
      {uploadedFile && (
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white mb-1 truncate">
                  {uploadedFile.name}
                </h4>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">
                    Size: {formatFileSize(uploadedFile.size)}
                  </p>
                  <p className="text-xs text-slate-400">
                    Geometries: {uploadedFile.geometries.length}
                  </p>
                </div>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClear}
              className="text-slate-400 hover:text-white hover:bg-slate-700 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mt-3">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Help Text */}
      {!uploadedFile && !error && (
        <div className="mt-3 text-xs text-slate-500 space-y-1">
          <p className="font-semibold">Supported file formats:</p>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li>KML (.kml) - Keyhole Markup Language</li>
            <li>GeoJSON (.geojson, .json) - Geographic JSON</li>
          </ul>
          <p className="mt-2">Maximum file size: 5MB</p>
        </div>
      )}

      {/* Download AOI Section */}
      {currentAOI && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <h4 className="text-sm font-semibold text-white mb-3">Download AOI</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadGeoJSON}
              className="bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-yellow-500 text-white"
            >
              <Download className="mr-2 h-4 w-4" />
              GeoJSON
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadKML}
              className="bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-yellow-500 text-white"
            >
              <Download className="mr-2 h-4 w-4" />
              KML
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
