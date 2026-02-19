import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import ProductsTable from '@/components/admin/ProductsTable';
import { BackButton } from '@/components/BackButton';

interface SatelliteProduct {
  _id: string;
  name: string;
  provider: string;
  sensor_type: string;
  resolution: number;
  resolution_category: string;
  availability: string;
  status: string;
}

export default function AdminSatelliteProductsPage() {
  const [products, setProducts] = useState<SatelliteProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${API_BASE_URL}/admin/satellite-products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch satellite products');
      
      const data = await response.json();
      
      // Handle different response formats
      if (Array.isArray(data)) {
        setProducts(data);
      } else if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        console.error('Unexpected API response format:', data);
        setProducts([]);
        toast.error('Unexpected data format received');
      }
    } catch (error) {
      console.error('Error fetching satellite products:', error);
      toast.error('Failed to load satellite products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${API_BASE_URL}/admin/satellite-products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete satellite product');
      
      toast.success('Satellite product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting satellite product:', error);
      toast.error('Failed to delete satellite product');
    }
  };

  const handleStatusToggle = (id: string, newStatus: string) => {
    // Status is already updated by the ProductsTable component
    // This callback is just to trigger a refresh if needed
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8 pt-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Satellite Products Management</h1>
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Loading satellite products...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <BackButton to="/admin/dashboard" label="Back to Admin Dashboard" />
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Satellite Products Management</h1>
            <p className="text-gray-400">Manage satellite imagery products catalog</p>
          </div>
          <Link to="/admin/satellite-products/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Satellite Product
            </Button>
          </Link>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">All Satellite Products ({products.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductsTable 
              products={products}
              onDelete={handleDelete}
              onStatusToggle={handleStatusToggle}
              onRefresh={fetchProducts}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
