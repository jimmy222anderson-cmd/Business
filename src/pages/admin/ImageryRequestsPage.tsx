import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Satellite, Filter, MapPin, X, Search, Calendar, Download } from 'lucide-react';
import { toast } from 'sonner';
import { BackButton } from '@/components/BackButton';
import { RequestsTable } from '@/components/admin/RequestsTable';
import { RequestDetailPanel } from '@/components/admin/RequestDetailPanel';

interface ImageryRequest {
  _id: string;
  user_id?: {
    email: string;
    full_name?: string;
    company?: string;
  };
  full_name: string;
  email: string;
  company?: string;
  phone?: string;
  aoi_type: string;
  aoi_coordinates: {
    type: string;
    coordinates: any;
  };
  aoi_area_km2: number;
  aoi_center: {
    lat: number;
    lng: number;
  };
  date_range: {
    start_date: string;
    end_date: string;
  };
  filters?: {
    resolution_category?: string[];
    max_cloud_coverage?: number;
    providers?: string[];
    bands?: string[];
    image_types?: string[];
  };
  urgency: string;
  additional_requirements?: string;
  status: 'pending' | 'reviewing' | 'quoted' | 'approved' | 'completed' | 'cancelled';
  admin_notes?: string;
  quote_amount?: number;
  quote_currency?: string;
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
  reviewed_by?: {
    full_name?: string;
    email: string;
  };
}

export default function ImageryRequestsPage() {
  const [requests, setRequests] = useState<ImageryRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ImageryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<ImageryRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, statusFilter, urgencyFilter, searchQuery, dateFrom, dateTo]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_BASE_URL}/admin/imagery-requests?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch imagery requests');
      }

      const data = await response.json();
      setRequests(data.requests || []);
      
      // Calculate total pages from response
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages || 1);
      } else if (data.total) {
        setTotalPages(Math.ceil(data.total / limit));
      }
    } catch (error) {
      console.error('Error fetching imagery requests:', error);
      toast.error('Failed to load imagery requests');
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    // Urgency filter
    if (urgencyFilter !== 'all') {
      filtered = filtered.filter(r => r.urgency === urgencyFilter);
    }

    // Date range filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter(r => new Date(r.created_at) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999); // Include the entire day
      filtered = filtered.filter(r => new Date(r.created_at) <= toDate);
    }

    // Search filter (request ID, user name, or email)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(r => {
        const requestId = r._id.toLowerCase();
        const userName = (r.user_id?.full_name || r.full_name || '').toLowerCase();
        const userEmail = (r.user_id?.email || r.email || '').toLowerCase();
        
        return requestId.includes(query) || 
               userName.includes(query) || 
               userEmail.includes(query);
      });
    }

    setFilteredRequests(filtered);
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setUrgencyFilter('all');
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (urgencyFilter !== 'all') count++;
    if (searchQuery.trim()) count++;
    if (dateFrom) count++;
    if (dateTo) count++;
    return count;
  };

  const updateRequestStatus = async (requestId: string, updates: Partial<ImageryRequest>) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_BASE_URL}/admin/imagery-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update request');
      }

      toast.success('Imagery request updated successfully');
      setDetailsOpen(false);
      fetchRequests();
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'outline',
      reviewing: 'default',
      quoted: 'default',
      approved: 'secondary',
      completed: 'secondary',
      cancelled: 'destructive'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const viewDetails = (request: ImageryRequest) => {
    setSelectedRequest(request);
    setDetailsOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  useEffect(() => {
    fetchRequests();
  }, [page]);

  const getUserName = (request: ImageryRequest) => {
    if (request.user_id?.full_name) {
      return request.user_id.full_name;
    }
    return request.full_name || request.email || 'Unknown';
  };

  const getUserEmail = (request: ImageryRequest) => {
    return request.user_id?.email || request.email || 'N/A';
  };

  const handleExport = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      
      // Build query parameters from current filters
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (urgencyFilter !== 'all') params.append('urgency', urgencyFilter);
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      if (searchQuery.trim()) params.append('email', searchQuery.trim());

      const queryString = params.toString();
      const url = `${API_BASE_URL}/admin/imagery-requests/export${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export imagery requests');
      }

      // Get the CSV content
      const blob = await response.blob();
      
      // Create a download link and trigger it
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `imagery-requests-${new Date().toISOString().split('T')[0]}.csv`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('Imagery requests exported successfully');
    } catch (error) {
      console.error('Error exporting imagery requests:', error);
      toast.error('Failed to export imagery requests');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8 pt-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Imagery Requests Management</h1>
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Loading imagery requests...</div>
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Imagery Requests Management</h1>
            <p className="text-gray-400">Manage satellite imagery requests from users</p>
          </div>
          <Button
            onClick={handleExport}
            className="bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Filter Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Filters</span>
                  {getActiveFilterCount() > 0 && (
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">
                      {getActiveFilterCount()} active
                    </Badge>
                  )}
                </div>
                {getActiveFilterCount() > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by request ID, user name, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                />
              </div>

              {/* Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewing">Reviewing</SelectItem>
                      <SelectItem value="quoted">Quoted</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Urgency Filter */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Urgency</label>
                  <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="All Urgencies" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="all">All Urgencies</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date From */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Date From
                  </label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                {/* Date To */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Date To
                  </label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              {/* Results Count */}
              <div className="text-sm text-gray-400 pt-2 border-t border-gray-700">
                Showing {filteredRequests.length} of {requests.length} requests
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests Table */}
        <RequestsTable
          requests={filteredRequests}
          isLoading={loading}
          onViewDetails={viewDetails}
          page={page}
          limit={limit}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />

        {/* Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Imagery Request Details</DialogTitle>
              <DialogDescription className="text-gray-400">
                Complete information about this imagery request
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <RequestDetailPanel
                request={selectedRequest}
                onUpdate={(updates) => updateRequestStatus(selectedRequest._id, updates)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
