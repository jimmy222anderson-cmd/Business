import { useState, useEffect } from 'react';
import { Loader2, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  getSatelliteProducts,
  SatelliteProduct,
  SatelliteProductsQueryParams,
} from '@/lib/api/satelliteProducts';
import { useToast } from '@/hooks/use-toast';
import { FilterState } from '@/components/FilterPanel';
import { ProductGridSkeleton } from '@/components/ProductSkeleton';

interface ProductCatalogProps {
  filterState?: FilterState | null;
  className?: string;
}

export function ProductCatalog({ filterState, className }: ProductCatalogProps) {
  const [products, setProducts] = useState<SatelliteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20); // Products per page
  const [sortBy, setSortBy] = useState<string>('order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const { toast } = useToast();

  // Convert FilterState to API query parameters
  const buildQueryParams = (): SatelliteProductsQueryParams => {
    const params: SatelliteProductsQueryParams = {
      page,
      limit,
      sort: sortBy,
      order: sortOrder,
    };

    if (filterState) {
      // Resolution category - use first selected if multiple
      if (filterState.selectedResolutions.length > 0) {
        params.resolution_category = filterState.selectedResolutions[0];
      }

      // Image type maps to sensor_type
      if (filterState.imageType) {
        params.sensor_type = filterState.imageType;
      }

      // Note: Provider and bands filtering would need backend support
      // For now, we'll filter on the frontend after fetching
    }

    return params;
  };

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = buildQueryParams();
        const response = await getSatelliteProducts(queryParams);

        let filteredProducts = response.products;

        // Apply client-side filtering for providers and bands
        if (filterState) {
          // Filter by providers
          if (filterState.selectedProviders.length > 0) {
            filteredProducts = filteredProducts.filter(product =>
              filterState.selectedProviders.includes(product.provider)
            );
          }

          // Filter by bands - product must have at least one selected band
          if (filterState.selectedBands.length > 0) {
            filteredProducts = filteredProducts.filter(product =>
              filterState.selectedBands.some(band => product.bands.includes(band))
            );
          }
        }

        setProducts(filteredProducts);
        setTotal(response.pagination.total);
        setTotalPages(response.pagination.totalPages);
      } catch (err) {
        console.error('Error fetching satellite products:', err);
        setError('Failed to load satellite products. Please try again.');
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load satellite products. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filterState, page, limit, sortBy, sortOrder, toast]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filterState]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Scroll to top of catalog
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading state
  if (loading) {
    return (
      <div className={className}>
        {/* Controls bar skeleton */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="h-5 w-48 bg-muted animate-pulse rounded" />
          <div className="flex items-center gap-4">
            <div className="h-9 w-40 bg-muted animate-pulse rounded" />
            <div className="h-9 w-32 bg-muted animate-pulse rounded" />
          </div>
        </div>
        
        {/* Product grid skeleton */}
        <ProductGridSkeleton count={limit} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`flex items-center justify-center py-12 ${className || ''}`}>
        <Card className="p-8 max-w-md text-center">
          <div className="space-y-4">
            <div className="text-destructive">
              <Package className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Error Loading Products</h3>
            </div>
            <p className="text-muted-foreground">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div className={`flex items-center justify-center py-12 ${className || ''}`}>
        <Card className="p-8 max-w-md text-center">
          <div className="space-y-4">
            <Package className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-semibold">No Products Found</h3>
            <p className="text-muted-foreground">
              No satellite products match your current filters. Try adjusting your search criteria.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Controls bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Showing {products.length} of {total} products
        </p>

        {/* Sort and page size controls */}
        <div className="flex items-center gap-4">
          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm text-muted-foreground">
              Sort by:
            </label>
            <select
              id="sort"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
                setPage(1); // Reset to first page
              }}
              className="text-sm border border-input bg-background px-3 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="order-asc">Default</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="provider-asc">Provider (A-Z)</option>
              <option value="provider-desc">Provider (Z-A)</option>
              <option value="resolution-asc">Resolution (Low to High)</option>
              <option value="resolution-desc">Resolution (High to Low)</option>
            </select>
          </div>

          {/* Page size selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="pageSize" className="text-sm text-muted-foreground">
              Per page:
            </label>
            <select
              id="pageSize"
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1); // Reset to first page
              }}
              className="text-sm border border-input bg-background px-3 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {products.map((product, index) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="p-4 hover:shadow-lg transition-shadow duration-200">
              <div className="space-y-3">
                {/* Sample image */}
                <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden">
                  <img
                    src={product.sample_image_url}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                </div>

                {/* Product info */}
                <div>
                  <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">{product.provider}</p>
                </div>

                {/* Resolution and bands */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {product.resolution}m resolution
                  </span>
                  <span className="text-muted-foreground">
                    {product.bands.length} bands
                  </span>
                </div>

                {/* View details button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    // TODO: Open product detail modal
                    console.log('View details:', product._id);
                  }}
                >
                  View Details
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className={page === pageNum ? 'bg-yellow-500 hover:bg-yellow-600 text-slate-900' : ''}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
