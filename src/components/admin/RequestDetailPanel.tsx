import { useState, useEffect, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MapPin, Calendar, User, Mail, Building2, Phone,
  FileText, DollarSign, Layers, Briefcase, Clock, AlertTriangle,
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatDistanceToNow } from 'date-fns';

interface ImageryRequest {
  _id: string;
  user_id?: { email: string; full_name?: string; company?: string };
  full_name: string;
  email: string;
  company?: string;
  phone?: string;
  use_case?: string;
  data_type?: string;
  aoi_type: string;
  aoi_coordinates: { type: string; coordinates: number[][][] };
  aoi_area_km2: number;
  aoi_center: { lat: number; lng: number };
  date_range: { start_date: string; end_date: string };
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
    changed_by?: { _id: string; full_name?: string; email: string };
    notes?: string;
  }>;
  admin_notes?: string;
  quote_amount?: number;
  quote_currency?: string;
  estimated_archive_price?: number;
  estimated_tasking_price?: number;
  created_at: string;
  updated_at: string;
}

interface RequestDetailPanelProps {
  request: ImageryRequest;
  onUpdate: (updates: Partial<ImageryRequest>) => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  reviewing: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  quoted:    'bg-purple-500/20 text-purple-400 border-purple-500/40',
  approved:  'bg-green-500/20 text-green-400 border-green-500/40',
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/40',
};

const URGENCY_COLORS: Record<string, string> = {
  standard:  'bg-slate-700/60 text-slate-300 border-slate-600',
  urgent:    'bg-orange-500/20 text-orange-400 border-orange-500/40',
  emergency: 'bg-red-500/20 text-red-400 border-red-500/40',
};

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="bg-gray-800/60 border border-gray-700 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-700 bg-gray-800">
        <Icon className="h-4 w-4 text-yellow-400" />
        <h3 className="text-sm font-semibold text-white tracking-wide">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-white">{value || <span className="text-gray-600">—</span>}</p>
    </div>
  );
}

export function RequestDetailPanel({ request, onUpdate }: RequestDetailPanelProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState(request.status);
  const [adminNotes, setAdminNotes] = useState(request.admin_notes || '');
  const [quoteAmount, setQuoteAmount] = useState(request.quote_amount?.toString() || '');
  const [quoteCurrency, setQuoteCurrency] = useState(request.quote_currency || 'USD');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [request.aoi_center.lat, request.aoi_center.lng],
      zoom: 10,
      zoomControl: true,
    });
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    try {
      const coords: [number, number][] = request.aoi_coordinates.coordinates[0].map(
        (c) => [c[1], c[0]] as [number, number]
      );
      const polygon = L.polygon(coords, {
        color: '#EAB308', fillColor: '#EAB308', fillOpacity: 0.25, weight: 2,
      }).addTo(map);
      map.fitBounds(polygon.getBounds(), { padding: [40, 40] });
    } catch (e) {
      console.error('Map render error:', e);
    }

    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, [request]);

  const handleSave = async () => {
    setIsSaving(true);
    const updates: Partial<ImageryRequest> = { status, admin_notes: adminNotes };
    if (quoteAmount) {
      updates.quote_amount = parseFloat(quoteAmount);
      updates.quote_currency = quoteCurrency;
    }
    await onUpdate(updates);
    setIsSaving(false);
  };

  const name    = request.user_id?.full_name || request.full_name || 'Unknown';
  const email   = request.user_id?.email     || request.email     || '—';
  const company = request.user_id?.company   || request.company   || '—';

  const hasFilters =
    (request.filters?.resolution_category?.length ?? 0) > 0 ||
    request.filters?.max_cloud_coverage !== undefined ||
    (request.filters?.providers?.length ?? 0) > 0 ||
    (request.filters?.bands?.length ?? 0) > 0 ||
    (request.filters?.image_types?.length ?? 0) > 0;

  return (
    <div className="space-y-4 text-white">

      {/* ── Header bar ── */}
      <div className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-xl px-5 py-4">
        <div>
          <p className="text-xs text-gray-500">Request ID</p>
          <p className="text-sm font-mono text-gray-300">{request._id}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 mb-1">
            {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
          </p>
          <Badge className={`${STATUS_COLORS[request.status] ?? STATUS_COLORS.pending} border capitalize`}>
            {request.status}
          </Badge>
        </div>
      </div>

      {/* ── Contact ── */}
      <Section title="Contact Information" icon={User}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <Field label="Full Name" value={name} />
          <Field label="Email" value={email} />
          <Field label="Company" value={company} />
          <Field label="Phone" value={request.phone} />
          {request.use_case && <Field label="Use Case" value={request.use_case} />}
          {request.data_type && (
            <Field label="Data Type" value={
              <span className="capitalize flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-yellow-400" />
                {request.data_type}
              </span>
            } />
          )}
        </div>
      </Section>

      {/* ── AOI ── */}
      <Section title="Area of Interest" icon={MapPin}>
        <div className="grid grid-cols-3 gap-x-6 gap-y-4 mb-4">
          <Field label="AOI Type" value={<span className="capitalize">{request.aoi_type}</span>} />
          <Field label="Area" value={`${request.aoi_area_km2.toFixed(2)} km²`} />
          <Field label="Center" value={
            <span className="font-mono text-xs">
              {request.aoi_center.lat.toFixed(4)}, {request.aoi_center.lng.toFixed(4)}
            </span>
          } />
        </div>

        {(request.aoi_type === 'polygon' || request.aoi_type === 'rectangle') &&
          request.aoi_coordinates?.coordinates?.[0] && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Vertex Coordinates</p>
            <div className="max-h-40 overflow-y-auto bg-gray-900 rounded-lg p-3 space-y-1 border border-gray-700">
              {request.aoi_coordinates.coordinates[0].slice(0, -1).map((coord, i) => (
                <div key={i} className="flex justify-between text-xs font-mono">
                  <span className="text-gray-500">Vertex {i + 1}</span>
                  <span className="text-gray-300">{coord[1].toFixed(4)}, {coord[0].toFixed(4)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div ref={containerRef} className="w-full h-64 rounded-lg border border-gray-700 overflow-hidden" />
      </Section>

      {/* ── Request Parameters ── */}
      <Section title="Request Parameters" icon={Calendar}>
        <div className="space-y-4">
          {/* Date range */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date" value={new Date(request.date_range.start_date).toLocaleDateString()} />
            <Field label="End Date"   value={new Date(request.date_range.end_date).toLocaleDateString()} />
          </div>

          {/* Urgency */}
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Urgency</p>
            <Badge className={`${URGENCY_COLORS[request.urgency] ?? URGENCY_COLORS.standard} border capitalize`}>
              <AlertTriangle className="h-3 w-3 mr-1" />
              {request.urgency}
            </Badge>
          </div>

          {/* Filters */}
          {hasFilters && (
            <div className="border-t border-gray-700 pt-4 space-y-3">
              <p className="text-xs text-gray-500">Applied Filters</p>

              {(request.filters?.resolution_category?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">Resolution</p>
                  <div className="flex flex-wrap gap-1.5">
                    {request.filters.resolution_category!.map((r) => (
                      <Badge key={r} className="bg-gray-700 text-gray-200 border-gray-600 border uppercase text-xs">{r}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {request.filters?.max_cloud_coverage !== undefined && (
                <Field label="Max Cloud Coverage" value={`${request.filters.max_cloud_coverage}%`} />
              )}

              {(request.filters?.providers?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">Providers</p>
                  <div className="flex flex-wrap gap-1.5">
                    {request.filters.providers!.map((p) => (
                      <Badge key={p} className="bg-gray-700 text-gray-200 border-gray-600 border text-xs">{p}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {(request.filters?.bands?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">Bands</p>
                  <div className="flex flex-wrap gap-1.5">
                    {request.filters.bands!.map((b) => (
                      <Badge key={b} className="bg-gray-700 text-gray-200 border-gray-600 border text-xs">{b}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {(request.filters?.image_types?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">Image Types</p>
                  <div className="flex flex-wrap gap-1.5">
                    {request.filters.image_types!.map((t) => (
                      <Badge key={t} className="bg-gray-700 text-gray-200 border-gray-600 border capitalize text-xs">{t}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Price estimates */}
          {(request.estimated_archive_price !== undefined || request.estimated_tasking_price !== undefined) && (
            <div className="border-t border-gray-700 pt-4">
              <p className="text-xs text-gray-500 mb-3">Price Estimates (Submitted)</p>
              <div className="grid grid-cols-2 gap-3">
                {request.estimated_archive_price !== undefined && (
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">Archive</p>
                    <p className="text-xl font-bold text-yellow-400">${request.estimated_archive_price.toFixed(2)}</p>
                    <p className="text-xs text-gray-600 mt-0.5">Existing imagery</p>
                  </div>
                )}
                {request.estimated_tasking_price !== undefined && (
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">Tasking</p>
                    <p className="text-xl font-bold text-yellow-400">${request.estimated_tasking_price.toFixed(2)}</p>
                    <p className="text-xs text-gray-600 mt-0.5">New collection</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional requirements */}
          {request.additional_requirements && (
            <div className="border-t border-gray-700 pt-4">
              <p className="text-xs text-gray-500 mb-1.5">Additional Requirements</p>
              <p className="text-sm text-gray-300 whitespace-pre-wrap bg-gray-900 border border-gray-700 rounded-lg p-3">
                {request.additional_requirements}
              </p>
            </div>
          )}
        </div>
      </Section>

      {/* ── Status History ── */}
      {(request.status_history?.length ?? 0) > 0 && (
        <Section title="Status History" icon={Clock}>
          <div className="space-y-3">
            {request.status_history!.map((h, i) => (
              <div key={i} className="flex gap-3 pb-3 border-b border-gray-700 last:border-0 last:pb-0">
                <Badge className={`${STATUS_COLORS[h.status] ?? STATUS_COLORS.pending} border capitalize shrink-0 h-fit`}>
                  {h.status}
                </Badge>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-white">Status changed to <span className="font-medium capitalize">{h.status}</span></p>
                    <p className="text-xs text-gray-500 shrink-0">
                      {formatDistanceToNow(new Date(h.changed_at), { addSuffix: true })}
                    </p>
                  </div>
                  {h.changed_by && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      By: {h.changed_by.full_name || h.changed_by.email}
                    </p>
                  )}
                  {h.notes && (
                    <p className="text-xs text-gray-400 mt-1.5 bg-gray-900 border border-gray-700 rounded p-2">
                      {h.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Admin Actions ── */}
      <Section title="Admin Actions" icon={FileText}>
        <div className="space-y-4">
          {/* Status */}
          <div>
            <Label className="text-xs text-gray-400 mb-1.5 block">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {['pending','reviewing','quoted','approved','completed','cancelled'].map((s) => (
                  <SelectItem key={s} value={s} className="text-white capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quote */}
          <div>
            <Label className="text-xs text-gray-400 mb-1.5 flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" /> Quote Amount
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Enter amount"
                value={quoteAmount}
                onChange={(e) => setQuoteAmount(e.target.value)}
                className="flex-1 bg-gray-900 border-gray-600 text-white placeholder:text-gray-600"
              />
              <Select value={quoteCurrency} onValueChange={setQuoteCurrency}>
                <SelectTrigger className="w-24 bg-gray-900 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {['USD','EUR','GBP','CAD','AUD'].map((c) => (
                    <SelectItem key={c} value={c} className="text-white">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Admin Notes */}
          <div>
            <Label className="text-xs text-gray-400 mb-1.5 block">Admin Notes</Label>
            <Textarea
              placeholder="Add internal notes..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={4}
              className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-600 resize-none"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Section>
    </div>
  );
}
