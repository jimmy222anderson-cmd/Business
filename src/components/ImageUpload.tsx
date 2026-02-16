import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  category?: 'products' | 'industries' | 'partners' | 'blog' | 'general';
  customName?: string;
}

export function ImageUpload({ 
  value, 
  onChange, 
  label = 'Upload Image',
  category = 'general',
  customName
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      if (customName) {
        formData.append('name', customName);
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      const imageUrl = data.url || data.fileUrl;
      
      // Construct full URL for preview
      const fullUrl = imageUrl.startsWith('http') 
        ? imageUrl 
        : `${API_BASE_URL.replace('/api', '')}${imageUrl}`;
      
      setPreview(fullUrl);
      onChange(imageUrl); // Store relative path in database
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
  };

  // Construct preview URL
  const previewUrl = preview 
    ? (preview.startsWith('http') || preview.startsWith('/uploads') 
        ? preview 
        : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000'}${preview}`)
    : '';

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-200">{label}</label>
      
      {previewUrl ? (
        <div className="relative inline-block">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-600"
            onError={(e) => {
              console.error('Image load error:', previewUrl);
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id={`image-upload-${category}`}
            disabled={uploading}
          />
          <label 
            htmlFor={`image-upload-${category}`}
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="h-12 w-12 text-gray-400 mb-2" />
            <span className="text-sm text-gray-400">
              {uploading ? 'Uploading...' : 'Click to upload image'}
            </span>
            <span className="text-xs text-gray-500 mt-1">
              PNG, JPG, GIF up to 5MB
            </span>
            {category !== 'general' && (
              <span className="text-xs text-blue-400 mt-1">
                Will be saved to: {category} folder
              </span>
            )}
          </label>
        </div>
      )}
    </div>
  );
}
