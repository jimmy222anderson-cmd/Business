import { Loader2 } from 'lucide-react';

export function MapLoadingSpinner() {
  return (
    <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-yellow-500 mx-auto" />
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    </div>
  );
}
