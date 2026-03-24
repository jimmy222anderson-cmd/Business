import { Button } from '@/components/ui/button';
import { Filter, Send, BookmarkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileBottomNavProps {
  onFilterClick: () => void;
  onSavedAOIsClick: () => void;
  onSubmitClick: () => void;
  hasAOI: boolean;
  filterCount?: number;
  isAuthenticated: boolean;
  className?: string;
}

export function MobileBottomNav({
  onFilterClick,
  onSavedAOIsClick,
  onSubmitClick,
  hasAOI,
  filterCount = 0,
  isAuthenticated,
  className,
}: MobileBottomNavProps) {
  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-[998] bg-slate-900 border-t border-slate-700 shadow-2xl md:hidden',
        className
      )}
    >
      <div className="grid grid-cols-3 gap-2 p-3">
        {/* Filters Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onFilterClick}
          className="flex flex-col items-center justify-center h-14 bg-slate-800 border-slate-600 hover:bg-slate-700 hover:border-yellow-500 text-white relative"
        >
          <Filter className="h-5 w-5 mb-1" />
          <span className="text-xs">Filters</span>
          {filterCount > 0 && (
            <span className="absolute top-1 right-1 bg-yellow-500 text-slate-900 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
              {filterCount}
            </span>
          )}
        </Button>

        {/* Saved AOIs Button - Only for authenticated users */}
        {isAuthenticated ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onSavedAOIsClick}
            className="flex flex-col items-center justify-center h-14 bg-slate-800 border-slate-600 hover:bg-slate-700 hover:border-yellow-500 text-white"
          >
            <BookmarkIcon className="h-5 w-5 mb-1" />
            <span className="text-xs">My AOIs</span>
          </Button>
        ) : (
          <div className="flex items-center justify-center">
            <span className="text-xs text-slate-500">Login to save</span>
          </div>
        )}

        {/* Submit Request Button */}
        <Button
          size="sm"
          onClick={onSubmitClick}
          disabled={!hasAOI}
          className="flex flex-col items-center justify-center h-14 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-5 w-5 mb-1" />
          <span className="text-xs">Submit</span>
        </Button>
      </div>
    </div>
  );
}
