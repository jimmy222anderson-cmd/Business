import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/ImageUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';

interface SatelliteProductFormData {
  name: string;
  provider: string;
  sensor_type: 'optical' | 'radar' | 'thermal';
  resolution: number;
  resolution_category: 'vhr' | 'high' | 'medium' | 'low';
  bands: string[];
  coverage: string;
  availability: 'archive' | 'tasking' | 'both';
  description: string;
  sample_image_url: string;
  specifications: {
    swath_width?: number;
    revisit_time?: number;
    spectral_bands?: number;
    radiometric_resolution?: number;
  };
  pricing_info: string;
  status: 'active' | 'inactive';
  order: number;
}

interface SatelliteProductFormProps {
  initialData?: Partial<SatelliteProductFormData>;
  onSubmit: (data: SatelliteProductFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'update';
}

const AVAILABLE_BANDS = [
  'RGB',
  'NIR',
  'Red-Edge',
  'SWIR',
  'Thermal',
  'Panchromatic',
  'Multispectral',
  'Hyperspectral'
];

export default function SatelliteProductForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  mode
}: SatelliteProductFormProps) {
  const [formData, setFormData] = useState<SatelliteProductFormData>({
    name: initialData?.name || '',
    provider: initialData?.provider || '',
    sensor_type: initialData?.sensor_type || 'optical',
    resolution: initialData?.resolution || 0,
    resolution_category: initialData?.resolution_category || 'high',
    bands: initialData?.bands || [],
    coverage: initialData?.coverage || '',
    availability: initialData?.availability || 'both',
    description: initialData?.description || '',
    sample_image_url: initialData?.sample_image_url || '/placeholder.svg',
    specifications: {
      swath_width: initialData?.specifications?.swath_width,
      revisit_time: initialData?.specifications?.revisit_time,
      spectral_bands: initialData?.specifications?.spectral_bands,
      radiometric_resolution: initialData?.specifications?.radiometric_resolution
    },
    pricing_info: initialData?.pricing_info || 'Contact for pricing',
    status: initialData?.status || 'active',
    order: initialData?.order || 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.provider.trim()) {
      newErrors.provider = 'Provider is required';
    }

    if (formData.resolution <= 0) {
      newErrors.resolution = 'Resolution must be greater than 0';
    }

    if (formData.bands.length === 0) {
      newErrors.bands = 'At least one band must be selected';
    }

    if (!formData.coverage.trim()) {
      newErrors.coverage = 'Coverage is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

  const handleBandToggle = (band: string) => {
    setFormData(prev => ({
      ...prev,
      bands: prev.bands.includes(band)
        ? prev.bands.filter(b => b !== band)
        : [...prev.bands, band]
    }));
  };

  const updateSpecification = (field: keyof typeof formData.specifications, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [field]: numValue
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-gray-300">
              Product Name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Maxar WorldView-3"
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="provider" className="text-gray-300">
              Provider <span className="text-red-400">*</span>
            </Label>
            <Input
              id="provider"
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              placeholder="e.g., Maxar Technologies"
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
            />
            {errors.provider && <p className="text-red-400 text-sm mt-1">{errors.provider}</p>}
          </div>

          <div>
            <Label htmlFor="description" className="text-gray-300">
              Description <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the satellite product..."
              rows={4}
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
            />
            {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sensor_type" className="text-gray-300">
                Sensor Type <span className="text-red-400">*</span>
              </Label>
              <Select
                value={formData.sensor_type}
                onValueChange={(value: 'optical' | 'radar' | 'thermal') => 
                  setFormData({ ...formData, sensor_type: value })
                }
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="optical">Optical</SelectItem>
                  <SelectItem value="radar">Radar</SelectItem>
                  <SelectItem value="thermal">Thermal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="availability" className="text-gray-300">
                Availability <span className="text-red-400">*</span>
              </Label>
              <Select
                value={formData.availability}
                onValueChange={(value: 'archive' | 'tasking' | 'both') => 
                  setFormData({ ...formData, availability: value })
                }
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="archive">Archive</SelectItem>
                  <SelectItem value="tasking">Tasking</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="coverage" className="text-gray-300">
              Coverage <span className="text-red-400">*</span>
            </Label>
            <Input
              id="coverage"
              value={formData.coverage}
              onChange={(e) => setFormData({ ...formData, coverage: e.target.value })}
              placeholder="e.g., Global, Regional, North America"
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
            />
            {errors.coverage && <p className="text-red-400 text-sm mt-1">{errors.coverage}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Resolution */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Resolution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="resolution" className="text-gray-300">
                Resolution (meters) <span className="text-red-400">*</span>
              </Label>
              <Input
                id="resolution"
                type="number"
                step="0.01"
                min="0"
                value={formData.resolution || ''}
                onChange={(e) => setFormData({ ...formData, resolution: parseFloat(e.target.value) || 0 })}
                placeholder="e.g., 0.31"
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
              />
              {errors.resolution && <p className="text-red-400 text-sm mt-1">{errors.resolution}</p>}
            </div>

            <div>
              <Label htmlFor="resolution_category" className="text-gray-300">
                Resolution Category <span className="text-red-400">*</span>
              </Label>
              <Select
                value={formData.resolution_category}
                onValueChange={(value: 'vhr' | 'high' | 'medium' | 'low') => 
                  setFormData({ ...formData, resolution_category: value })
                }
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vhr">VHR (&lt;1m)</SelectItem>
                  <SelectItem value="high">High (1-5m)</SelectItem>
                  <SelectItem value="medium">Medium (5-30m)</SelectItem>
                  <SelectItem value="low">Low (&gt;30m)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bands */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">
            Spectral Bands <span className="text-red-400">*</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {AVAILABLE_BANDS.map((band) => (
              <div key={band} className="flex items-center space-x-2">
                <Checkbox
                  id={`band-${band}`}
                  checked={formData.bands.includes(band)}
                  onCheckedChange={() => handleBandToggle(band)}
                  className="border-gray-600"
                />
                <Label
                  htmlFor={`band-${band}`}
                  className="text-gray-300 cursor-pointer"
                >
                  {band}
                </Label>
              </div>
            ))}
          </div>
          {errors.bands && <p className="text-red-400 text-sm mt-2">{errors.bands}</p>}
        </CardContent>
      </Card>

      {/* Specifications */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Technical Specifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="swath_width" className="text-gray-300">
                Swath Width (km)
              </Label>
              <Input
                id="swath_width"
                type="number"
                step="0.1"
                min="0"
                value={formData.specifications.swath_width || ''}
                onChange={(e) => updateSpecification('swath_width', e.target.value)}
                placeholder="e.g., 13.1"
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
              />
            </div>

            <div>
              <Label htmlFor="revisit_time" className="text-gray-300">
                Revisit Time (days)
              </Label>
              <Input
                id="revisit_time"
                type="number"
                step="0.1"
                min="0"
                value={formData.specifications.revisit_time || ''}
                onChange={(e) => updateSpecification('revisit_time', e.target.value)}
                placeholder="e.g., 1"
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
              />
            </div>

            <div>
              <Label htmlFor="spectral_bands" className="text-gray-300">
                Number of Spectral Bands
              </Label>
              <Input
                id="spectral_bands"
                type="number"
                min="0"
                value={formData.specifications.spectral_bands || ''}
                onChange={(e) => updateSpecification('spectral_bands', e.target.value)}
                placeholder="e.g., 8"
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
              />
            </div>

            <div>
              <Label htmlFor="radiometric_resolution" className="text-gray-300">
                Radiometric Resolution (bits)
              </Label>
              <Input
                id="radiometric_resolution"
                type="number"
                min="0"
                value={formData.specifications.radiometric_resolution || ''}
                onChange={(e) => updateSpecification('radiometric_resolution', e.target.value)}
                placeholder="e.g., 11"
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing and Image */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Pricing & Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="pricing_info" className="text-gray-300">
              Pricing Information
            </Label>
            <Input
              id="pricing_info"
              value={formData.pricing_info}
              onChange={(e) => setFormData({ ...formData, pricing_info: e.target.value })}
              placeholder="e.g., Contact for pricing, From $15/km²"
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
            />
          </div>

          <ImageUpload
            value={formData.sample_image_url}
            onChange={(url) => setFormData({ ...formData, sample_image_url: url })}
            label="Sample Image"
            category="satelliteproduct"
            customName={formData.name.toLowerCase().replace(/\s+/g, '-')}
          />
        </CardContent>
      </Card>

      {/* Status and Order */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Status & Display</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status" className="text-gray-300">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'inactive') => 
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="order" className="text-gray-300">
                Display Order
              </Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Update Product'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
