import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Filter, X, Calendar, Maximize2, Cloud, Building2, Search, Layers, Image, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './FilterPanel.css';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

type ResolutionCategory = 'vhr' | 'high' | 'medium' | 'low';

export interface FilterState {
  dateRange: DateRange;
  selectedResolutions: ResolutionCategory[];
  cloudCoverage: number;
  selectedProviders: string[];
  selectedBands: string[];
  imageType: string;
}

interface FilterPanelProps {
  className?: string;
  onFilterChange?: (filters: FilterState) => void;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

interface ResolutionOption {
  value: ResolutionCategory;
  label: string;
  description: string;
}

const resolutionOptions: ResolutionOption[] = [
  { value: 'vhr', label: 'VHR (Very High)', description: '<1m resolution' },
  { value: 'high', label: 'High', description: '1-5m resolution' },
  { value: 'medium', label: 'Medium', description: '5-30m resolution' },
  { value: 'low', label: 'Low', description: '>30m resolution' },
];

// Common satellite providers
const providerOptions = [
  'Maxar Technologies',
  'Planet Labs',
  'ICEYE',
  'European Space Agency (ESA)',
  'NASA',
  'Airbus Defence and Space',
  'BlackSky',
  'Capella Space',
  'Satellogic',
  'SIIS (SI Imaging Services)',
];

// Spectral bands options
const bandsOptions = [
  { value: 'RGB', label: 'RGB', description: 'Red, Green, Blue' },
  { value: 'NIR', label: 'NIR', description: 'Near-Infrared' },
  { value: 'Red-Edge', label: 'Red-Edge', description: 'Vegetation analysis' },
  { value: 'SWIR', label: 'SWIR', description: 'Short-Wave Infrared' },
  { value: 'Thermal', label: 'Thermal', description: 'Thermal Infrared' },
  { value: 'Panchromatic', label: 'Panchromatic', description: 'Single band, high resolution' },
];

// Image type options
const imageTypeOptions = [
  { value: 'optical', label: 'Optical', description: 'Visible and near-infrared imagery' },
  { value: 'radar', label: 'Radar (SAR)', description: 'Synthetic Aperture Radar' },
  { value: 'thermal', label: 'Thermal', description: 'Thermal infrared imagery' },
];

export function FilterPanel({ className, onFilterChange, isOpen, onOpenChange }: FilterPanelProps) {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });
  const [selectedResolutions, setSelectedResolutions] = useState<ResolutionCategory[]>([]);
  const [cloudCoverage, setCloudCoverage] = useState<number>(100);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [providerSearchQuery, setProviderSearchQuery] = useState<string>('');
  const [selectedBands, setSelectedBands] = useState<string[]>([]);
  const [imageType, setImageType] = useState<string>('');

  // Use controlled state if provided, otherwise use internal state
  const isExpanded = isOpen !== undefined ? isOpen : false;

  // Notify parent of filter changes
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        dateRange,
        selectedResolutions,
        cloudCoverage,
        selectedProviders,
        selectedBands,
        imageType,
      });
    }
  }, [dateRange, selectedResolutions, cloudCoverage, selectedProviders, selectedBands, imageType, onFilterChange]);

  const togglePanel = () => {
    if (onOpenChange) {
      onOpenChange(!isExpanded);
    }
  };

  const handleStartDateChange = (date: Date | null) => {
    setDateRange((prev) => ({
      ...prev,
      startDate: date,
    }));
  };

  const handleEndDateChange = (date: Date | null) => {
    // Validate that end date is not before start date
    if (date && dateRange.startDate && date < dateRange.startDate) {
      return; // Don't update if end date is before start date
    }
    setDateRange((prev) => ({
      ...prev,
      endDate: date,
    }));
  };

  const setPresetDateRange = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    setDateRange({ startDate, endDate });
  };

  const clearDateRange = () => {
    setDateRange({ startDate: null, endDate: null });
  };

  const toggleResolution = (resolution: ResolutionCategory) => {
    setSelectedResolutions((prev) =>
      prev.includes(resolution)
        ? prev.filter((r) => r !== resolution)
        : [...prev, resolution]
    );
  };

  const clearResolutions = () => {
    setSelectedResolutions([]);
  };

  const handleCloudCoverageChange = (value: number[]) => {
    setCloudCoverage(value[0]);
  };

  const setPresetCloudCoverage = (percentage: number) => {
    setCloudCoverage(percentage);
  };

  const toggleProvider = (provider: string) => {
    setSelectedProviders((prev) =>
      prev.includes(provider)
        ? prev.filter((p) => p !== provider)
        : [...prev, provider]
    );
  };

  const clearProviders = () => {
    setSelectedProviders([]);
    setProviderSearchQuery('');
  };

  const filteredProviders = providerOptions.filter((provider) =>
    provider.toLowerCase().includes(providerSearchQuery.toLowerCase())
  );

  const toggleBand = (band: string) => {
    setSelectedBands((prev) =>
      prev.includes(band)
        ? prev.filter((b) => b !== band)
        : [...prev, band]
    );
  };

  const clearBands = () => {
    setSelectedBands([]);
  };

  const clearImageType = () => {
    setImageType('');
  };

  // Clear all filters
  const clearAllFilters = () => {
    setDateRange({ startDate: null, endDate: null });
    setSelectedResolutions([]);
    setCloudCoverage(100);
    setSelectedProviders([]);
    setProviderSearchQuery('');
    setSelectedBands([]);
    setImageType('');
  };

  // Calculate active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (dateRange.startDate || dateRange.endDate) count++;
    if (selectedResolutions.length > 0) count++;
    if (cloudCoverage < 100) count++;
    if (selectedProviders.length > 0) count++;
    if (selectedBands.length > 0) count++;
    if (imageType) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <>
      {/* Overlay backdrop for both mobile and desktop */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/50 z-[998]"
          onClick={togglePanel}
        />
      )}

      <motion.div
        initial={{ x: -384 }}
        animate={{ x: isExpanded ? 0 : -384 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          'fixed md:relative bg-slate-900 text-white shadow-2xl z-[999]',
          'h-screen md:h-auto',
          isExpanded ? 'w-80 lg:w-96' : 'w-0',
          className
        )}
      >

      {/* Panel Content */}
      <div
        className={cn(
          'h-full flex flex-col overflow-hidden transition-opacity duration-300',
          isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-yellow-400" />
              <h2 className="text-xl font-bold">FILTERS</h2>
              {activeFilterCount > 0 && (
                <span className="bg-yellow-500 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                disabled={activeFilterCount === 0}
                className="text-slate-400 hover:text-white hover:bg-slate-800 text-xs disabled:opacity-50"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
              {/* Close button - visible on both mobile and desktop */}
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePanel}
                className="text-slate-400 hover:text-white hover:bg-slate-800"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-2">
            Refine your imagery search
          </p>
          
          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {(dateRange.startDate || dateRange.endDate) && (
                <span className="inline-flex items-center gap-1 bg-slate-800 border border-yellow-500/50 text-yellow-400 text-xs px-2 py-1 rounded">
                  Date Range
                  <button
                    onClick={clearDateRange}
                    className="hover:text-yellow-300"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedResolutions.length > 0 && (
                <span className="inline-flex items-center gap-1 bg-slate-800 border border-yellow-500/50 text-yellow-400 text-xs px-2 py-1 rounded">
                  Resolution ({selectedResolutions.length})
                  <button
                    onClick={clearResolutions}
                    className="hover:text-yellow-300"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {cloudCoverage < 100 && (
                <span className="inline-flex items-center gap-1 bg-slate-800 border border-yellow-500/50 text-yellow-400 text-xs px-2 py-1 rounded">
                  Cloud ≤{cloudCoverage}%
                  <button
                    onClick={() => setCloudCoverage(100)}
                    className="hover:text-yellow-300"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedProviders.length > 0 && (
                <span className="inline-flex items-center gap-1 bg-slate-800 border border-yellow-500/50 text-yellow-400 text-xs px-2 py-1 rounded">
                  Providers ({selectedProviders.length})
                  <button
                    onClick={clearProviders}
                    className="hover:text-yellow-300"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedBands.length > 0 && (
                <span className="inline-flex items-center gap-1 bg-slate-800 border border-yellow-500/50 text-yellow-400 text-xs px-2 py-1 rounded">
                  Bands ({selectedBands.length})
                  <button
                    onClick={clearBands}
                    className="hover:text-yellow-300"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {imageType && (
                <span className="inline-flex items-center gap-1 bg-slate-800 border border-yellow-500/50 text-yellow-400 text-xs px-2 py-1 rounded capitalize">
                  {imageType}
                  <button
                    onClick={clearImageType}
                    className="hover:text-yellow-300"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Scrollable Filter Sections */}
        <div className="flex-1 overflow-y-auto">
          {/* Date Range Section */}
          <div className="p-6 border-b border-slate-700">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              DATE RANGE
            </h3>
            
            {/* Preset Options */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPresetDateRange(7)}
                className="bg-slate-800 border-slate-600 hover:bg-slate-700 hover:border-yellow-500 text-white text-xs"
              >
                Last 7 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPresetDateRange(30)}
                className="bg-slate-800 border-slate-600 hover:bg-slate-700 hover:border-yellow-500 text-white text-xs"
              >
                Last 30 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPresetDateRange(90)}
                className="bg-slate-800 border-slate-600 hover:bg-slate-700 hover:border-yellow-500 text-white text-xs"
              >
                Last 90 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPresetDateRange(365)}
                className="bg-slate-800 border-slate-600 hover:bg-slate-700 hover:border-yellow-500 text-white text-xs"
              >
                Last year
              </Button>
            </div>

            {/* Date Pickers */}
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  Start Date
                </label>
                <DatePicker
                  selected={dateRange.startDate}
                  onChange={handleStartDateChange}
                  selectsStart
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                  maxDate={new Date()}
                  placeholderText="Select start date"
                  className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  calendarClassName="bg-slate-800 border-slate-600"
                  dateFormat="MMM d, yyyy"
                />
              </div>
              
              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  End Date
                </label>
                <DatePicker
                  selected={dateRange.endDate}
                  onChange={handleEndDateChange}
                  selectsEnd
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                  minDate={dateRange.startDate}
                  maxDate={new Date()}
                  placeholderText="Select end date"
                  className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  calendarClassName="bg-slate-800 border-slate-600"
                  dateFormat="MMM d, yyyy"
                  disabled={!dateRange.startDate}
                />
              </div>

              {(dateRange.startDate || dateRange.endDate) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearDateRange}
                  className="w-full text-slate-400 hover:text-white hover:bg-slate-800 text-xs"
                >
                  Clear Date Range
                </Button>
              )}
            </div>
          </div>

          {/* Resolution Section */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Maximize2 className="h-4 w-4" />
                RESOLUTION
              </h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-slate-400 hover:text-white">
                      <HelpCircle className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">
                      Spatial resolution determines the level of detail. VHR (&lt;1m) shows individual objects, while lower resolutions are better for large-area analysis.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="space-y-3">
              {resolutionOptions.map((option) => (
                <div key={option.value} className="flex items-start space-x-3">
                  <Checkbox
                    id={`resolution-${option.value}`}
                    checked={selectedResolutions.includes(option.value)}
                    onCheckedChange={() => toggleResolution(option.value)}
                    className="mt-0.5 border-slate-600 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={`resolution-${option.value}`}
                      className="text-sm text-slate-200 cursor-pointer hover:text-white"
                    >
                      {option.label}
                    </label>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {option.description}
                    </p>
                  </div>
                </div>
              ))}

              {selectedResolutions.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearResolutions}
                  className="w-full text-slate-400 hover:text-white hover:bg-slate-800 text-xs mt-2"
                >
                  Clear Resolution Filters
                </Button>
              )}
            </div>
          </div>

          {/* Cloud Coverage Section */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                CLOUD COVERAGE
              </h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-slate-400 hover:text-white">
                      <HelpCircle className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">
                      Filter imagery by maximum cloud coverage percentage. Lower values show clearer images with less cloud obstruction.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="space-y-4">
              {/* Percentage Display */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Maximum Coverage</span>
                <span className="text-lg font-semibold text-yellow-400">
                  {cloudCoverage}%
                </span>
              </div>

              {/* Slider */}
              <Slider
                value={[cloudCoverage]}
                onValueChange={handleCloudCoverageChange}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />

              {/* Preset Options */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPresetCloudCoverage(10)}
                  className="bg-slate-800 border-slate-600 hover:bg-slate-700 hover:border-yellow-500 text-white text-xs"
                >
                  0-10%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPresetCloudCoverage(20)}
                  className="bg-slate-800 border-slate-600 hover:bg-slate-700 hover:border-yellow-500 text-white text-xs"
                >
                  0-20%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPresetCloudCoverage(30)}
                  className="bg-slate-800 border-slate-600 hover:bg-slate-700 hover:border-yellow-500 text-white text-xs"
                >
                  0-30%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPresetCloudCoverage(50)}
                  className="bg-slate-800 border-slate-600 hover:bg-slate-700 hover:border-yellow-500 text-white text-xs"
                >
                  0-50%
                </Button>
              </div>
            </div>
          </div>

          {/* Provider Section */}
          {/* <div className="p-6 border-b border-slate-700">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              PROVIDER
            </h3>
            
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search providers..."
                  value={providerSearchQuery}
                  onChange={(e) => setProviderSearchQuery(e.target.value)}
                  className="pl-9 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredProviders.length > 0 ? (
                  filteredProviders.map((provider) => (
                    <div key={provider} className="flex items-center space-x-3">
                      <Checkbox
                        id={`provider-${provider}`}
                        checked={selectedProviders.includes(provider)}
                        onCheckedChange={() => toggleProvider(provider)}
                        className="border-slate-600 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                      />
                      <label
                        htmlFor={`provider-${provider}`}
                        className="text-sm text-slate-200 cursor-pointer hover:text-white flex-1"
                      >
                        {provider}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">
                    No providers found
                  </p>
                )}
              </div>

              {selectedProviders.length > 0 && (
                <div className="pt-2 border-t border-slate-700">
                  <p className="text-xs text-slate-400 mb-2">
                    {selectedProviders.length} provider{selectedProviders.length > 1 ? 's' : ''} selected
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearProviders}
                    className="w-full text-slate-400 hover:text-white hover:bg-slate-800 text-xs"
                  >
                    Clear Provider Filters
                  </Button>
                </div>
              )}
            </div>
          </div> */}

          {/* Bands Section */}
          <div className="p-6 border-b border-slate-700">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4" />
              BANDS
            </h3>
            
            <div className="space-y-3">
              {bandsOptions.map((band) => (
                <div key={band.value} className="flex items-start space-x-3">
                  <Checkbox
                    id={`band-${band.value}`}
                    checked={selectedBands.includes(band.value)}
                    onCheckedChange={() => toggleBand(band.value)}
                    className="mt-0.5 border-slate-600 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={`band-${band.value}`}
                      className="text-sm text-slate-200 cursor-pointer hover:text-white"
                    >
                      {band.label}
                    </label>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {band.description}
                    </p>
                  </div>
                </div>
              ))}

              {selectedBands.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearBands}
                  className="w-full text-slate-400 hover:text-white hover:bg-slate-800 text-xs mt-2"
                >
                  Clear Band Filters
                </Button>
              )}
            </div>
          </div>

          {/* Image Type Section */}
          <div className="p-6 border-b border-slate-700">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Image className="h-4 w-4" />
              IMAGE TYPE
            </h3>
            
            <div className="space-y-3">
              <RadioGroup value={imageType} onValueChange={setImageType}>
                {imageTypeOptions.map((option) => (
                  <div key={option.value} className="flex items-start space-x-3">
                    <RadioGroupItem
                      value={option.value}
                      id={`image-type-${option.value}`}
                      className="mt-0.5 border-slate-600 text-yellow-500"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={`image-type-${option.value}`}
                        className="text-sm text-slate-200 cursor-pointer hover:text-white"
                      >
                        {option.label}
                      </label>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {option.description}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>

              {imageType && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearImageType}
                  className="w-full text-slate-400 hover:text-white hover:bg-slate-800 text-xs mt-2"
                >
                  Clear Image Type
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
    </>
  );
}
