import React, { useRef, useEffect, useState } from 'react';
import { PhotoSpec, SheetSize, calculateSheetLayout, mmToPixels } from '@/data/photoSpecs';
import { Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SheetGeneratorProps {
  croppedImage: string;
  photoSpec: PhotoSpec;
  sheetSize: SheetSize;
}

export const SheetGenerator: React.FC<SheetGeneratorProps> = ({
  croppedImage,
  photoSpec,
  sheetSize
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const layout = calculateSheetLayout(photoSpec, sheetSize);
  const marginMm = 5;
  const gapMm = 2;

  // Generate preview at lower resolution
  useEffect(() => {
    generateSheet(150).then(url => {
      if (url) setPreviewUrl(url);
    });
  }, [croppedImage, photoSpec, sheetSize]);

  const generateSheet = async (dpi: number = 300): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        
        // Calculate canvas dimensions
        const canvasWidth = mmToPixels(sheetSize.widthMm, dpi);
        const canvasHeight = mmToPixels(sheetSize.heightMm, dpi);
        
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        // White background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Calculate photo dimensions at this DPI
        const photoWidth = mmToPixels(photoSpec.width, dpi);
        const photoHeight = mmToPixels(photoSpec.height, dpi);
        const margin = mmToPixels(marginMm, dpi);
        const gap = mmToPixels(gapMm, dpi);

        // Draw photos in grid
        for (let row = 0; row < layout.rows; row++) {
          for (let col = 0; col < layout.cols; col++) {
            const x = margin + col * (photoWidth + gap);
            const y = margin + row * (photoHeight + gap);
            
            // Draw photo
            ctx.drawImage(img, x, y, photoWidth, photoHeight);
            
            // Optional: Add thin border for cutting guides
            ctx.strokeStyle = '#E0E0E0';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, photoWidth, photoHeight);
          }
        }

        // Add crop marks at corners
        ctx.strokeStyle = '#CCCCCC';
        ctx.lineWidth = 0.5;
        
        for (let row = 0; row < layout.rows; row++) {
          for (let col = 0; col < layout.cols; col++) {
            const x = margin + col * (photoWidth + gap);
            const y = margin + row * (photoHeight + gap);
            
            // Corner marks (small L shapes)
            const markLength = mmToPixels(3, dpi);
            
            // Top-left
            ctx.beginPath();
            ctx.moveTo(x - gap/2, y);
            ctx.lineTo(x - gap/2, y - markLength);
            ctx.moveTo(x, y - gap/2);
            ctx.lineTo(x - markLength, y - gap/2);
            ctx.stroke();
            
            // Top-right
            ctx.beginPath();
            ctx.moveTo(x + photoWidth + gap/2, y);
            ctx.lineTo(x + photoWidth + gap/2, y - markLength);
            ctx.moveTo(x + photoWidth, y - gap/2);
            ctx.lineTo(x + photoWidth + markLength, y - gap/2);
            ctx.stroke();
            
            // Bottom-left
            ctx.beginPath();
            ctx.moveTo(x - gap/2, y + photoHeight);
            ctx.lineTo(x - gap/2, y + photoHeight + markLength);
            ctx.moveTo(x, y + photoHeight + gap/2);
            ctx.lineTo(x - markLength, y + photoHeight + gap/2);
            ctx.stroke();
            
            // Bottom-right
            ctx.beginPath();
            ctx.moveTo(x + photoWidth + gap/2, y + photoHeight);
            ctx.lineTo(x + photoWidth + gap/2, y + photoHeight + markLength);
            ctx.moveTo(x + photoWidth, y + photoHeight + gap/2);
            ctx.lineTo(x + photoWidth + markLength, y + photoHeight + gap/2);
            ctx.stroke();
          }
        }

        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
      img.onerror = () => resolve(null);
      img.src = croppedImage;
    });
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const highResUrl = await generateSheet(300);
      if (!highResUrl) {
        toast.error('Failed to generate sheet');
        return;
      }

      const link = document.createElement('a');
      link.download = `passport-photos-${photoSpec.id}-${sheetSize.id}-${Date.now()}.jpg`;
      link.href = highResUrl;
      link.click();
      
      toast.success('Sheet downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download sheet');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = async () => {
    setIsGenerating(true);
    try {
      const highResUrl = await generateSheet(300);
      if (!highResUrl) {
        toast.error('Failed to generate sheet');
        return;
      }

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Print Passport Photos</title>
              <style>
                @page {
                  size: ${sheetSize.width}in ${sheetSize.height}in;
                  margin: 0;
                }
                body {
                  margin: 0;
                  padding: 0;
                }
                img {
                  width: 100%;
                  height: auto;
                }
              </style>
            </head>
            <body>
              <img src="${highResUrl}" onload="window.print(); window.close();" />
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } catch (error) {
      toast.error('Failed to print');
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate preview dimensions
  const maxPreviewWidth = 400;
  const scale = maxPreviewWidth / sheetSize.widthMm;
  const previewWidth = sheetSize.widthMm * scale;
  const previewHeight = sheetSize.heightMm * scale;

  return (
    <div className="space-y-6">
      {/* Sheet Info */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
        <div>
          <h3 className="font-medium text-foreground">{sheetSize.name}</h3>
          <p className="text-sm text-muted-foreground">
            {layout.cols}×{layout.rows} = <span className="text-primary font-mono">{layout.total} photos</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-mono text-muted-foreground">
            {photoSpec.width}×{photoSpec.height}mm each
          </p>
          <p className="text-sm font-mono text-muted-foreground">
            {photoSpec.dpi} DPI
          </p>
        </div>
      </div>

      {/* Preview */}
      <div className="flex justify-center">
        <div 
          className="sheet-preview"
          style={{ 
            width: previewWidth,
            height: previewHeight,
            padding: marginMm * scale
          }}
        >
          {previewUrl ? (
            <img 
              src={previewUrl} 
              alt="Sheet preview"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">Generating preview...</div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <Button 
          variant="secondary" 
          onClick={handlePrint}
          disabled={isGenerating}
          className="gap-2"
        >
          <Printer className="w-4 h-4" />
          Print
        </Button>
        <Button 
          onClick={handleDownload}
          disabled={isGenerating}
          className="gap-2 btn-primary-glow"
        >
          <Download className="w-4 h-4" />
          {isGenerating ? 'Generating...' : 'Download Sheet'}
        </Button>
      </div>

      {/* Tips */}
      <div className="p-4 rounded-xl bg-muted/30 border border-border">
        <h4 className="text-sm font-medium text-foreground mb-2">Printing Tips</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Use high-quality photo paper (glossy or matte)</li>
          <li>• Set printer to "Actual Size" or "100%" - don't scale</li>
          <li>• Select "Best" or "Photo" quality in printer settings</li>
          <li>• Cut along the guide lines for accurate sizing</li>
        </ul>
      </div>
    </div>
  );
};
