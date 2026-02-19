import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import SatelliteProductForm from '@/components/admin/SatelliteProductForm';
import { BackButton } from '@/components/BackButton';

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

export default function SatelliteProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<Partial<SatelliteProductFormData> | undefined>();
  const [fetchingData, setFetchingData] = useState(!!id);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${API_BASE_URL}/admin/satellite-products/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch satellite product');
      
      const data = await response.json();
      setInitialData(data);
    } catch (error) {
      console.error('Error fetching satellite product:', error);
      toast.error('Failed to load satellite product');
      navigate('/admin/satellite-products');
    } finally {
      setFetchingData(false);
    }
  };

  const handleSubmit = async (data: SatelliteProductFormData) => {
    setLoading(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('auth_token');
      
      const url = id 
        ? `${API_BASE_URL}/admin/satellite-products/${id}`
        : `${API_BASE_URL}/admin/satellite-products`;
      
      const response = await fetch(url, {
        method: id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save satellite product');
      }
      
      toast.success(`Satellite product ${id ? 'updated' : 'created'} successfully`);
      navigate('/admin/satellite-products');
    } catch (error) {
      console.error('Error saving satellite product:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save satellite product');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/satellite-products');
  };

  if (fetchingData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Loading...</h1>
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Loading satellite product data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <BackButton to="/admin/satellite-products" label="Back to Satellite Products" />

        <h1 className="text-3xl font-bold mb-8">
          {id ? 'Edit Satellite Product' : 'Add New Satellite Product'}
        </h1>

        <SatelliteProductForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={loading}
          mode={id ? 'update' : 'create'}
        />
      </div>
    </div>
  );
}
