import { useState, useCallback } from 'react';

interface FaceBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FaceDetectionResult {
  face: FaceBox | null;
  eyeLineY: number | null; // percentage from top
  chinY: number | null; // percentage from top
}

// Check if FaceDetector API is available
const isFaceDetectorSupported = typeof window !== 'undefined' && 'FaceDetector' in window;

export function useFaceDetection() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResult, setDetectionResult] = useState<FaceDetectionResult | null>(null);

  const detectFace = useCallback(async (imageElement: HTMLImageElement): Promise<FaceDetectionResult | null> => {
    setIsDetecting(true);
    
    try {
      let faceBox: FaceBox | null = null;

      if (isFaceDetectorSupported) {
        // Use native FaceDetector API
        // @ts-ignore - FaceDetector is not in TypeScript types yet
        const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
        const faces = await detector.detect(imageElement);
        
        if (faces.length > 0) {
          const face = faces[0].boundingBox;
          faceBox = {
            x: face.x,
            y: face.y,
            width: face.width,
            height: face.height
          };
        }
      } else {
        // Fallback: Use canvas-based simple detection heuristic
        // This is a simplified approach using skin-tone detection
        faceBox = await detectFaceWithCanvas(imageElement);
      }

      if (faceBox) {
        const imgWidth = imageElement.naturalWidth;
        const imgHeight = imageElement.naturalHeight;
        
        // Estimate eye line at ~35% from top of face bounding box
        const eyeLineY = ((faceBox.y + faceBox.height * 0.35) / imgHeight) * 100;
        // Estimate chin at bottom of face box
        const chinY = ((faceBox.y + faceBox.height) / imgHeight) * 100;

        const result: FaceDetectionResult = {
          face: faceBox,
          eyeLineY,
          chinY
        };
        
        setDetectionResult(result);
        setIsDetecting(false);
        return result;
      }

      setDetectionResult(null);
      setIsDetecting(false);
      return null;
    } catch (error) {
      console.error('Face detection error:', error);
      setIsDetecting(false);
      setDetectionResult(null);
      return null;
    }
  }, []);

  return { detectFace, isDetecting, detectionResult };
}

// Canvas-based fallback using skin tone detection
async function detectFaceWithCanvas(img: HTMLImageElement): Promise<FaceBox | null> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve(null);
      return;
    }

    // Use a smaller size for faster processing
    const maxSize = 300;
    const scale = Math.min(maxSize / img.naturalWidth, maxSize / img.naturalHeight);
    canvas.width = img.naturalWidth * scale;
    canvas.height = img.naturalHeight * scale;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Find skin-tone pixels
    const skinPixels: { x: number; y: number }[] = [];
    
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const i = (y * canvas.width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Simple skin tone detection (works for various skin tones)
        if (isSkinTone(r, g, b)) {
          skinPixels.push({ x, y });
        }
      }
    }

    if (skinPixels.length < 100) {
      resolve(null);
      return;
    }

    // Find bounding box of skin pixels
    let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;
    
    for (const pixel of skinPixels) {
      minX = Math.min(minX, pixel.x);
      maxX = Math.max(maxX, pixel.x);
      minY = Math.min(minY, pixel.y);
      maxY = Math.max(maxY, pixel.y);
    }

    // Focus on upper portion (likely head)
    const fullHeight = maxY - minY;
    const headHeight = fullHeight * 0.6; // Assume head is top 60%
    
    // Scale back to original image coordinates
    const faceBox: FaceBox = {
      x: minX / scale,
      y: minY / scale,
      width: (maxX - minX) / scale,
      height: headHeight / scale
    };

    // Validate reasonable face proportions
    const aspectRatio = faceBox.width / faceBox.height;
    if (aspectRatio < 0.5 || aspectRatio > 1.5) {
      // Likely not a face, adjust to center
      resolve(null);
      return;
    }

    resolve(faceBox);
  });
}

function isSkinTone(r: number, g: number, b: number): boolean {
  // YCbCr color space skin detection
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const cb = 128 - 0.169 * r - 0.331 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.419 * g - 0.081 * b;

  // Skin tone ranges in YCbCr
  return (
    y > 80 &&
    cb > 77 && cb < 127 &&
    cr > 133 && cr < 173
  );
}
