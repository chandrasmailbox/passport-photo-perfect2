import React from 'react';
import { PhotoSpec } from '@/data/photoSpecs';
import { Info } from 'lucide-react';

interface SpecificationsPanelProps {
  photoSpec: PhotoSpec;
}

export const SpecificationsPanel: React.FC<SpecificationsPanelProps> = ({
  photoSpec
}) => {
  return (
    <div className="p-4 rounded-xl bg-card border border-border space-y-4">
      <div className="flex items-center gap-2">
        <Info className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium text-foreground">
          {photoSpec.flag} {photoSpec.country} Requirements
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Dimensions</p>
          <p className="font-mono text-foreground">
            {photoSpec.width}×{photoSpec.height}mm
          </p>
          <p className="font-mono text-muted-foreground text-xs">
            ({photoSpec.widthInches}"×{photoSpec.heightInches}")
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Resolution</p>
          <p className="font-mono text-foreground">{photoSpec.dpi} DPI</p>
        </div>
        <div>
          <p className="text-muted-foreground">Head Height</p>
          <p className="font-mono text-foreground">
            {photoSpec.headHeightMin}-{photoSpec.headHeightMax}mm
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Background</p>
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded border border-border"
              style={{ background: photoSpec.backgroundColor }}
            />
            <span className="text-foreground">White</span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">Official Requirements:</p>
        <ul className="space-y-1">
          {photoSpec.notes.map((note, index) => (
            <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              {note}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
