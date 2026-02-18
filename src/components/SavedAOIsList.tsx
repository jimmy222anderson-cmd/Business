import { useState, useEffect } from 'react';
import { MapPin, Trash2, Edit2, Loader2, Search, Download, Calendar, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { getSavedAOIs, deleteSavedAOI, markAOIAsUsed, SavedAOI } from '@/lib/api/savedAOIs';
import { formatDistanceToNow } from 'date-fns';

interface SavedAOIsListProps {
  onLoadAOI?: (aoi: SavedAOI) => void;
  onRefresh?: number; // Trigger refresh when this changes
}

export function SavedAOIsList({ onLoadAOI, onRefresh }: SavedAOIsListProps) {
  const { toast } = useToast();
  const [aois, setAois] = useState<SavedAOI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [aoiToDelete, setAoiToDelete] = useState<SavedAOI | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAOIs = async () => {
    setIsLoading(true);
    try {
      const response = await getSavedAOIs({
        sort: 'last_used_at',
        order: 'desc',
        limit: 50,
        search: searchQuery || undefined,
      });
      setAois(response.aois);
    } catch (error: any) {
      console.error('Fetch AOIs error:', error);
      toast({
        title: 'Error',
        description: 'Failed to load saved AOIs',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAOIs();
  }, [searchQuery, onRefresh]);

  const handleLoadAOI = async (aoi: SavedAOI) => {
    try {
      // Mark as used
      await markAOIAsUsed(aoi._id);
      
      // Notify parent
      if (onLoadAOI) {
        onLoadAOI(aoi);
      }
      
      toast({
        title: 'AOI Loaded',
        description: `"${aoi.name}" has been loaded on the map`,
      });
      
      // Refresh list to update last_used_at
      fetchAOIs();
    } catch (error: any) {
      console.error('Load AOI error:', error);
      toast({
        title: 'Error',
        description: 'Failed to load AOI',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (aoi: SavedAOI) => {
    setAoiToDelete(aoi);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!aoiToDelete) return;

    setIsDeleting(true);
    try {
      await deleteSavedAOI(aoiToDelete._id);
      
      toast({
        title: 'Success',
        description: `"${aoiToDelete.name}" has been deleted`,
      });
      
      // Refresh list
      fetchAOIs();
    } catch (error: any) {
      console.error('Delete AOI error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete AOI',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setAoiToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input
          type="text"
          placeholder="Search saved AOIs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
        />
      </div>

      {/* AOI List */}
      {aois.length === 0 ? (
        <Card className="p-8 text-center bg-slate-900 border-slate-800">
          <MapPin className="h-12 w-12 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-300">
            {searchQuery ? 'No AOIs found matching your search' : 'No saved AOIs yet'}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            {searchQuery ? 'Try a different search term' : 'Draw an area on the map and save it for later use'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {aois.map((aoi) => (
            <Card key={aoi._id} className="p-4 hover:shadow-md transition-shadow bg-slate-900 border-slate-800">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate text-white">{aoi.name}</h3>
                    {aoi.description && (
                      <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                        {aoi.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Maximize2 className="h-4 w-4" />
                    <span className="capitalize">{aoi.aoi_type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium text-yellow-500">
                      {aoi.aoi_area_km2.toFixed(2)} km²
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 col-span-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs">
                      {aoi.last_used_at
                        ? `Used ${formatDistanceToNow(new Date(aoi.last_used_at), { addSuffix: true })}`
                        : `Created ${formatDistanceToNow(new Date(aoi.created_at), { addSuffix: true })}`}
                    </span>
                  </div>
                </div>

                {/* Coordinates */}
                <div className="text-xs font-mono text-slate-500 truncate">
                  {aoi.aoi_center.lat.toFixed(4)}, {aoi.aoi_center.lng.toFixed(4)}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-slate-800">
                  <Button
                    size="sm"
                    onClick={() => handleLoadAOI(aoi)}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-slate-900"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Load on Map
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteClick(aoi)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-950 border-slate-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Saved AOI</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{aoiToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
