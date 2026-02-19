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
import { Satellite, Eye, Filter, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { BackButton } from '@/components/BackButton';

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
  const [selectedRequest, setSelectedRequest] = useState<ImageryRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_BASE_URL}/admin/imagery-requests`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch imagery requests');
      }

      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching imagery requests:', error);
      toast.error('Failed to load imagery requests');
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    if (statusFilter === 'all') {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter(r => r.status === statusFilter));
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_BASE_URL}/admin/imagery-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update request status');
      }

      toast.success('Imagery request status updated successfully');
      fetchRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error('Failed to update request status');
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

  const getUserName = (request: ImageryRequest) => {
    if (request.user_id?.full_name) {
      return request.user_id.full_name;
    }
    return request.full_name || request.email || 'Unknown';
  };

  const getUserEmail = (request: ImageryRequest) => {
    return request.user_id?.email || request.email || 'N/A';
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Imagery Requests Management</h1>
          <p className="text-gray-400">Manage satellite imagery requests from users</p>
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
                    <SelectItem value="reviewing">Reviewing</SelectItem>
                    <SelectItem value="quoted">Quoted</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-gray-400">
                Showing {filteredRequests.length} of {requests.length} requests
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Imagery Requests</CardTitle>
            <CardDescription className="text-gray-400">
              All satellite imagery requests from users
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Satellite className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No imagery requests found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-700/50">
                      <TableHead className="text-gray-300">User</TableHead>
                      <TableHead className="text-gray-300">Email</TableHead>
                      <TableHead className="text-gray-300">AOI Type</TableHead>
                      <TableHead className="text-gray-300">Area (km²)</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Created</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request._id} className="border-gray-700 hover:bg-gray-700/50">
                        <TableCell className="text-white font-medium">
                          {getUserName(request)}
                        </TableCell>
                        <TableCell className="text-gray-300">{getUserEmail(request)}</TableCell>
                        <TableCell className="text-gray-300 capitalize">{request.aoi_type}</TableCell>
                        <TableCell className="text-gray-300">
                          {request.aoi_area_km2.toFixed(2)}
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-gray-300">
                          {new Date(request.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => viewDetails(request)}
                              className="text-gray-300 hover:text-white hover:bg-gray-700"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Select
                              value={request.status}
                              onValueChange={(value) => updateRequestStatus(request._id, value)}
                            >
                              <SelectTrigger className="w-[120px] h-8 bg-gray-700 border-gray-600 text-white text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-700 border-gray-600">
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="reviewing">Reviewing</SelectItem>
                                <SelectItem value="quoted">Quoted</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
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
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Imagery Request Details</DialogTitle>
              <DialogDescription className="text-gray-400">
                Complete information about this imagery request
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-6">
                {/* User Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Satellite className="h-5 w-5" />
                    User Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">Name</label>
                      <p className="text-white font-medium">{getUserName(selectedRequest)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Email</label>
                      <p className="text-white font-medium">{getUserEmail(selectedRequest)}</p>
                    </div>
                    {selectedRequest.company && (
                      <div>
                        <label className="text-sm text-gray-400">Company</label>
                        <p className="text-white font-medium">{selectedRequest.company}</p>
                      </div>
                    )}
                    {selectedRequest.phone && (
                      <div>
                        <label className="text-sm text-gray-400">Phone</label>
                        <p className="text-white font-medium">{selectedRequest.phone}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm text-gray-400">Status</label>
                      <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Urgency</label>
                      <p className="text-white font-medium capitalize">{selectedRequest.urgency}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Created Date</label>
                      <p className="text-white font-medium">
                        {new Date(selectedRequest.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AOI Information */}
                <div className="border-t border-gray-700 pt-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Area of Interest (AOI)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">Type</label>
                      <p className="text-white font-medium capitalize">{selectedRequest.aoi_type}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Area</label>
                      <p className="text-white font-medium">{selectedRequest.aoi_area_km2.toFixed(2)} km²</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Center Latitude</label>
                      <p className="text-white font-medium font-mono">{selectedRequest.aoi_center.lat.toFixed(6)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Center Longitude</label>
                      <p className="text-white font-medium font-mono">{selectedRequest.aoi_center.lng.toFixed(6)}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="text-sm text-gray-400">Coordinates</label>
                    <pre className="text-white mt-1 p-3 bg-gray-700 rounded-md text-xs overflow-x-auto">
                      {JSON.stringify(selectedRequest.aoi_coordinates.coordinates, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Date Range */}
                <div className="border-t border-gray-700 pt-4">
                  <h3 className="text-lg font-semibold mb-3">Date Range</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">Start Date</label>
                      <p className="text-white font-medium">
                        {new Date(selectedRequest.date_range.start_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">End Date</label>
                      <p className="text-white font-medium">
                        {new Date(selectedRequest.date_range.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Filters */}
                {selectedRequest.filters && (
                  <div className="border-t border-gray-700 pt-4">
                    <h3 className="text-lg font-semibold mb-3">Filters Applied</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedRequest.filters.max_cloud_coverage !== undefined && (
                        <div>
                          <label className="text-sm text-gray-400">Max Cloud Coverage</label>
                          <p className="text-white font-medium">{selectedRequest.filters.max_cloud_coverage}%</p>
                        </div>
                      )}
                    </div>
                    {selectedRequest.filters.resolution_category && selectedRequest.filters.resolution_category.length > 0 && (
                      <div className="mt-3">
                        <label className="text-sm text-gray-400">Resolutions</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedRequest.filters.resolution_category.map((res) => (
                            <Badge key={res} variant="outline" className="text-white">
                              {res.toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedRequest.filters.providers && selectedRequest.filters.providers.length > 0 && (
                      <div className="mt-3">
                        <label className="text-sm text-gray-400">Providers</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedRequest.filters.providers.map((provider) => (
                            <Badge key={provider} variant="outline" className="text-white">
                              {provider}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedRequest.filters.bands && selectedRequest.filters.bands.length > 0 && (
                      <div className="mt-3">
                        <label className="text-sm text-gray-400">Bands</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedRequest.filters.bands.map((band) => (
                            <Badge key={band} variant="outline" className="text-white">
                              {band}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedRequest.filters.image_types && selectedRequest.filters.image_types.length > 0 && (
                      <div className="mt-3">
                        <label className="text-sm text-gray-400">Image Types</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedRequest.filters.image_types.map((type) => (
                            <Badge key={type} variant="outline" className="text-white capitalize">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Additional Requirements */}
                {selectedRequest.additional_requirements && (
                  <div className="border-t border-gray-700 pt-4">
                    <h3 className="text-lg font-semibold mb-3">Additional Requirements</h3>
                    <p className="text-white p-3 bg-gray-700 rounded-md whitespace-pre-wrap">
                      {selectedRequest.additional_requirements}
                    </p>
                  </div>
                )}

                {/* Admin Notes */}
                {selectedRequest.admin_notes && (
                  <div className="border-t border-gray-700 pt-4">
                    <h3 className="text-lg font-semibold mb-3">Admin Notes</h3>
                    <p className="text-white p-3 bg-gray-700 rounded-md whitespace-pre-wrap">
                      {selectedRequest.admin_notes}
                    </p>
                  </div>
                )}

                {/* Quote Information */}
                {selectedRequest.quote_amount && (
                  <div className="border-t border-gray-700 pt-4">
                    <h3 className="text-lg font-semibold mb-3">Quote Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400">Quote Amount</label>
                        <p className="text-white font-medium">
                          {selectedRequest.quote_currency} {selectedRequest.quote_amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
