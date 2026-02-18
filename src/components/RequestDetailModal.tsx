import { MapPin, Calendar, Clock, User, Mail, Building2, Phone, FileText, DollarSign, Filter, CheckCircle2, XCircle, Copy } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ImageryRequest, cancelImageryRequest } from '@/lib/api/imageryRequests';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface RequestDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: ImageryRequest | null;
  onRequestUpdated?: () => void;
}

const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'outline';
    case 'reviewing':
      return 'default';
    case 'quoted':
      return 'secondary';
    case 'approved':
      return 'default';
    case 'completed':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'reviewing':
      return 'text-blue-600 dark:text-blue-400';
    case 'quoted':
      return 'text-purple-600 dark:text-purple-400';
    case 'approved':
      return 'text-green-600 dark:text-green-400';
    case 'completed':
      return 'text-green-700 dark:text-green-500';
    case 'cancelled':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-slate-600 dark:text-slate-400';
  }
};

export function RequestDetailModal({ open, onOpenChange, request, onRequestUpdated }: RequestDetailModalProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Debug: Log when showCancelDialog changes
  useEffect(() => {
    console.log('showCancelDialog changed to:', showCancelDialog);
  }, [showCancelDialog]);

  if (!request) return null;

  // Sort status history by date (newest first)
  const statusHistory = request.status_history 
    ? [...request.status_history].sort((a, b) => 
        new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()
      )
    : [];

  // Check if request can be cancelled
  const canCancel = ['pending', 'reviewing'].includes(request.status.toLowerCase());

  const handleCancelClick = () => {
    console.log('Cancel button clicked, current showCancelDialog:', showCancelDialog);
    setShowCancelDialog(true);
    console.log('Set showCancelDialog to true');
  };

  const handleCancelRequest = async () => {
    setIsCancelling(true);
    try {
      await cancelImageryRequest(request._id, cancellationReason);
      
      toast({
        title: 'Request Cancelled',
        description: 'Your imagery request has been cancelled successfully.',
      });
      
      // Close dialogs
      setShowCancelDialog(false);
      setCancellationReason('');
      
      // Small delay before closing main modal to ensure dialog closes first
      setTimeout(() => {
        onOpenChange(false);
        
        // Notify parent to refresh the list
        if (onRequestUpdated) {
          onRequestUpdated();
        }
      }, 100);
    } catch (error: any) {
      console.error('Error cancelling request:', error);
      toast({
        title: 'Cancellation Failed',
        description: error.response?.data?.message || 'Failed to cancel the request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDuplicateRequest = () => {
    try {
      // Navigate to explorer with pre-filled data
      navigate('/explore', {
        state: {
          duplicateRequest: {
            aoi_type: request.aoi_type,
            aoi_coordinates: request.aoi_coordinates,
            aoi_area_km2: request.aoi_area_km2,
            aoi_center: request.aoi_center,
            date_range: request.date_range,
            filters: request.filters,
            urgency: request.urgency,
            additional_requirements: request.additional_requirements,
          }
        }
      });
      
      toast({
        title: 'Request Duplicated',
        description: 'You can now modify and submit the duplicated request.',
      });
      
      // Close modal
      onOpenChange(false);
    } catch (error) {
      console.error('Error duplicating request:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate request. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Imagery Request Details</DialogTitle>
            <DialogDescription>
              Request ID: {request._id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
          {/* Status and Quote */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Status</p>
                <Badge variant={getStatusBadgeVariant(request.status)} className={getStatusColor(request.status)}>
                  {request.status}
                </Badge>
              </div>
              {request.quote_amount && (
                <div className="text-right">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Quote</p>
                  <div className="flex items-center gap-1 text-lg font-semibold text-green-600 dark:text-green-400">
                    <DollarSign className="h-5 w-5" />
                    {request.quote_amount} {request.quote_currency || 'USD'}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Status Timeline */}
          {statusHistory.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Status Timeline
              </h3>
              <Card className="p-4">
                <div className="space-y-4">
                  {statusHistory.map((history, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`rounded-full p-2 ${
                          index === 0 
                            ? 'bg-yellow-100 dark:bg-yellow-900' 
                            : 'bg-slate-100 dark:bg-slate-800'
                        }`}>
                          <CheckCircle2 className={`h-4 w-4 ${
                            index === 0 
                              ? 'text-yellow-600 dark:text-yellow-400' 
                              : 'text-slate-400'
                          }`} />
                        </div>
                        {index < statusHistory.length - 1 && (
                          <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-700 mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant={getStatusBadgeVariant(history.status)} 
                            className={getStatusColor(history.status)}
                          >
                            {history.status}
                          </Badge>
                          {index === 0 && (
                            <span className="text-xs text-slate-500">Current</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {format(new Date(history.changed_at), 'PPpp')}
                        </p>
                        {history.notes && (
                          <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 p-2 bg-slate-50 dark:bg-slate-800 rounded">
                            {history.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <User className="h-5 w-5" />
              Contact Information
            </h3>
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Name</p>
                    <p className="font-medium">{request.full_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="font-medium">{request.email}</p>
                  </div>
                </div>
                {request.company && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Company</p>
                      <p className="font-medium">{request.company}</p>
                    </div>
                  </div>
                )}
                {request.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Phone</p>
                      <p className="font-medium">{request.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* AOI Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Area of Interest
            </h3>
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Type</p>
                  <p className="font-medium capitalize">{request.aoi_type}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Area</p>
                  <p className="font-medium text-yellow-600 dark:text-yellow-400">
                    {request.aoi_area_km2.toFixed(2)} km²
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Center</p>
                  <p className="font-mono text-xs">
                    {request.aoi_center.lat.toFixed(4)}, {request.aoi_center.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          {request.filters && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Applied Filters
              </h3>
              <Card className="p-4">
                <div className="space-y-3">
                  {request.date_range && (request.date_range.start_date || request.date_range.end_date) && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Date Range</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-sm">
                          {request.date_range.start_date && format(new Date(request.date_range.start_date), 'MMM d, yyyy')}
                          {request.date_range.start_date && request.date_range.end_date && ' - '}
                          {request.date_range.end_date && format(new Date(request.date_range.end_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {request.filters.resolution_category && request.filters.resolution_category.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Resolution</p>
                      <div className="flex flex-wrap gap-1">
                        {request.filters.resolution_category.map((res) => (
                          <Badge key={res} variant="outline" className="uppercase">
                            {res}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {request.filters.max_cloud_coverage !== undefined && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Max Cloud Coverage</p>
                      <p className="text-sm">{request.filters.max_cloud_coverage}%</p>
                    </div>
                  )}
                  
                  {request.filters.providers && request.filters.providers.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Providers</p>
                      <div className="flex flex-wrap gap-1">
                        {request.filters.providers.map((provider) => (
                          <Badge key={provider} variant="secondary">
                            {provider}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {request.filters.bands && request.filters.bands.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Bands</p>
                      <div className="flex flex-wrap gap-1">
                        {request.filters.bands.map((band) => (
                          <Badge key={band} variant="outline">
                            {band}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {request.filters.image_types && request.filters.image_types.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Image Types</p>
                      <div className="flex flex-wrap gap-1">
                        {request.filters.image_types.map((type) => (
                          <Badge key={type} variant="outline" className="capitalize">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* Additional Requirements */}
          {request.additional_requirements && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Additional Requirements
              </h3>
              <Card className="p-4">
                <p className="text-sm whitespace-pre-wrap">{request.additional_requirements}</p>
              </Card>
            </div>
          )}

          {/* Admin Notes */}
          {request.admin_notes && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Admin Notes
              </h3>
              <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <p className="text-sm whitespace-pre-wrap text-blue-900 dark:text-blue-100">{request.admin_notes}</p>
              </Card>
            </div>
          )}

          {/* Request Details */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Request Details
            </h3>
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Urgency</p>
                  <p className="font-medium capitalize">{request.urgency}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Created</p>
                  <p className="font-medium">{format(new Date(request.created_at), 'PPpp')}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Last Updated</p>
                  <p className="font-medium">{format(new Date(request.updated_at), 'PPpp')}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer with Action Buttons */}
        <DialogFooter className="border-t pt-4 flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleDuplicateRequest}
            className="w-full sm:w-auto"
          >
            <Copy className="mr-2 h-4 w-4" />
            Duplicate Request
          </Button>
          {canCancel && (
            <Button
              variant="destructive"
              onClick={handleCancelClick}
              className="w-full sm:w-auto"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Request
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Cancel Confirmation Dialog - Using regular Dialog instead of AlertDialog */}
    <Dialog open={showCancelDialog} onOpenChange={(open) => {
      console.log('Cancel Dialog onOpenChange called with:', open);
      setShowCancelDialog(open);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Imagery Request?</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this imagery request? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Label htmlFor="cancellation-reason" className="text-sm font-medium">
            Reason for cancellation (optional)
          </Label>
          <Textarea
            id="cancellation-reason"
            placeholder="Please provide a reason for cancelling this request..."
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            className="mt-2"
            rows={3}
          />
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setShowCancelDialog(false)}
            disabled={isCancelling}
            className="w-full sm:w-auto"
          >
            Keep Request
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancelRequest}
            disabled={isCancelling}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
          >
            {isCancelling ? 'Cancelling...' : 'Cancel Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>
  );
}
