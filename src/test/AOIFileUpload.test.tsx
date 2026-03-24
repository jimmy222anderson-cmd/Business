import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AOIFileUpload } from '@/components/AOIFileUpload';
import { apiClient } from '@/lib/api-client';

// Mock the API client
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    uploadFile: vi.fn(),
  },
}));

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('AOIFileUpload', () => {
  const mockOnGeometriesLoaded = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders upload area with correct text', () => {
    render(<AOIFileUpload onGeometriesLoaded={mockOnGeometriesLoaded} />);
    
    expect(screen.getByText('Upload AOI File')).toBeInTheDocument();
    expect(screen.getByText('Drag and drop or click to browse')).toBeInTheDocument();
    expect(screen.getByText('Supported formats: KML, GeoJSON (max 5MB)')).toBeInTheDocument();
  });

  it('displays help text with supported formats', () => {
    render(<AOIFileUpload onGeometriesLoaded={mockOnGeometriesLoaded} />);
    
    expect(screen.getByText('Supported file formats:')).toBeInTheDocument();
    expect(screen.getByText(/KML \(.kml\)/)).toBeInTheDocument();
    expect(screen.getByText(/GeoJSON \(.geojson, .json\)/)).toBeInTheDocument();
    expect(screen.getByText('Maximum file size: 5MB')).toBeInTheDocument();
  });

  it('validates file type before upload', async () => {
    render(<AOIFileUpload onGeometriesLoaded={mockOnGeometriesLoaded} />);
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByRole('button', { name: /choose file/i }).parentElement?.querySelector('input[type="file"]');
    
    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });
      
      fireEvent.change(input);
      
      await waitFor(() => {
        expect(apiClient.uploadFile).not.toHaveBeenCalled();
      });
    }
  });

  it('validates file size before upload', async () => {
    render(<AOIFileUpload onGeometriesLoaded={mockOnGeometriesLoaded} />);
    
    // Create a file larger than 5MB
    const largeContent = new Array(6 * 1024 * 1024).fill('a').join('');
    const file = new File([largeContent], 'large.kml', { type: 'application/vnd.google-earth.kml+xml' });
    
    const input = screen.getByRole('button', { name: /choose file/i }).parentElement?.querySelector('input[type="file"]');
    
    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });
      
      fireEvent.change(input);
      
      await waitFor(() => {
        expect(apiClient.uploadFile).not.toHaveBeenCalled();
      });
    }
  });

  it('uploads valid KML file successfully', async () => {
    const mockResponse = {
      success: true,
      data: {
        geometries: [
          {
            type: 'Polygon',
            coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
            properties: { name: 'Test Polygon' },
          },
        ],
        count: 1,
        originalFilename: 'test.kml',
        fileSize: 1024,
      },
    };
    
    (apiClient.uploadFile as any).mockResolvedValue(mockResponse);
    
    render(<AOIFileUpload onGeometriesLoaded={mockOnGeometriesLoaded} />);
    
    const file = new File(['<kml></kml>'], 'test.kml', { type: 'application/vnd.google-earth.kml+xml' });
    const input = screen.getByRole('button', { name: /choose file/i }).parentElement?.querySelector('input[type="file"]');
    
    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });
      
      fireEvent.change(input);
      
      await waitFor(() => {
        expect(apiClient.uploadFile).toHaveBeenCalledWith('/public/upload-aoi', file);
        expect(mockOnGeometriesLoaded).toHaveBeenCalledWith(mockResponse.data.geometries);
      });
      
      // Check that file info is displayed
      expect(screen.getByText('test.kml')).toBeInTheDocument();
      expect(screen.getByText(/Size: 1.0 KB/)).toBeInTheDocument();
      expect(screen.getByText(/Geometries: 1/)).toBeInTheDocument();
    }
  });

  it('uploads valid GeoJSON file successfully', async () => {
    const mockResponse = {
      success: true,
      data: {
        geometries: [
          {
            type: 'Polygon',
            coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
            properties: {},
          },
        ],
        count: 1,
        originalFilename: 'test.geojson',
        fileSize: 512,
      },
    };
    
    (apiClient.uploadFile as any).mockResolvedValue(mockResponse);
    
    render(<AOIFileUpload onGeometriesLoaded={mockOnGeometriesLoaded} />);
    
    const file = new File(['{"type":"FeatureCollection"}'], 'test.geojson', { type: 'application/geo+json' });
    const input = screen.getByRole('button', { name: /choose file/i }).parentElement?.querySelector('input[type="file"]');
    
    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });
      
      fireEvent.change(input);
      
      await waitFor(() => {
        expect(apiClient.uploadFile).toHaveBeenCalledWith('/public/upload-aoi', file);
        expect(mockOnGeometriesLoaded).toHaveBeenCalledWith(mockResponse.data.geometries);
      });
    }
  });

  it('handles upload error gracefully', async () => {
    const mockError = new Error('Upload failed');
    (apiClient.uploadFile as any).mockRejectedValue(mockError);
    
    render(<AOIFileUpload onGeometriesLoaded={mockOnGeometriesLoaded} />);
    
    const file = new File(['<kml></kml>'], 'test.kml', { type: 'application/vnd.google-earth.kml+xml' });
    const input = screen.getByRole('button', { name: /choose file/i }).parentElement?.querySelector('input[type="file"]');
    
    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });
      
      fireEvent.change(input);
      
      await waitFor(() => {
        expect(apiClient.uploadFile).toHaveBeenCalled();
        expect(mockOnGeometriesLoaded).not.toHaveBeenCalled();
      });
    }
  });

  it('clears uploaded file when clear button is clicked', async () => {
    const mockResponse = {
      success: true,
      data: {
        geometries: [{ type: 'Polygon', coordinates: [], properties: {} }],
        count: 1,
        originalFilename: 'test.kml',
        fileSize: 1024,
      },
    };
    
    (apiClient.uploadFile as any).mockResolvedValue(mockResponse);
    
    render(<AOIFileUpload onGeometriesLoaded={mockOnGeometriesLoaded} />);
    
    const file = new File(['<kml></kml>'], 'test.kml', { type: 'application/vnd.google-earth.kml+xml' });
    const input = screen.getByRole('button', { name: /choose file/i }).parentElement?.querySelector('input[type="file"]');
    
    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });
      
      fireEvent.change(input);
      
      await waitFor(() => {
        expect(screen.getByText('test.kml')).toBeInTheDocument();
      });
      
      // Click clear button
      const clearButton = screen.getByRole('button', { name: '' }); // X button has no text
      fireEvent.click(clearButton);
      
      // Upload area should be visible again
      expect(screen.getByText('Upload AOI File')).toBeInTheDocument();
    }
  });

  it('formats file size correctly', async () => {
    const testCases = [
      { size: 500, expected: '500 B' },
      { size: 1024, expected: '1.0 KB' },
      { size: 1024 * 1024, expected: '1.0 MB' },
      { size: 2.5 * 1024 * 1024, expected: '2.5 MB' },
    ];
    
    for (const testCase of testCases) {
      const mockResponse = {
        success: true,
        data: {
          geometries: [{ type: 'Polygon', coordinates: [], properties: {} }],
          count: 1,
          originalFilename: 'test.kml',
          fileSize: testCase.size,
        },
      };
      
      (apiClient.uploadFile as any).mockResolvedValue(mockResponse);
      
      const { unmount } = render(<AOIFileUpload onGeometriesLoaded={mockOnGeometriesLoaded} />);
      
      const file = new File(['<kml></kml>'], 'test.kml', { type: 'application/vnd.google-earth.kml+xml' });
      const input = screen.getByRole('button', { name: /choose file/i }).parentElement?.querySelector('input[type="file"]');
      
      if (input) {
        Object.defineProperty(input, 'files', {
          value: [file],
          writable: false,
        });
        
        fireEvent.change(input);
        
        await waitFor(() => {
          expect(screen.getByText(new RegExp(`Size: ${testCase.expected}`))).toBeInTheDocument();
        });
      }
      
      unmount();
    }
  });
});
