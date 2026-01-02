import React, { useCallback, useRef, useState } from 'react';
import { Upload, Camera, X, SwitchCamera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PhotoUploadProps {
  onImageSelect: (imageData: string) => void;
  currentImage?: string;
  onClear?: () => void;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  onImageSelect,
  currentImage,
  onClear
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageSelect(result);
      toast.success('Photo loaded successfully');
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
    };
    reader.readAsDataURL(file);
  }, [onImageSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const startCamera = async (mode: 'user' | 'environment' = facingMode) => {
    try {
      // Stop existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      setIsCapturing(true);
      // Small delay to ensure video element is mounted
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error('Camera error:', error);
      setIsCapturing(false);
      toast.error('Unable to access camera. Please check permissions.');
    }
  };

  const toggleCamera = async () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    await startCamera(newMode);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.95);
      onImageSelect(imageData);
      stopCamera();
      toast.success('Photo captured!');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  if (isCapturing) {
    return (
      <div className="relative w-full aspect-[3/4] max-w-md mx-auto rounded-xl overflow-hidden bg-card">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Face guide overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 border-2 border-dashed border-guide-face rounded-[50%] opacity-60" />
          <div className="absolute top-[35%] left-0 right-0 h-px bg-guide-eyes opacity-60" />
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
          <Button
            variant="secondary"
            size="lg"
            onClick={stopCamera}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={toggleCamera}
            className="gap-2"
          >
            <SwitchCamera className="w-4 h-4" />
          </Button>
          <Button
            size="lg"
            onClick={capturePhoto}
            className="gap-2 btn-primary-glow"
          >
            <Camera className="w-4 h-4" />
            Capture
          </Button>
        </div>
      </div>
    );
  }

  if (currentImage) {
    return (
      <div className="relative w-full max-w-md mx-auto">
        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-card">
          <img
            src={currentImage}
            alt="Uploaded photo"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute top-3 right-3 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClear}
            className="gap-1.5 bg-background/80 backdrop-blur-sm"
          >
            <X className="w-3.5 h-3.5" />
            Remove
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`dropzone p-8 ${isDragging ? 'dropzone-active' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex flex-col items-center gap-6 py-8">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Upload className="w-8 h-8 text-primary" />
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            Upload your photo
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Drag and drop an image here, or use the buttons below
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Browse Files
          </Button>
          <Button
            onClick={() => startCamera()}
            className="gap-2 btn-primary-glow"
          >
            <Camera className="w-4 h-4" />
            Use Camera
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Supports JPG, PNG, WEBP • Max 10MB
        </p>
      </div>
    </div>
  );
};
