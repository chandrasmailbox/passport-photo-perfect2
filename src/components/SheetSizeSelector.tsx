import React from 'react';
import { SheetSize, SHEET_SIZES } from '@/data/photoSpecs';
import { Check } from 'lucide-react';

interface SheetSizeSelectorProps {
  selectedSheet: string;
  onSelect: (sheet: SheetSize) => void;
}

export const SheetSizeSelector: React.FC<SheetSizeSelectorProps> = ({
  selectedSheet,
  onSelect
}) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Output Sheet Size
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {SHEET_SIZES.map((sheet) => (
          <button
            key={sheet.id}
            onClick={() => onSelect(sheet)}
            className={`country-card text-left ${
              selectedSheet === sheet.id ? 'selected' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {sheet.name}
                </p>
                <p className="text-xs font-mono text-muted-foreground mt-0.5">
                  {sheet.widthMm}×{sheet.heightMm}mm
                </p>
              </div>
              {selectedSheet === sheet.id && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
