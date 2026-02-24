import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin, Calendar, User, Mail, Building2, Phone, FileText, DollarSign, History } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatDistanceToNow } from 'date-fns';

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
    coordinates: number[][][];
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
  filters: {
    resolution_category?: string[];
    max_cloud_coverage?: number;
    providers?: string[];
    bands?: string[];
    image_types?: string[];
  };
  urgency: string;
  additional_requirements?: string;
  status: 'pending' | 'reviewing' | 'quoted' | 'approved' | 'completed' | 'cancelled';
  status_history?: Array<{
    status: string;
    changed_at: string;
    changed_by?: {
      _id: string;
      full_name?: string;
      email: string;
    };
    notes?: string;
  }>;
  admin_notes?: string;
  quote_amount?: number;
  quote_currency?: string;
  created_at: string;
  updated_at: string;
}

interface RequestDetailPanelProps {
  request: ImageryRequest;
  onUpdate: (updates: Partial<ImageryRequest>) => void;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/50';
    case 'reviewing':
      return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/50';
    case 'quoted':
      return 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/50';
    case 'approved':
      return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/50';
    case 'completed':
      return 'bg-green-600/20 text-green-700 dark:text-green-500 border-green-600/50';
    case 'cancelled':
      return 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/50';
    default:
      return 'bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/50';
  }
};

export function RequestDetailPanel({ request, onUpdate }: RequestDetailPanelProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState(request.status);
  const [adminNotes, setAdminNotes] = useState(request.admin_notes || '');
  const [quoteAmount, setQuoteAmount] = useState(request.quote_amount?.toString() || '');
  const [quoteCurrency, setQuoteCurrency] = useState(request.quote_currency || 'USD');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [request.aoi_center.lat, request.aoi_center.lng],
      zoom: 10,
      zoomControl: true,
    });

    mapRef.current = map;

    // Add base layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add AOI to map
    try {
      const coords: [number, number][] = request.aoi_coordinates.coordinates[0].map((coord: number[]) => [
        coord[1],
        coord[0],
      ] as [number, number]);
      
      const polygon = L.polygon(coords, {
        color: '#EAB308',
        fillColor: '#EAB308',
        fillOpacity: 0.3,
        weight: 2,
      }).addTo(map);

      // Fit map to polygon bounds
      map.fitBounds(polygon.getBounds(), { padding: [50, 50] });
    } catch (error) {
      console.error('Error rendering AOI on map:', error);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [request]);

  const handleSave = async () => {
    setIsSaving(true);
    
    const updates: Partial<ImageryRequest> = {
      status,
      admin_notes: adminNotes,
    };

    if (quoteAmount) {
      updates.quote_amount = parseFloat(quoteAmount);
      updates.quote_currency = quoteCurrency;
    }

    await onUpdate(updates);
    setIsSaving(false);
  };

  const getUserName = () => {
    return request.user_id?.full_name || request.full_name || 'Unknown';
  };

  const getUserEmail = () => {
    return request.user_id?.email || request.email || 'N/A';
  };

  const getUserCompany = () => {
    return request.user_id?.company || request.company || 'N/A';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Request Details</CardTitle>
              <CardDescription>
                Submitted {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(request.status)}>
              {request.status}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-slate-500 mt-0.5" />
              <div>
                <Label className="text-xs text-slate-500">Full Name</Label>
                <p className="font-medium">{getUserName()}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-slate-500 mt-0.5" />
              <div>
                <Label className="text-xs text-slate-500">Email</Label>
                <p className="font-medium">{getUserEmail()}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-slate-500 mt-0.5" />
              <div>
                <Label className="text-xs text-slate-500">Company</Label>
                <p className="font-medium">{getUserCompany()}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-slate-500 mt-0.5" />
              <div>
                <Label className="text-xs text-slate-500">Phone</Label>
                <p className="font-medium">{request.phone || 'N/A'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AOI Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Area of Interest</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-slate-500 mt-0.5" />
              <div>
                <Label className="text-xs text-slate-500">AOI Type</Label>
                <p className="font-medium capitalize">{request.aoi_type}</p>
              </div>
            </div>
            
            <div>
              <Label className="text-xs text-slate-500">Area</Label>
              <p className="font-medium">{request.aoi_area_km2.toFixed(2)} km²</p>
            </div>
            
            <div>
              <Label className="text-xs text-slate-500">Center Coordinates</Label>
              <p className="font-medium text-sm">
                {request.aoi_center.lat.toFixed(4)}, {request.aoi_center.lng.toFixed(4)}
              </p>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="mt-4">
            <Label className="text-xs text-slate-500 mb-2 block">Map View</Label>
            <div
              ref={containerRef}
              className="w-full h-[300px] rounded-lg border border-slate-200 dark:border-slate-800"
            />
          </div>
        </CardContent>
      </Card>

      {/* Request Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Request Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-slate-500 mt-0.5" />
            <div>
              <Label className="text-xs text-slate-500">Date Range</Label>
              <p className="font-medium">
                {new Date(request.date_range.start_date).toLocaleDateString()} -{' '}
                {new Date(request.date_range.end_date).toLocaleDateString()}
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-xs text-slate-500">Filters</Label>
            
            {request.filters.resolution_category && request.filters.resolution_category.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-1">Resolution</p>
                <div className="flex flex-wrap gap-2">
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
                <p className="text-sm font-medium mb-1">Max Cloud Coverage</p>
                <p className="text-sm">{request.filters.max_cloud_coverage}%</p>
              </div>
            )}

            {request.filters.providers && request.filters.providers.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-1">Providers</p>
                <div className="flex flex-wrap gap-2">
                  {request.filters.providers.map((provider) => (
                    <Badge key={provider} variant="outline">
                      {provider}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {request.filters.bands && request.filters.bands.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-1">Bands</p>
                <div className="flex flex-wrap gap-2">
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
                <p className="text-sm font-medium mb-1">Image Types</p>
                <div className="flex flex-wrap gap-2">
                  {request.filters.image_types.map((type) => (
                    <Badge key={type} variant="outline">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <Label className="text-xs text-slate-500">Urgency</Label>
            <p className="font-medium capitalize">{request.urgency}</p>
          </div>

          {request.additional_requirements && (
            <>
              <Separator />
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-slate-500 mt-0.5" />
                <div className="flex-1">
                  <Label className="text-xs text-slate-500">Additional Requirements</Label>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{request.additional_requirements}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Status History */}
      {request.status_history && request.status_history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status History</CardTitle>
            <CardDescription>Track all status changes for this request</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {request.status_history.map((history, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 last:border-0 last:pb-0">
                  <div className="flex-shrink-0">
                    <Badge className={getStatusColor(history.status)}>
                      {history.status}
                    </Badge>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        Status changed to {history.status}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(history.changed_at), { addSuffix: true })}
                      </p>
                    </div>
                    {history.changed_by && (
                      <p className="text-xs text-slate-500">
                        Changed by: {history.changed_by.full_name || history.changed_by.email}
                      </p>
                    )}
                    {history.notes && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 p-2 bg-slate-50 dark:bg-slate-900 rounded">
                        {history.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Admin Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Update */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="quoted">Quoted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quote Information */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Quote Amount
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Enter amount"
                value={quoteAmount}
                onChange={(e) => setQuoteAmount(e.target.value)}
                className="flex-1"
              />
              <Select value={quoteCurrency} onValueChange={setQuoteCurrency}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                  <SelectItem value="AUD">AUD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="space-y-2">
            <Label htmlFor="admin-notes">Admin Notes</Label>
            <Textarea
              id="admin-notes"
              placeholder="Add internal notes about this request..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={4}
            />
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
