// Official passport photo specifications by country
// All dimensions in millimeters unless otherwise noted

export interface PhotoSpec {
  id: string;
  country: string;
  flag: string;
  width: number; // mm
  height: number; // mm
  widthInches: number;
  heightInches: number;
  headHeightMin: number; // mm - minimum head height
  headHeightMax: number; // mm - maximum head height
  eyeLineFromBottom: number; // percentage from bottom
  backgroundColor: string;
  dpi: number;
  notes: string[];
}

export interface SheetSize {
  id: string;
  name: string;
  width: number; // inches
  height: number; // inches
  widthMm: number;
  heightMm: number;
}

export const PHOTO_SPECS: PhotoSpec[] = [
  {
    id: 'us',
    country: 'United States',
    flag: '🇺🇸',
    width: 51,
    height: 51,
    widthInches: 2,
    heightInches: 2,
    headHeightMin: 25,
    headHeightMax: 35,
    eyeLineFromBottom: 56,
    backgroundColor: '#FFFFFF',
    dpi: 300,
    notes: [
      'Head must be between 1" and 1⅜" (25-35mm)',
      'Eyes between 1⅛" and 1⅜" from bottom',
      'White or off-white background',
      'Taken within last 6 months'
    ]
  },
  {
    id: 'uk',
    country: 'United Kingdom',
    flag: '🇬🇧',
    width: 35,
    height: 45,
    widthInches: 1.38,
    heightInches: 1.77,
    headHeightMin: 29,
    headHeightMax: 34,
    eyeLineFromBottom: 60,
    backgroundColor: '#FFFFFF',
    dpi: 300,
    notes: [
      'Head height 29-34mm',
      'Plain cream or light grey background',
      'No shadows on face or background',
      'Neutral expression, mouth closed'
    ]
  },
  {
    id: 'eu',
    country: 'European Union (Schengen)',
    flag: '🇪🇺',
    width: 35,
    height: 45,
    widthInches: 1.38,
    heightInches: 1.77,
    headHeightMin: 32,
    headHeightMax: 36,
    eyeLineFromBottom: 60,
    backgroundColor: '#FFFFFF',
    dpi: 300,
    notes: [
      'Face must cover 70-80% of photo',
      'Light grey or light blue background',
      'Neutral expression required',
      'ICAO compliant'
    ]
  },
  {
    id: 'india',
    country: 'India',
    flag: '🇮🇳',
    width: 35,
    height: 45,
    widthInches: 1.38,
    heightInches: 1.77,
    headHeightMin: 25,
    headHeightMax: 35,
    eyeLineFromBottom: 55,
    backgroundColor: '#FFFFFF',
    dpi: 300,
    notes: [
      'White background only',
      'Face should cover 50-60% of photo',
      'Both ears must be visible',
      'Taken within last 3 months'
    ]
  },
  {
    id: 'china',
    country: 'China',
    flag: '🇨🇳',
    width: 33,
    height: 48,
    widthInches: 1.3,
    heightInches: 1.89,
    headHeightMin: 28,
    headHeightMax: 33,
    eyeLineFromBottom: 55,
    backgroundColor: '#FFFFFF',
    dpi: 300,
    notes: [
      'White background required',
      'Head height 28-33mm',
      'Face centered in frame',
      'No glasses allowed'
    ]
  },
  {
    id: 'canada',
    country: 'Canada',
    flag: '🇨🇦',
    width: 50,
    height: 70,
    widthInches: 1.97,
    heightInches: 2.76,
    headHeightMin: 31,
    headHeightMax: 36,
    eyeLineFromBottom: 50,
    backgroundColor: '#FFFFFF',
    dpi: 300,
    notes: [
      'Face height 31-36mm',
      'White or light-colored background',
      'Neutral expression',
      'Taken within last 12 months'
    ]
  },
  {
    id: 'australia',
    country: 'Australia',
    flag: '🇦🇺',
    width: 35,
    height: 45,
    widthInches: 1.38,
    heightInches: 1.77,
    headHeightMin: 32,
    headHeightMax: 36,
    eyeLineFromBottom: 58,
    backgroundColor: '#FFFFFF',
    dpi: 300,
    notes: [
      'Head and shoulders only',
      'Plain light background',
      'Mouth closed, neutral expression',
      'No head coverings (except religious)'
    ]
  },
  {
    id: 'japan',
    country: 'Japan',
    flag: '🇯🇵',
    width: 35,
    height: 45,
    widthInches: 1.38,
    heightInches: 1.77,
    headHeightMin: 27,
    headHeightMax: 40,
    eyeLineFromBottom: 55,
    backgroundColor: '#FFFFFF',
    dpi: 300,
    notes: [
      'Plain white or light background',
      'Face clearly visible',
      'No hats or sunglasses',
      'Taken within last 6 months'
    ]
  },
  {
    id: 'custom-25x35',
    country: '25×35mm',
    flag: '📐',
    width: 25,
    height: 35,
    widthInches: 0.98,
    heightInches: 1.38,
    headHeightMin: 20,
    headHeightMax: 28,
    eyeLineFromBottom: 55,
    backgroundColor: '#FFFFFF',
    dpi: 300,
    notes: [
      'Custom 25×35mm size',
      'White background recommended',
      'Face centered in frame'
    ]
  },
  {
    id: 'custom-20x30',
    country: '20×30mm',
    flag: '📐',
    width: 20,
    height: 30,
    widthInches: 0.79,
    heightInches: 1.18,
    headHeightMin: 16,
    headHeightMax: 24,
    eyeLineFromBottom: 55,
    backgroundColor: '#FFFFFF',
    dpi: 300,
    notes: [
      'Custom 20×30mm size',
      'White background recommended',
      'Face centered in frame'
    ]
  },
  {
    id: 'custom-35x25',
    country: '35×25mm',
    flag: '📐',
    width: 35,
    height: 25,
    widthInches: 1.38,
    heightInches: 0.98,
    headHeightMin: 18,
    headHeightMax: 22,
    eyeLineFromBottom: 50,
    backgroundColor: '#FFFFFF',
    dpi: 300,
    notes: [
      'Custom 35×25mm (landscape)',
      'White background recommended',
      'Face centered in frame'
    ]
  },
  {
    id: 'custom-30x20',
    country: '30×20mm',
    flag: '📐',
    width: 30,
    height: 20,
    widthInches: 1.18,
    heightInches: 0.79,
    headHeightMin: 14,
    headHeightMax: 18,
    eyeLineFromBottom: 50,
    backgroundColor: '#FFFFFF',
    dpi: 300,
    notes: [
      'Custom 30×20mm (landscape)',
      'White background recommended',
      'Face centered in frame'
    ]
  }
];

export const SHEET_SIZES: SheetSize[] = [
  {
    id: '4x6',
    name: '4×6" (Standard Photo)',
    width: 4,
    height: 6,
    widthMm: 102,
    heightMm: 152
  },
  {
    id: '5x7',
    name: '5×7"',
    width: 5,
    height: 7,
    widthMm: 127,
    heightMm: 178
  },
  {
    id: 'a4',
    name: 'A4 (210×297mm)',
    width: 8.27,
    height: 11.69,
    widthMm: 210,
    heightMm: 297
  },
  {
    id: 'letter',
    name: 'US Letter (8.5×11")',
    width: 8.5,
    height: 11,
    widthMm: 216,
    heightMm: 279
  }
];

// Calculate how many photos fit on a sheet
export function calculateSheetLayout(
  photoSpec: PhotoSpec,
  sheetSize: SheetSize,
  marginMm: number = 5,
  gapMm: number = 2
): { cols: number; rows: number; total: number } {
  const availableWidth = sheetSize.widthMm - marginMm * 2;
  const availableHeight = sheetSize.heightMm - marginMm * 2;
  
  const cols = Math.floor((availableWidth + gapMm) / (photoSpec.width + gapMm));
  const rows = Math.floor((availableHeight + gapMm) / (photoSpec.height + gapMm));
  
  return {
    cols,
    rows,
    total: cols * rows
  };
}

// Convert mm to pixels at given DPI
export function mmToPixels(mm: number, dpi: number = 300): number {
  return Math.round((mm / 25.4) * dpi);
}

// Convert inches to pixels at given DPI
export function inchesToPixels(inches: number, dpi: number = 300): number {
  return Math.round(inches * dpi);
}
