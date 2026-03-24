import { useState } from 'react';
import { Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface FavoriteLocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  location: {
    name: string;
    lat: number;
    lng: number;
    bbox?: [number, number, number, number];
    provider?: string;
  } | null;
  onSuccess?: () => void;
}

export const FavoriteLocationDialog = ({
  isOpen,
  onClose,
  location,
  onSuccess,
}: FavoriteLocationDialogProps) => {
  const [customName, setCustomName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location) return;

    setIsSubmitting(true);

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');

      const response = await fetch(`${apiBaseUrl.replace(/\/api$/, '')}/api/user/favorite-locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: customName.trim() || location.name,
          place_name: location.name,
          lat: location.lat,
          lng: location.lng,
          bbox: location.bbox,
          provider: location.provider || 'manual',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add favorite location');
      }

      toast({
        title: 'Success',
        description: 'Location added to favorites',
      });

      setCustomName('');
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error('Error adding favorite:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add favorite location',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Add to Favorites
            </DialogTitle>
            <DialogDescription>
              Save this location for quick access later
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="location-name">Location</Label>
              <Input
                id="location-name"
                value={location?.name || ''}
                disabled
                className="bg-slate-100"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="custom-name">
                Custom Name (Optional)
              </Label>
              <Input
                id="custom-name"
                placeholder="e.g., My Project Site"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                maxLength={200}
              />
              <p className="text-xs text-slate-500">
                Leave empty to use the location name
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-slate-500">Latitude:</span>
                <span className="ml-2 font-mono">{location?.lat.toFixed(4)}</span>
              </div>
              <div>
                <span className="text-slate-500">Longitude:</span>
                <span className="ml-2 font-mono">{location?.lng.toFixed(4)}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add to Favorites'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
