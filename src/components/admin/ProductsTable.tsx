import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, Search, CheckSquare, Square } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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

interface ProductsTableProps {
  products: SatelliteProduct[];
  onDelete: (id: string) => void;
  onStatusToggle: (id: string, newStatus: string) => void;
  onRefresh: () => void;
}

export default function ProductsTable({ 
  products, 
  onDelete, 
  onStatusToggle,
  onRefresh 
}: ProductsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sensorTypeFilter, setSensorTypeFilter] = useState<string>('all');
  const [resolutionFilter, setResolutionFilter] = useState<string>('all');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);

  // Ensure products is always an array
  const productsArray = Array.isArray(products) ? products : [];

  // Filter products based on search and filters
  const filteredProducts = productsArray.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.provider.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    const matchesSensorType = sensorTypeFilter === 'all' || product.sensor_type === sensorTypeFilter;
    const matchesResolution = resolutionFilter === 'all' || product.resolution_category === resolutionFilter;

    return matchesSearch && matchesStatus && matchesSensorType && matchesResolution;
  });

  const handleStatusToggle = async (productId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${API_BASE_URL}/admin/satellite-products/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update product status');
      
      toast.success(`Product ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      onStatusToggle(productId, newStatus);
      onRefresh();
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error('Failed to update product status');
    }
  };

  const handleDelete = (id: string, name: string) => {
    setProductToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      onDelete(productToDelete.id);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const toggleAllProducts = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p._id)));
    }
  };

  const handleBulkActivate = async () => {
    if (selectedProducts.size === 0) {
      toast.error('No products selected');
      return;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('auth_token');
      
      const updatePromises = Array.from(selectedProducts).map(productId =>
        fetch(`${API_BASE_URL}/admin/satellite-products/${productId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'active' })
        })
      );

      await Promise.all(updatePromises);
      
      toast.success(`${selectedProducts.size} product(s) activated successfully`);
      setSelectedProducts(new Set());
      onRefresh();
    } catch (error) {
      console.error('Error activating products:', error);
      toast.error('Failed to activate products');
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedProducts.size === 0) {
      toast.error('No products selected');
      return;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('auth_token');
      
      const updatePromises = Array.from(selectedProducts).map(productId =>
        fetch(`${API_BASE_URL}/admin/satellite-products/${productId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'inactive' })
        })
      );

      await Promise.all(updatePromises);
      
      toast.success(`${selectedProducts.size} product(s) deactivated successfully`);
      setSelectedProducts(new Set());
      onRefresh();
    } catch (error) {
      console.error('Error deactivating products:', error);
      toast.error('Failed to deactivate products');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSensorTypeFilter('all');
    setResolutionFilter('all');
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || 
                          sensorTypeFilter !== 'all' || resolutionFilter !== 'all';

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedProducts.size > 0 && (
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-blue-300 font-medium">
              {selectedProducts.size} product(s) selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedProducts(new Set())}
              className="border-blue-600 text-blue-300 hover:bg-blue-800"
            >
              Clear Selection
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkActivate}
              className="border-green-600 text-green-300 hover:bg-green-800"
            >
              Activate Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDeactivate}
              className="border-yellow-600 text-yellow-300 hover:bg-yellow-800"
            >
              Deactivate Selected
            </Button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name or provider..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sensorTypeFilter} onValueChange={setSensorTypeFilter}>
            <SelectTrigger className="w-[140px] bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Sensor Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sensors</SelectItem>
              <SelectItem value="optical">Optical</SelectItem>
              <SelectItem value="radar">Radar</SelectItem>
              <SelectItem value="thermal">Thermal</SelectItem>
            </SelectContent>
          </Select>

          <Select value={resolutionFilter} onValueChange={setResolutionFilter}>
            <SelectTrigger className="w-[140px] bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Resolution" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Resolutions</SelectItem>
              <SelectItem value="vhr">VHR (&lt;1m)</SelectItem>
              <SelectItem value="high">High (1-5m)</SelectItem>
              <SelectItem value="medium">Medium (5-30m)</SelectItem>
              <SelectItem value="low">Low (&gt;30m)</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-400">
        Showing {filteredProducts.length} of {productsArray.length} products
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 w-12">
                <Checkbox
                  checked={filteredProducts.length > 0 && selectedProducts.size === filteredProducts.length}
                  onCheckedChange={toggleAllProducts}
                  className="border-gray-600"
                />
              </th>
              <th className="text-left py-3 px-4 text-gray-300 font-medium">Name</th>
              <th className="text-left py-3 px-4 text-gray-300 font-medium">Provider</th>
              <th className="text-left py-3 px-4 text-gray-300 font-medium">Resolution</th>
              <th className="text-left py-3 px-4 text-gray-300 font-medium">Sensor Type</th>
              <th className="text-center py-3 px-4 text-gray-300 font-medium">Status</th>
              <th className="text-right py-3 px-4 text-gray-300 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800/50">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400">
                  {hasActiveFilters 
                    ? 'No products match your filters. Try adjusting your search criteria.'
                    : 'No satellite products found. Click "Add Satellite Product" to create one.'}
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr 
                  key={product._id} 
                  className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <Checkbox
                      checked={selectedProducts.has(product._id)}
                      onCheckedChange={() => toggleProductSelection(product._id)}
                      className="border-gray-600"
                    />
                  </td>
                  <td className="py-3 px-4 text-white font-medium">{product.name}</td>
                  <td className="py-3 px-4 text-gray-400">{product.provider}</td>
                  <td className="py-3 px-4 text-gray-400">
                    <div className="flex flex-col">
                      <span>{product.resolution}m</span>
                      <span className="text-xs text-gray-500 uppercase">
                        {product.resolution_category}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-300 capitalize">
                      {product.sensor_type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <Switch
                        checked={product.status === 'active'}
                        onCheckedChange={() => handleStatusToggle(product._id, product.status)}
                        className="data-[state=checked]:bg-green-500"
                      />
                      <span className={`text-xs ${
                        product.status === 'active' 
                          ? 'text-green-400' 
                          : 'text-gray-500'
                      }`}>
                        {product.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/satellite-products/edit/${product._id}`}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                          title="Edit product"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => handleDelete(product._id, product.name)}
                        title="Delete product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
