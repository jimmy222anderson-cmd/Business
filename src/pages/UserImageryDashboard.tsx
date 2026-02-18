import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RequestHistoryTable } from '@/components/RequestHistoryTable';
import { RequestDetailModal } from '@/components/RequestDetailModal';
import { SavedAOIsList } from '@/components/SavedAOIsList';
import { useAuth } from '@/contexts/AuthContext';
import { getUserImageryRequests, ImageryRequest } from '@/lib/api/imageryRequests';
import { useToast } from '@/hooks/use-toast';
import { MapPin, FileText, ArrowLeft, Loader2 } from 'lucide-react';

export default function UserImageryDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState<ImageryRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<ImageryRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to view your dashboard',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate, toast]);

  // Fetch imagery requests
  const fetchRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await getUserImageryRequests(params);
      setRequests(response.requests);
      setPagination(response.pagination);
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load imagery requests',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRequests();
    }
  }, [isAuthenticated, statusFilter, pagination.page]);

  const handleViewDetails = (request: ImageryRequest) => {
    setSelectedRequest(request);
    setIsDetailModalOpen(true);
  };

  const handleLoadAOI = (aoi: any) => {
    // Navigate to explorer with AOI data
    navigate('/explore', { state: { loadedAOI: aoi } });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>My Dashboard | Earth Intelligence Platform</title>
        <meta name="description" content="View your imagery requests and saved areas of interest" />
      </Helmet>

      <div className="min-h-screen bg-slate-950">
        {/* Header */}
        <div className="border-b border-slate-800 bg-slate-900">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/')}
                  className="mb-2 text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
                <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
                <p className="text-slate-400 mt-1">
                  Manage your imagery requests and saved areas
                </p>
              </div>
              <Button
                onClick={() => navigate('/explore')}
                className="bg-yellow-500 hover:bg-yellow-600 text-slate-900"
              >
                <MapPin className="mr-2 h-4 w-4" />
                New Request
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="requests" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Imagery Requests
              </TabsTrigger>
              <TabsTrigger value="aois" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Saved AOIs
              </TabsTrigger>
            </TabsList>

            {/* Imagery Requests Tab */}
            <TabsContent value="requests" className="space-y-4">
              {/* Filters */}
              <Card className="p-4 bg-slate-900 border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block text-slate-300">Filter by Status</label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
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
                  </div>
                  <div className="text-sm text-slate-400">
                    {pagination.total} {pagination.total === 1 ? 'request' : 'requests'} found
                  </div>
                </div>
              </Card>

              {/* Requests Table */}
              <RequestHistoryTable
                requests={requests}
                isLoading={isLoadingRequests}
                onViewDetails={handleViewDetails}
              />

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <Card className="p-4 bg-slate-900 border-slate-800">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                      disabled={pagination.page === 1}
                      className="border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-slate-400">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                      disabled={pagination.page === pagination.totalPages}
                      className="border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      Next
                    </Button>
                  </div>
                </Card>
              )}
            </TabsContent>

            {/* Saved AOIs Tab */}
            <TabsContent value="aois" className="space-y-4">
              <Card className="p-6 bg-slate-900 border-slate-800">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold mb-2 text-white">My Saved AOIs</h2>
                  <p className="text-sm text-slate-400">
                    Load your saved areas of interest to use in new requests
                  </p>
                </div>
                {activeTab === 'aois' && <SavedAOIsList onLoadAOI={handleLoadAOI} />}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Request Detail Modal */}
      <RequestDetailModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        request={selectedRequest}
        onRequestUpdated={fetchRequests}
      />
    </>
  );
}
