import { useState, useEffect } from 'react';
import { Eye, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { Card } from '@/components/ui/card';
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
  aoi_area_km2: number;
  status: 'pending' | 'reviewing' | 'quoted' | 'approved' | 'completed' | 'cancelled';
  created_at: string;
}

interface RequestsTableProps {
  requests: ImageryRequest[];
  isLoading?: boolean;
  onViewDetails: (request: ImageryRequest) => void;
  page?: number;
  limit?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

type SortField = 'created_at' | 'full_name' | 'email' | 'status' | 'aoi_area_km2';
type SortOrder = 'asc' | 'desc';

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

export function RequestsTable({
  requests,
  isLoading,
  onViewDetails,
  page = 1,
  limit = 10,
  totalPages = 1,
  onPageChange,
}: RequestsTableProps) {
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [sortedRequests, setSortedRequests] = useState<ImageryRequest[]>(requests);

  useEffect(() => {
    const sorted = [...requests].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'full_name':
          aValue = (a.user_id?.full_name || a.full_name || '').toLowerCase();
          bValue = (b.user_id?.full_name || b.full_name || '').toLowerCase();
          break;
        case 'email':
          aValue = (a.user_id?.email || a.email || '').toLowerCase();
          bValue = (b.user_id?.email || b.email || '').toLowerCase();
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case 'aoi_area_km2':
          aValue = a.aoi_area_km2;
          bValue = b.aoi_area_km2;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setSortedRequests(sorted);
  }, [requests, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="h-4 w-4 ml-1 text-slate-400" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="h-4 w-4 ml-1 text-yellow-500" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1 text-yellow-500" />
    );
  };

  const getUserName = (request: ImageryRequest) => {
    if (request.user_id?.full_name) {
      return request.user_id.full_name;
    }
    return request.full_name || 'Unknown';
  };

  const getUserEmail = (request: ImageryRequest) => {
    return request.user_id?.email || request.email || 'N/A';
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages: (number | 'ellipsis')[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        pages.push(page - 1);
        pages.push(page);
        pages.push(page + 1);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange && page > 1 && onPageChange(page - 1)}
              className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>

          {pages.map((pageNum, index) =>
            pageNum === 'ellipsis' ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  onClick={() => onPageChange && onPageChange(pageNum)}
                  isActive={page === pageNum}
                  className="cursor-pointer"
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange && page < totalPages && onPageChange(page + 1)}
              className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
        </div>
      </Card>
    );
  }

  if (sortedRequests.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-slate-600 dark:text-slate-400 font-medium">No imagery requests found</p>
        <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
          Requests will appear here once users submit them
        </p>
      </Card>
    );
  }

  return (
    <div>
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    onClick={() => handleSort('created_at')}
                    className="flex items-center hover:text-yellow-500 transition-colors font-medium"
                  >
                    Request Date
                    {getSortIcon('created_at')}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('full_name')}
                    className="flex items-center hover:text-yellow-500 transition-colors font-medium"
                  >
                    User
                    {getSortIcon('full_name')}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('email')}
                    className="flex items-center hover:text-yellow-500 transition-colors font-medium"
                  >
                    Email
                    {getSortIcon('email')}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center hover:text-yellow-500 transition-colors font-medium"
                  >
                    Status
                    {getSortIcon('status')}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('aoi_area_km2')}
                    className="flex items-center hover:text-yellow-500 transition-colors font-medium"
                  >
                    AOI Area
                    {getSortIcon('aoi_area_km2')}
                  </button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRequests.map((request) => (
                <TableRow key={request._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {new Date(request.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{getUserName(request)}</div>
                      {request.company && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {request.company}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{getUserEmail(request)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusBadgeVariant(request.status)}
                      className={getStatusColor(request.status)}
                    >
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{request.aoi_area_km2.toFixed(2)} km²</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewDetails(request)}
                      className="hover:bg-yellow-500/10 hover:border-yellow-500"
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

      {renderPagination()}
    </div>
  );
}
