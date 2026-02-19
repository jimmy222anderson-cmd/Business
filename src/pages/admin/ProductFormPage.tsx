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
import { Plus, Trash2 } from 'lucide-react';
import { BackButton } from '@/components/BackButton';

interface Feature {
  title: string;
  description: string;
  icon: string;
}

interface UseCase {
  title: string;
  description: string;
  industry: string;
}

interface Specification {
  key: string;
  value: string;
  unit: string;
}

interface SubProduct {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  image?: string;
  features?: Feature[];
  specifications?: Specification[];
  order: number;
}

interface ProductForm {
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  image: string;
  pricingBadge: string;
  category: string;
  status: string;
  order: number;
  features: Feature[];
  useCases: UseCase[];
  specifications: Specification[];
  subProducts: SubProduct[];
}

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    slug: '',
    description: '',
    longDescription: '',
    image: '/placeholder.svg',
    pricingBadge: '',
    category: 'data',
    status: 'active',
    order: 0,
    features: [],
    useCases: [],
    specifications: [],
    subProducts: []
  });

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch product');
      
      const data = await response.json();
      setFormData(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
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
      
      const url = id 
        ? `${API_BASE_URL}/admin/products/${id}`
        : `${API_BASE_URL}/admin/products`;
      
      const response = await fetch(url, {
        method: id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save product');
      
      toast.success(`Product ${id ? 'updated' : 'created'} successfully`);
      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, { title: '', description: '', icon: '' }]
    });
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  const updateFeature = (index: number, field: keyof Feature, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setFormData({ ...formData, features: newFeatures });
  };

  const addUseCase = () => {
    setFormData({
      ...formData,
      useCases: [...formData.useCases, { title: '', description: '', industry: '' }]
    });
  };

  const removeUseCase = (index: number) => {
    setFormData({
      ...formData,
      useCases: formData.useCases.filter((_, i) => i !== index)
    });
  };

  const updateUseCase = (index: number, field: keyof UseCase, value: string) => {
    const newUseCases = [...formData.useCases];
    newUseCases[index] = { ...newUseCases[index], [field]: value };
    setFormData({ ...formData, useCases: newUseCases });
  };

  const addSpecification = () => {
    setFormData({
      ...formData,
      specifications: [...formData.specifications, { key: '', value: '', unit: '' }]
    });
  };

  const removeSpecification = (index: number) => {
    setFormData({
      ...formData,
      specifications: formData.specifications.filter((_, i) => i !== index)
    });
  };

  const updateSpecification = (index: number, field: keyof Specification, value: string) => {
    const newSpecs = [...formData.specifications];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    setFormData({ ...formData, specifications: newSpecs });
  };

  const addSubProduct = () => {
    setFormData({
      ...formData,
      subProducts: [...formData.subProducts, { 
        name: '', 
        slug: '', 
        description: '', 
        longDescription: '',
        image: '/placeholder.svg',
        features: [],
        specifications: [],
        order: formData.subProducts.length + 1 
      }]
    });
  };

  const removeSubProduct = (index: number) => {
    setFormData({
      ...formData,
      subProducts: formData.subProducts.filter((_, i) => i !== index)
    });
  };

  const updateSubProduct = (index: number, field: keyof SubProduct, value: string | number) => {
    const newSubProducts = [...formData.subProducts];
    newSubProducts[index] = { ...newSubProducts[index], [field]: value };
    setFormData({ ...formData, subProducts: newSubProducts });
  };

  const generateSubProductSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <BackButton to="/admin/dashboard" label="Back to Admin Dashboard" />

        <h1 className="text-3xl font-bold mb-8">
          {id ? 'Edit Product' : 'Add New Product'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      name: e.target.value,
                      slug: generateSlug(e.target.value)
                    });
                  }}
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

              <div>
                <Label htmlFor="pricingBadge">Pricing Badge</Label>
                <Input
                  id="pricingBadge"
                  value={formData.pricingBadge}
                  onChange={(e) => setFormData({ ...formData, pricingBadge: e.target.value })}
                  placeholder="e.g., From $99/mo"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="analytics">Analytics</SelectItem>
                      <SelectItem value="imagery">Imagery</SelectItem>
                      <SelectItem value="data">Data</SelectItem>
                      <SelectItem value="plugin">Plugin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                label="Product Image"
                category="products"
                customName={formData.slug || formData.name}
              />
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">Features</CardTitle>
                <Button type="button" onClick={addFeature} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feature
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.features.map((feature, index) => (
                <div key={index} className="p-4 bg-gray-700 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Feature {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFeature(index)}
                      className="text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Title"
                    value={feature.title}
                    onChange={(e) => updateFeature(index, 'title', e.target.value)}
                    className="bg-gray-600 border-gray-500 text-white"
                  />
                  <Textarea
                    placeholder="Description"
                    value={feature.description}
                    onChange={(e) => updateFeature(index, 'description', e.target.value)}
                    className="bg-gray-600 border-gray-500 text-white"
                  />
                  <Input
                    placeholder="Icon name (e.g., brain, activity)"
                    value={feature.icon}
                    onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                    className="bg-gray-600 border-gray-500 text-white"
                  />
                </div>
              ))}
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
                  <Input
                    placeholder="Industry"
                    value={useCase.industry}
                    onChange={(e) => updateUseCase(index, 'industry', e.target.value)}
                    className="bg-gray-600 border-gray-500 text-white"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">Specifications</CardTitle>
                <Button type="button" onClick={addSpecification} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Specification
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.specifications.map((spec, index) => (
                <div key={index} className="p-4 bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-400">Specification {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSpecification(index)}
                      className="text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      placeholder="Key"
                      value={spec.key}
                      onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                      className="bg-gray-600 border-gray-500 text-white"
                    />
                    <Input
                      placeholder="Value"
                      value={spec.value}
                      onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                      className="bg-gray-600 border-gray-500 text-white"
                    />
                    <Input
                      placeholder="Unit (optional)"
                      value={spec.unit}
                      onChange={(e) => updateSpecification(index, 'unit', e.target.value)}
                      className="bg-gray-600 border-gray-500 text-white"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-white">Sub-Products</CardTitle>
                  <p className="text-sm text-gray-400 mt-1">
                    Add sub-products for hierarchical navigation (e.g., VHR, SAR, DOM under Commercial Imagery)
                  </p>
                </div>
                <Button type="button" onClick={addSubProduct} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sub-Product
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.subProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No sub-products added. Click "Add Sub-Product" to create nested products.
                </div>
              ) : (
                formData.subProducts.map((subProduct, index) => (
                  <Card key={index} className="bg-gray-700 border-gray-600">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-white">Sub-Product {index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSubProduct(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-gray-300 text-sm">Name *</Label>
                          <Input
                            placeholder="e.g., VHR, SAR, DOM"
                            value={subProduct.name}
                            onChange={(e) => {
                              updateSubProduct(index, 'name', e.target.value);
                              updateSubProduct(index, 'slug', generateSubProductSlug(e.target.value));
                            }}
                            className="bg-gray-600 border-gray-500 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300 text-sm">Slug *</Label>
                          <Input
                            placeholder="e.g., vhr, sar, dom"
                            value={subProduct.slug}
                            onChange={(e) => updateSubProduct(index, 'slug', e.target.value)}
                            className="bg-gray-600 border-gray-500 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-gray-300 text-sm">Short Description</Label>
                        <Textarea
                          placeholder="Brief description for cards and listings"
                          value={subProduct.description}
                          onChange={(e) => updateSubProduct(index, 'description', e.target.value)}
                          rows={2}
                          className="bg-gray-600 border-gray-500 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300 text-sm">Long Description</Label>
                        <Textarea
                          placeholder="Detailed description for the sub-product page"
                          value={subProduct.longDescription || ''}
                          onChange={(e) => updateSubProduct(index, 'longDescription', e.target.value)}
                          rows={4}
                          className="bg-gray-600 border-gray-500 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300 text-sm">Display Order</Label>
                        <Input
                          type="number"
                          value={subProduct.order}
                          onChange={(e) => updateSubProduct(index, 'order', parseInt(e.target.value) || 0)}
                          className="bg-gray-600 border-gray-500 text-white"
                        />
                      </div>
                      <ImageUpload
                        value={subProduct.image || '/placeholder.svg'}
                        onChange={(url) => updateSubProduct(index, 'image', url)}
                        label="Sub-Product Image"
                        category="products"
                        customName={`${formData.slug}-${subProduct.slug}`}
                      />
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Saving...' : id ? 'Update Product' : 'Create Product'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/products')}
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
