import React, { useRef, useState, useCallback, useEffect } from 'react';
import { PhotoSpec } from '@/data/photoSpecs';
import { ZoomIn, ZoomOut, Move, RotateCcw, Scan, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useFaceDetection } from '@/hooks/useFaceDetection';
import { toast } from 'sonner';

interface PhotoEditorProps {
  imageSrc: string;
  photoSpec: PhotoSpec;
  onCropComplete: (croppedImage: string) => void;
}

export const PhotoEditor: React.FC<PhotoEditorProps> = ({
  imageSrc,
  photoSpec,
  onCropComplete
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasAutoDetected, setHasAutoDetected] = useState(false);
  
  const { detectFace, isDetecting } = useFaceDetection();

  // Calculate aspect ratio for the crop area
  const aspectRatio = photoSpec.width / photoSpec.height;

  // Reset position and scale when image changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setImageLoaded(false);
    setHasAutoDetected(false);
  }, [imageSrc]);

  const autoPositionFace = useCallback(async () => {
    if (!imageRef.current || !containerRef.current) return;
    
    const img = imageRef.current;
    const result = await detectFace(img);
    
    if (result?.face) {
      const cropArea = containerRef.current.querySelector('.crop-area') as HTMLElement;
      if (!cropArea) return;
      
      const cropRect = cropArea.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      // Calculate where face center should be in the crop area
      // For passport photos, face should be centered horizontally
      // and positioned so eyes are at the eyeLine position
      const faceBox = result.face;
      const faceCenterX = faceBox.x + faceBox.width / 2;
      const eyeY = faceBox.y + faceBox.height * 0.35; // Eyes at ~35% of face height
      
      // Target eye position in crop area (from top)
      const targetEyeFromTop = (100 - photoSpec.eyeLineFromBottom) / 100;
      
      // Calculate the scale needed to fit head properly
      // Head height should be between min and max
      const targetHeadHeight = (photoSpec.headHeightMin + photoSpec.headHeightMax) / 2;
      const cropHeightMm = photoSpec.height;
      const headRatio = targetHeadHeight / cropHeightMm;
      
      // Scale so face height matches target head height ratio
      const currentFaceHeightRatio = faceBox.height / img.naturalHeight;
      const cropHeightPx = cropRect.height;
      const targetFaceHeightPx = cropHeightPx * headRatio;
      const displayedImageHeight = cropHeightPx * 1.5; // Base height from style
      const neededScale = (targetFaceHeightPx / (currentFaceHeightRatio * displayedImageHeight)) * 1.2;
      
      const newScale = Math.max(0.8, Math.min(2.5, neededScale));
      setScale(newScale);
      
      // Calculate position offset to center face
      const imgDisplayWidth = img.naturalWidth * (displayedImageHeight / img.naturalHeight) * newScale;
      const imgDisplayHeight = displayedImageHeight * newScale;
      
      // Face center position in displayed image coordinates
      const faceCenterXDisplay = (faceCenterX / img.naturalWidth) * imgDisplayWidth;
      const eyeYDisplay = (eyeY / img.naturalHeight) * imgDisplayHeight;
      
      // Target position: face center should align with crop center, eyes with eye line
      const cropCenterX = cropRect.width / 2;
      const targetEyeY = cropRect.height * targetEyeFromTop;
      
      const offsetX = cropCenterX - faceCenterXDisplay;
      const offsetY = targetEyeY - eyeYDisplay;
      
      setPosition({ x: offsetX, y: offsetY });
      toast.success('Face detected and positioned');
    } else {
      toast.error('No face detected. Please position manually.');
    }
  }, [detectFace, photoSpec]);

  const handleImageLoad = async () => {
    setImageLoaded(true);
    // Auto-detect face on first load
    if (!hasAutoDetected && imageRef.current) {
      setHasAutoDetected(true);
      // Small delay to ensure image is fully rendered
      setTimeout(() => {
        autoPositionFace();
      }, 100);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setScale(1.2);
    setPosition({ x: 0, y: 0 });
  };

  const generateCroppedImage = () => {
    if (!imageRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const img = imageRef.current;
    
    // Get the crop area dimensions
    const cropArea = container.querySelector('.crop-area') as HTMLElement;
    if (!cropArea) return;

    const cropRect = cropArea.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    // Calculate the portion of the original image that's in the crop area
    const scaleX = img.naturalWidth / imgRect.width;
    const scaleY = img.naturalHeight / imgRect.height;

    const cropX = (cropRect.left - imgRect.left) * scaleX;
    const cropY = (cropRect.top - imgRect.top) * scaleY;
    const cropWidth = cropRect.width * scaleX;
    const cropHeight = cropRect.height * scaleY;

    // Create canvas with the exact pixel dimensions needed
    const outputWidth = Math.round((photoSpec.width / 25.4) * photoSpec.dpi);
    const outputHeight = Math.round((photoSpec.height / 25.4) * photoSpec.dpi);

    const canvas = document.createElement('canvas');
    canvas.width = outputWidth;
    canvas.height = outputHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill with white background
    ctx.fillStyle = photoSpec.backgroundColor;
    ctx.fillRect(0, 0, outputWidth, outputHeight);

    // Draw the cropped portion
    ctx.drawImage(
      img,
      Math.max(0, cropX),
      Math.max(0, cropY),
      Math.min(cropWidth, img.naturalWidth - cropX),
      Math.min(cropHeight, img.naturalHeight - cropY),
      0,
      0,
      outputWidth,
      outputHeight
    );

    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.95);
    onCropComplete(croppedDataUrl);
  };

  // Calculate crop area dimensions
  const getCropAreaStyle = () => {
    const maxHeight = 320;
    const height = maxHeight;
    const width = height * aspectRatio;
    return { width, height };
  };

  const cropStyle = getCropAreaStyle();

  return (
    <div className="space-y-4">
      {/* Editor Container */}
      <div
        ref={containerRef}
        className="relative bg-card rounded-xl overflow-hidden mx-auto"
        style={{ 
          width: cropStyle.width + 60,
          height: cropStyle.height + 60
        }}
      >
        {/* Dark overlay outside crop area */}
        <div className="absolute inset-0 bg-background/80" />
        
        {/* Image */}
        <img
          ref={imageRef}
          src={imageSrc}
          alt="Photo to crop"
          onLoad={handleImageLoad}
          className={`absolute cursor-move transition-opacity duration-200 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${scale})`,
            maxWidth: 'none',
            height: cropStyle.height * 1.5,
            width: 'auto'
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          draggable={false}
        />

        {/* Crop area overlay */}
        <div 
          className="crop-area absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ 
            width: cropStyle.width, 
            height: cropStyle.height,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)'
          }}
        >
          {/* Border */}
          <div className="absolute inset-0 border-2 border-primary rounded-sm" />
          
          {/* Face oval guide */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 border-2 border-dashed border-guide-face rounded-[50%] opacity-60"
            style={{
              top: '8%',
              width: '55%',
              height: '65%'
            }}
          />

          {/* Eye line guide */}
          <div 
            className="absolute left-0 right-0 h-px opacity-60"
            style={{
              top: `${100 - photoSpec.eyeLineFromBottom}%`,
              background: 'hsl(var(--guide-eyes))'
            }}
          >
            <span className="absolute right-0 -top-4 text-[10px] font-mono text-guide-eyes">
              Eye line
            </span>
          </div>

          {/* Grid lines */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-guide-line opacity-30" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-guide-line opacity-30" />

          {/* Corner marks */}
          {[
            'top-0 left-0',
            'top-0 right-0',
            'bottom-0 left-0',
            'bottom-0 right-0'
          ].map((pos, i) => (
            <div key={i} className={`absolute ${pos} w-4 h-4`}>
              <div className={`absolute ${pos.includes('left') ? 'left-0' : 'right-0'} ${pos.includes('top') ? 'top-0' : 'bottom-0'} w-4 h-0.5 bg-primary`} />
              <div className={`absolute ${pos.includes('left') ? 'left-0' : 'right-0'} ${pos.includes('top') ? 'top-0' : 'bottom-0'} w-0.5 h-4 bg-primary`} />
            </div>
          ))}
        </div>

        {/* Dimension badge */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 measure-badge">
          {photoSpec.width}×{photoSpec.height}mm • {photoSpec.dpi} DPI
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4 max-w-md mx-auto">
        {/* Zoom slider */}
        <div className="flex items-center gap-3 px-2">
          <ZoomOut className="w-4 h-4 text-muted-foreground" />
          <Slider
            value={[scale]}
            onValueChange={([value]) => setScale(value)}
            min={0.5}
            max={3}
            step={0.1}
            className="flex-1"
          />
          <ZoomIn className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 justify-center flex-wrap">
          <Button 
            variant="outline" 
            onClick={autoPositionFace} 
            className="gap-2"
            disabled={isDetecting}
          >
            {isDetecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Scan className="w-4 h-4" />
            )}
            Auto-Detect Face
          </Button>
          <Button variant="secondary" onClick={handleReset} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button onClick={generateCroppedImage} className="gap-2 btn-primary-glow">
            <Move className="w-4 h-4" />
            Apply Crop
          </Button>
        </div>

        {/* Instructions */}
        <p className="text-xs text-center text-muted-foreground">
          Face auto-detected on upload • Click "Auto-Detect Face" to re-center • Drag to fine-tune
        </p>
      </div>
    </div>
  );
};
