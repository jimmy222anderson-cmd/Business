import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Package, Eye, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { BackButton } from '@/components/BackButton';

// Product ID to name mapping
const PRODUCT_NAMES: Record<string, string> = {
  '1': 'Analytics',
  '2': 'Commercial Imagery',
  '3': 'Open Data',
  '4': 'Vantor',
  '5': 'Maxar Connect',
  '6': 'AIS Data',
  '7': 'ATAK Plugin',
  '8': 'ICEYE US',
  '9': 'Planet Select',
};

const getProductName = (productId: string): string => {
  return PRODUCT_NAMES[productId] || `Product ${productId}`;
};

interface ProductInquiry {
  _id: string;
  product_id: string;
  full_name: string;
  email: string;
  company?: string;
  message: string;
  status: 'pending' | 'quoted' | 'ordered' | 'completed';
  created_at: string;
  updated_at: string;
}

export default function ProductInquiriesPage() {
  const [inquiries, setInquiries] = useState<ProductInquiry[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<ProductInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<ProductInquiry | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchInquiries();
  }, []);

  useEffect(() => {
    filterInquiries();
  }, [inquiries, statusFilter]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_BASE_URL}/inquiries/product/admin`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product inquiries');
      }

      const data = await response.json();
      setInquiries(data.inquiries);
    } catch (error) {
      console.error('Error fetching product inquiries:', error);
      toast.error('Failed to load product inquiries');
    } finally {
      setLoading(false);
    }
  };

  const filterInquiries = () => {
    if (statusFilter === 'all') {
      setFilteredInquiries(inquiries);
    } else {
      setFilteredInquiries(inquiries.filter(i => i.status === statusFilter));
    }
  };

  const updateInquiryStatus = async (inquiryId: string, newStatus: string) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_BASE_URL}/inquiries/product/${inquiryId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update inquiry status');
      }

      toast.success('Product inquiry status updated successfully');
      fetchInquiries();
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      toast.error('Failed to update inquiry status');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'default',
      quoted: 'outline',
      ordered: 'secondary',
      completed: 'secondary'
    };
    const labels: Record<string, string> = {
      pending: 'Pending',
      quoted: 'Quoted',
      ordered: 'Ordered',
      completed: 'Completed'
    };
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  const viewDetails = (inquiry: ProductInquiry) => {
    setSelectedInquiry(inquiry);
    setDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8 pt-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Product Inquiries Management</h1>
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Loading product inquiries...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <BackButton to="/admin/dashboard" label="Back to Admin Dashboard" />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Product Inquiries Management</h1>
          <p className="text-gray-400">Manage product-specific customer inquiries</p>
        </div>

        {/* Filters */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="quoted">Quoted</SelectItem>
                    <SelectItem value="ordered">Ordered</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-gray-400">
                Showing {filteredInquiries.length} of {inquiries.length} inquiries
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inquiries Table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Product Inquiries</CardTitle>
            <CardDescription className="text-gray-400">
              All product inquiries from customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredInquiries.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No product inquiries found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-700/50">
                      <TableHead className="text-gray-300">Name</TableHead>
                      <TableHead className="text-gray-300">Email</TableHead>
                      <TableHead className="text-gray-300">Product</TableHead>
                      <TableHead className="text-gray-300">Company</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Created</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInquiries.map((inquiry) => (
                      <TableRow key={inquiry._id} className="border-gray-700 hover:bg-gray-700/50">
                        <TableCell className="text-white font-medium">
                          {inquiry.full_name}
                        </TableCell>
                        <TableCell className="text-gray-300">{inquiry.email}</TableCell>
                        <TableCell className="text-gray-300">
                          {getProductName(inquiry.product_id)}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {inquiry.company || 'N/A'}
                        </TableCell>
                        <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                        <TableCell className="text-gray-300">
                          {new Date(inquiry.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => viewDetails(inquiry)}
                              className="text-gray-300 hover:text-white hover:bg-gray-700"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Select
                              value={inquiry.status}
                              onValueChange={(value) => updateInquiryStatus(inquiry._id, value)}
                            >
                              <SelectTrigger className="w-[130px] h-8 bg-gray-700 border-gray-600 text-white text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-700 border-gray-600">
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="quoted">Quoted</SelectItem>
                                <SelectItem value="ordered">Ordered</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Product Inquiry Details</DialogTitle>
              <DialogDescription className="text-gray-400">
                Complete information about this product inquiry
              </DialogDescription>
            </DialogHeader>
            {selectedInquiry && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Full Name</label>
                    <p className="text-white font-medium">{selectedInquiry.full_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Email</label>
                    <p className="text-white font-medium">{selectedInquiry.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Company</label>
                    <p className="text-white font-medium">
                      {selectedInquiry.company || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Product</label>
                    <p className="text-white font-medium">
                      {getProductName(selectedInquiry.product_id)}
                    </p>
                    <p className="text-gray-400 text-xs font-mono mt-1">
                      ID: {selectedInquiry.product_id}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedInquiry.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Created Date</label>
                    <p className="text-white font-medium">
                      {new Date(selectedInquiry.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Message</label>
                  <p className="text-white mt-1 p-3 bg-gray-700 rounded-md whitespace-pre-wrap">
                    {selectedInquiry.message}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
