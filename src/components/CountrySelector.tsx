import React from 'react';
import { PhotoSpec, PHOTO_SPECS } from '@/data/photoSpecs';
import { Check } from 'lucide-react';

interface CountrySelectorProps {
  selectedCountry: string;
  onSelect: (spec: PhotoSpec) => void;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  selectedCountry,
  onSelect
}) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Select Country Standard
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PHOTO_SPECS.map((spec) => (
          <button
            key={spec.id}
            onClick={() => onSelect(spec)}
            className={`country-card text-left ${
              selectedCountry === spec.id ? 'selected' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-2xl">{spec.flag}</span>
              {selectedCountry === spec.id && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground leading-tight">
                {spec.country}
              </p>
              <p className="text-xs font-mono text-muted-foreground">
                {spec.width}×{spec.height}mm
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
