import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TechTooltipProps {
  term: string;
  definition: string;
  className?: string;
}

export function TechTooltip({ term, definition, className = '' }: TechTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-1 cursor-help border-b border-dashed border-muted-foreground ${className}`}>
            {term}
            <HelpCircle className="h-3 w-3 text-muted-foreground" />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{definition}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Common technical terms with definitions
export const TECH_TERMS = {
  VHR: 'Very High Resolution - Satellite imagery with resolution better than 1 meter per pixel',
  NIR: 'Near-Infrared - Electromagnetic radiation with wavelengths between 700-1400 nanometers, useful for vegetation analysis',
  SAR: 'Synthetic Aperture Radar - Active remote sensing that can capture images day or night, through clouds',
  'Red-Edge': 'Spectral band between red and near-infrared (680-730nm), sensitive to chlorophyll content',
  SWIR: 'Short-Wave Infrared - Wavelengths between 1400-3000nm, useful for moisture detection and mineral identification',
  'Cloud Coverage': 'Percentage of the image obscured by clouds. Lower values indicate clearer imagery',
  AOI: 'Area of Interest - The geographic region you want to capture in satellite imagery',
  'Spectral Bands': 'Different wavelengths of light captured by the satellite sensor',
  'Revisit Time': 'How often a satellite passes over the same location on Earth',
  'Swath Width': 'The width of the area imaged by the satellite in a single pass',
  'Radiometric Resolution': 'The sensitivity of the sensor to detect differences in energy, measured in bits',
};
