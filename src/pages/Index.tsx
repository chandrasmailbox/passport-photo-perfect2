import React, { useState } from 'react';
import { PhotoUpload } from '@/components/PhotoUpload';
import { CountrySelector } from '@/components/CountrySelector';
import { SheetSizeSelector } from '@/components/SheetSizeSelector';
import { PhotoEditor } from '@/components/PhotoEditor';
import { SheetGenerator } from '@/components/SheetGenerator';
import { SpecificationsPanel } from '@/components/SpecificationsPanel';
import { PHOTO_SPECS, SHEET_SIZES, PhotoSpec, SheetSize } from '@/data/photoSpecs';
import { Camera, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Step = 'upload' | 'edit' | 'export';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [croppedImage, setCroppedImage] = useState<string>('');
  const [selectedSpec, setSelectedSpec] = useState<PhotoSpec>(PHOTO_SPECS[0]);
  const [selectedSheet, setSelectedSheet] = useState<SheetSize>(SHEET_SIZES[0]);

  const handleImageSelect = (imageData: string) => {
    setUploadedImage(imageData);
    setCroppedImage('');
  };

  const handleClear = () => {
    setUploadedImage('');
    setCroppedImage('');
    setCurrentStep('upload');
  };

  const handleCropComplete = (cropped: string) => {
    setCroppedImage(cropped);
    setCurrentStep('export');
  };

  const handleStartEditing = () => {
    setCurrentStep('edit');
  };

  const handleBackToEdit = () => {
    setCurrentStep('edit');
  };

  const steps = [
    { id: 'upload', label: 'Upload', number: 1 },
    { id: 'edit', label: 'Edit', number: 2 },
    { id: 'export', label: 'Export', number: 3 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Camera className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">PassportSnap</h1>
                <p className="text-xs text-muted-foreground">Professional passport photos</p>
              </div>
            </div>

            {/* Step indicator */}
            <div className="hidden sm:flex items-center gap-2">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div 
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                      currentStep === step.id 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center ${
                      currentStep === step.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      {step.number}
                    </span>
                    <span className="text-sm font-medium">{step.label}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {currentStep === 'upload' && (
            <div className="space-y-8 animate-fade-in">
              {/* Hero Section */}
              {!uploadedImage && (
                <div className="text-center space-y-4 py-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>8 country standards supported</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                    Create Perfect Passport Photos
                  </h2>
                  <p className="text-muted-foreground max-w-lg mx-auto">
                    Capture, crop, and export passport-sized photos that meet official requirements. 
                    Print multiple photos on standard paper sizes.
                  </p>
                </div>
              )}

              {/* Country Selector */}
              <CountrySelector
                selectedCountry={selectedSpec.id}
                onSelect={setSelectedSpec}
              />

              {/* Upload Area */}
              <PhotoUpload
                onImageSelect={handleImageSelect}
                currentImage={uploadedImage}
                onClear={handleClear}
              />

              {/* Continue Button */}
              {uploadedImage && (
                <div className="flex justify-center">
                  <Button 
                    size="lg" 
                    onClick={handleStartEditing}
                    className="gap-2 btn-primary-glow"
                  >
                    Continue to Edit
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Specs Panel */}
              <div className="max-w-md mx-auto">
                <SpecificationsPanel photoSpec={selectedSpec} />
              </div>
            </div>
          )}

          {currentStep === 'edit' && uploadedImage && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  Position Your Photo
                </h2>
                <p className="text-muted-foreground">
                  Align your face with the guides for {selectedSpec.country} passport
                </p>
              </div>

              <PhotoEditor
                imageSrc={uploadedImage}
                photoSpec={selectedSpec}
                onCropComplete={handleCropComplete}
              />

              <div className="max-w-md mx-auto">
                <SpecificationsPanel photoSpec={selectedSpec} />
              </div>
            </div>
          )}

          {currentStep === 'export' && croppedImage && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  Export Your Photos
                </h2>
                <p className="text-muted-foreground">
                  Choose a sheet size and download print-ready photos
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Column - Settings */}
                <div className="space-y-6">
                  {/* Cropped Preview */}
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      Your Photo
                    </h3>
                    <div className="flex items-center gap-4">
                      <img
                        src={croppedImage}
                        alt="Cropped passport photo"
                        className="w-24 rounded-lg border border-border"
                        style={{ aspectRatio: `${selectedSpec.width}/${selectedSpec.height}` }}
                      />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          {selectedSpec.flag} {selectedSpec.country}
                        </p>
                        <p className="text-xs font-mono text-muted-foreground">
                          {selectedSpec.width}×{selectedSpec.height}mm
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleBackToEdit}
                          className="text-xs"
                        >
                          Edit again
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Sheet Size Selector */}
                  <SheetSizeSelector
                    selectedSheet={selectedSheet.id}
                    onSelect={setSelectedSheet}
                  />
                </div>

                {/* Right Column - Sheet Generator */}
                <div>
                  <SheetGenerator
                    croppedImage={croppedImage}
                    photoSpec={selectedSpec}
                    sheetSize={selectedSheet}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Passport photos are generated locally in your browser. No data is uploaded to any server.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
