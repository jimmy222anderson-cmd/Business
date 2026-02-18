import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Loader2 } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createSavedAOI, CreateSavedAOIData } from '@/lib/api/savedAOIs';
import { AOIData } from '@/components/forms/RequestForm';

interface SaveAOIDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aoiData: AOIData | null;
  onSaveSuccess?: () => void;
}

interface FormData {
  name: string;
  description: string;
}

export function SaveAOIDialog({ open, onOpenChange, aoiData, onSaveSuccess }: SaveAOIDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    if (!aoiData) {
      toast({
        title: 'Error',
        description: 'No AOI data available to save',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const saveData: CreateSavedAOIData = {
        name: data.name.trim(),
        description: data.description.trim() || undefined,
        aoi_type: aoiData.type as 'polygon' | 'rectangle' | 'circle',
        aoi_coordinates: aoiData.geoJSON.geometry,
        aoi_area_km2: aoiData.area,
        aoi_center: aoiData.center,
      };

      await createSavedAOI(saveData);

      toast({
        title: 'Success',
        description: 'AOI saved successfully',
      });

      reset();
      onOpenChange(false);
      
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (error: any) {
      console.error('Save AOI error:', error);
      
      const errorMessage = error?.message || error?.data?.message || 'Failed to save AOI';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Save Area of Interest</DialogTitle>
          <DialogDescription>
            Give your AOI a name and optional description for easy reference later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            {/* AOI Summary */}
            {aoiData && (
              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Type:</span>
                  <span className="font-medium text-slate-900 dark:text-white capitalize">{aoiData.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Area:</span>
                  <span className="font-medium text-yellow-600 dark:text-yellow-400">
                    {aoiData.area.toFixed(2)} km²
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Center:</span>
                  <span className="font-mono text-xs text-slate-900 dark:text-white">
                    {aoiData.center.lat.toFixed(4)}, {aoiData.center.lng.toFixed(4)}
                  </span>
                </div>
              </div>
            )}

            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Downtown Area, Farm Plot A"
                {...register('name', {
                  required: 'Name is required',
                  maxLength: {
                    value: 100,
                    message: 'Name must be 100 characters or less',
                  },
                })}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add notes about this area..."
                rows={3}
                {...register('description', {
                  maxLength: {
                    value: 500,
                    message: 'Description must be 500 characters or less',
                  },
                })}
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save AOI
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
