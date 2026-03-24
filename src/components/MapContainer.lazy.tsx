import { lazy, Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Lazy load the MapContainer component
const MapContainerComponent = lazy(() => 
  import('./MapContainer').then(module => ({ default: module.MapContainer }))
);

// Loading fallback component
const MapLoadingFallback = () => (
  <div className="w-full h-full flex items-center justify-center bg-slate-900">
    <Card className="bg-slate-800 border-slate-700 p-8">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-yellow-500" />
        <div className="text-center">
          <p className="text-lg font-semibold text-white mb-1">Loading Map</p>
          <p className="text-sm text-slate-400">Initializing interactive map components...</p>
        </div>
      </div>
    </Card>
  </div>
);

// Lazy-loaded MapContainer with Suspense boundary
export const LazyMapContainer = (props: any) => (
  <Suspense fallback={<MapLoadingFallback />}>
    <MapContainerComponent {...props} />
  </Suspense>
);
