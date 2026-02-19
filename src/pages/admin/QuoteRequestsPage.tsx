import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  DialogFooter,
} from '@/components/ui/dialog';
import { FileText, Eye, Filter, Send } from 'lucide-react';
import { toast } from 'sonner';
import { BackButton } from '@/components/BackButton';

interface QuoteRequest {
  id: string;
  fullName: string;
  email: string;
  companyName: string;
  phoneNumber: string;
  industry: string;
  estimatedDataVolume: string;
  requirements: string;
  status: 'pending' | 'quoted' | 'accepted' | 'declined';
  quoteDetails?: {
    pricing?: string;
    terms?: string;
    validUntil?: string;
  };
  created_at: string;
  updated_at: string;
}

export default function QuoteRequestsPage() {
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quotePricing, setQuotePricing] = useState('');
  const [quoteTerms, setQuoteTerms] = useState('');
  const [quoteValidUntil, setQuoteValidUntil] = useState('');
  const [sendingQuote, setSendingQuote] = useState(false);

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
      const response = await fetch(`${API_BASE_URL}/admin/quote/requests`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quote requests');
      }

      const data = await response.json();
      setRequests(data.quoteRequests);
    } catch (error) {
      console.error('Error fetching quote requests:', error);
      toast.error('Failed to load quote requests');
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
      const response = await fetch(`${API_BASE_URL}/admin/quote/requests/${requestId}/status`, {
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

      toast.success('Quote request status updated successfully');
      fetchRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error('Failed to update request status');
    }
  };

  const submitQuote = async () => {
    if (!selectedRequest || !quotePricing.trim() || !quoteTerms.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSendingQuote(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      
      const response = await fetch(`${API_BASE_URL}/admin/quote/requests/${selectedRequest.id}/quote`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          pricing: quotePricing,
          terms: quoteTerms,
          validUntil: quoteValidUntil || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit quote');
      }

      toast.success('Quote submitted successfully');
      setQuotePricing('');
      setQuoteTerms('');
      setQuoteValidUntil('');
      setQuoteOpen(false);
      fetchRequests();
    } catch (error) {
      console.error('Error submitting quote:', error);
      toast.error('Failed to submit quote');
    } finally {
      setSendingQuote(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'outline',
      quoted: 'default',
      accepted: 'secondary',
      declined: 'destructive'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const viewDetails = (request: QuoteRequest) => {
    setSelectedRequest(request);
    setDetailsOpen(true);
  };

  const openQuoteDialog = (request: QuoteRequest) => {
    setSelectedRequest(request);
    if (request.quoteDetails) {
      setQuotePricing(request.quoteDetails.pricing || '');
      setQuoteTerms(request.quoteDetails.terms || '');
      setQuoteValidUntil(request.quoteDetails.validUntil || '');
    } else {
      setQuotePricing('');
      setQuoteTerms('');
      setQuoteValidUntil('');
    }
    setQuoteOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8 pt-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Quote Requests Management</h1>
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Loading quote requests...</div>
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
          <h1 className="text-3xl font-bold mb-2">Quote Requests Management</h1>
          <p className="text-gray-400">Manage and respond to customer quote requests</p>
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
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
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
            <CardTitle className="text-white">Quote Requests</CardTitle>
            <CardDescription className="text-gray-400">
              All quote requests from customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No quote requests found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-700/50">
                      <TableHead className="text-gray-300">Name</TableHead>
                      <TableHead className="text-gray-300">Company</TableHead>
                      <TableHead className="text-gray-300">Industry</TableHead>
                      <TableHead className="text-gray-300">Data Volume</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Created</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request.id} className="border-gray-700 hover:bg-gray-700/50">
                        <TableCell className="text-white font-medium">
                          {request.fullName}
                        </TableCell>
                        <TableCell className="text-gray-300">{request.companyName}</TableCell>
                        <TableCell className="text-gray-300">{request.industry}</TableCell>
                        <TableCell className="text-gray-300 text-xs">
                          {request.estimatedDataVolume}
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
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openQuoteDialog(request)}
                              className="text-gray-300 hover:text-white hover:bg-gray-700"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                            <Select
                              value={request.status}
                              onValueChange={(value) => updateRequestStatus(request.id, value)}
                            >
                              <SelectTrigger className="w-[110px] h-8 bg-gray-700 border-gray-600 text-white text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-700 border-gray-600">
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="quoted">Quoted</SelectItem>
                                <SelectItem value="accepted">Accepted</SelectItem>
                                <SelectItem value="declined">Declined</SelectItem>
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
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-3xl">
            <DialogHeader>
              <DialogTitle>Quote Request Details</DialogTitle>
              <DialogDescription className="text-gray-400">
                Complete information about this quote request
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Full Name</label>
                    <p className="text-white font-medium">{selectedRequest.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Email</label>
                    <p className="text-white font-medium">{selectedRequest.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Company</label>
                    <p className="text-white font-medium">{selectedRequest.companyName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Phone Number</label>
                    <p className="text-white font-medium">{selectedRequest.phoneNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Industry</label>
                    <p className="text-white font-medium">{selectedRequest.industry}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Estimated Data Volume</label>
                    <p className="text-white font-medium">{selectedRequest.estimatedDataVolume}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Created Date</label>
                    <p className="text-white font-medium">
                      {new Date(selectedRequest.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Requirements</label>
                  <p className="text-white mt-1 p-3 bg-gray-700 rounded-md whitespace-pre-wrap">
                    {selectedRequest.requirements}
                  </p>
                </div>
                {selectedRequest.quoteDetails && (
                  <div className="border-t border-gray-700 pt-4">
                    <h3 className="text-lg font-semibold mb-3">Quote Details</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-400">Pricing</label>
                        <p className="text-white mt-1">{selectedRequest.quoteDetails.pricing}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Terms</label>
                        <p className="text-white mt-1 whitespace-pre-wrap">
                          {selectedRequest.quoteDetails.terms}
                        </p>
                      </div>
                      {selectedRequest.quoteDetails.validUntil && (
                        <div>
                          <label className="text-sm text-gray-400">Valid Until</label>
                          <p className="text-white mt-1">
                            {new Date(selectedRequest.quoteDetails.validUntil).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button
                onClick={() => {
                  setDetailsOpen(false);
                  if (selectedRequest) openQuoteDialog(selectedRequest);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="mr-2 h-4 w-4" />
                {selectedRequest?.quoteDetails ? 'Update Quote' : 'Send Quote'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Quote Dialog */}
        <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedRequest?.quoteDetails ? 'Update Quote' : 'Send Quote'}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Provide pricing and terms for {selectedRequest?.fullName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="pricing" className="text-gray-300">
                  Pricing *
                </Label>
                <Input
                  id="pricing"
                  value={quotePricing}
                  onChange={(e) => setQuotePricing(e.target.value)}
                  placeholder="e.g., $5,000/month or $50,000 one-time"
                  className="bg-gray-700 border-gray-600 text-white mt-1"
                />
              </div>
              <div>
                <Label htmlFor="terms" className="text-gray-300">
                  Terms & Conditions *
                </Label>
                <Textarea
                  id="terms"
                  value={quoteTerms}
                  onChange={(e) => setQuoteTerms(e.target.value)}
                  placeholder="Include payment terms, delivery timeline, support details, etc."
                  className="min-h-[150px] bg-gray-700 border-gray-600 text-white mt-1"
                />
              </div>
              <div>
                <Label htmlFor="validUntil" className="text-gray-300">
                  Valid Until (Optional)
                </Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={quoteValidUntil}
                  onChange={(e) => setQuoteValidUntil(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setQuoteOpen(false)}
                className="border-gray-600 text-gray-200 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={submitQuote}
                disabled={sendingQuote || !quotePricing.trim() || !quoteTerms.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {sendingQuote ? 'Submitting...' : 'Submit Quote'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
