import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/ImageUpload';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

export default function IndustryFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    longDescription: '',
    image: '/placeholder.svg',
    status: 'active',
    order: 0,
    useCases: [] as Array<{ title: string; description: string }>,
    relevantProducts: [] as string[]
  });

  useEffect(() => {
    fetchProducts();
    if (id) fetchIndustry();
  }, [id]);

  const fetchProducts = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/admin/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) setProducts(await response.json());
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchIndustry = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/admin/industries/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch industry');
      const data = await response.json();
      setFormData({
        ...data,
        relevantProducts: data.relevantProducts?.map((p: any) => p._id || p) || []
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load industry');
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('auth_token');
      const url = id ? `${API_BASE_URL}/admin/industries/${id}` : `${API_BASE_URL}/admin/industries`;
      
      const response = await fetch(url, {
        method: id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save industry');
      toast.success(`Industry ${id ? 'updated' : 'created'} successfully`);
      navigate('/admin/industries');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save industry');
    } finally {
      setLoading(false);
    }
  };

  const addUseCase = () => {
    setFormData({
      ...formData,
      useCases: [...formData.useCases, { title: '', description: '' }]
    });
  };

  const removeUseCase = (index: number) => {
    setFormData({
      ...formData,
      useCases: formData.useCases.filter((_, i) => i !== index)
    });
  };

  const updateUseCase = (index: number, field: 'title' | 'description', value: string) => {
    const newUseCases = [...formData.useCases];
    newUseCases[index] = { ...newUseCases[index], [field]: value };
    setFormData({ ...formData, useCases: newUseCases });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4 text-gray-400 hover:text-white"
          onClick={() => navigate('/admin/industries')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Industries
        </Button>

        <h1 className="text-3xl font-bold mb-8">
          {id ? 'Edit Industry' : 'Add New Industry'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Industry Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    name: e.target.value,
                    slug: generateSlug(e.target.value)
                  })}
                  required
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="description">Short Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="longDescription">Long Description *</Label>
                <Textarea
                  id="longDescription"
                  value={formData.longDescription}
                  onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                  required
                  rows={6}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
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
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <ImageUpload
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
                label="Industry Image"
                category="industries"
                customName={formData.slug || formData.name}
              />
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">Use Cases</CardTitle>
                <Button type="button" onClick={addUseCase} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Use Case
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.useCases.map((useCase, index) => (
                <div key={index} className="p-4 bg-gray-700 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Use Case {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeUseCase(index)}
                      className="text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Title"
                    value={useCase.title}
                    onChange={(e) => updateUseCase(index, 'title', e.target.value)}
                    className="bg-gray-600 border-gray-500 text-white"
                  />
                  <Textarea
                    placeholder="Description"
                    value={useCase.description}
                    onChange={(e) => updateUseCase(index, 'description', e.target.value)}
                    className="bg-gray-600 border-gray-500 text-white"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Relevant Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {products.map((product) => (
                  <label key={product._id} className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.relevantProducts.includes(product._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            relevantProducts: [...formData.relevantProducts, product._id]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            relevantProducts: formData.relevantProducts.filter(id => id !== product._id)
                          });
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-white">{product.name}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Saving...' : id ? 'Update Industry' : 'Create Industry'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/industries')}
              className="border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
