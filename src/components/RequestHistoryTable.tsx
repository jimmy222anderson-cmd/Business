import { useState } from 'react';
import { Eye, MapPin, Calendar, Clock } from 'lucide-react';
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
import { Card } from '@/components/ui/card';
import { ImageryRequest } from '@/lib/api/imageryRequests';
import { formatDistanceToNow } from 'date-fns';

interface RequestHistoryTableProps {
  requests: ImageryRequest[];
  isLoading?: boolean;
  onViewDetails: (request: ImageryRequest) => void;
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

export function RequestHistoryTable({ requests, isLoading, onViewDetails }: RequestHistoryTableProps) {
  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
        </div>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className="p-8 text-center">
        <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-3" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">No imagery requests yet</p>
        <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
          Submit your first request from the Explorer page
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request Date</TableHead>
              <TableHead>AOI Type</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Urgency</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request._id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <div>
                      <div className="font-medium">
                        {new Date(request.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="capitalize">{request.aoi_type}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{request.aoi_area_km2.toFixed(2)} km²</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(request.status)} className={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="capitalize text-sm">{request.urgency}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewDetails(request)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
