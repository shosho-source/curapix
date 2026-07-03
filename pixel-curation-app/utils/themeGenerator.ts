// utils/themeGenerator.ts

export interface ThemePalette {
  primary: string;
  secondary: string;
  tertiary: string;
  surface: string;
  outline: string;
}

// Helper to convert RGB array to Hex
const rgbToHex = (r: number, g: number, b: number) => 
  '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');

// Helper to tint a color (mix with white/black to generate palette tiers)
const tintColor = (r: number, g: number, b: number, factor: number) => {
  return rgbToHex(
    Math.min(255, Math.max(0, Math.round(r + (255 - r) * factor))),
    Math.min(255, Math.max(0, Math.round(g + (255 - g) * factor))),
    Math.min(255, Math.max(0, Math.round(b + (255 - b) * factor)))
  );
};

// Native HTML5 Canvas Color Extraction (Zero Dependencies)
const getDominantColor = (imgEl: HTMLImageElement): [number, number, number] => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) return [128, 128, 128]; // Fallback gray if canvas fails

  canvas.width = imgEl.width || imgEl.naturalWidth;
  canvas.height = imgEl.height || imgEl.naturalHeight;
  context.drawImage(imgEl, 0, 0);

  try {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let r = 0, g = 0, b = 0, count = 0;

    // Sample every 40th pixel to save processing power while maintaining accuracy
    for (let i = 0; i < data.length; i += 40) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }

    return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
  } catch (e) {
    // Catch CORS canvas tainting issues just in case
    return [128, 128, 128]; 
  }
};

export const generateThemeFromAvatar = (imageUrl: string): Promise<ThemePalette> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // Cross-origin requirement for pulling Google profile pictures safely
    img.crossOrigin = 'Anonymous'; 
    img.src = imageUrl;

    img.onload = () => {
      try {
        const [r, g, b] = getDominantColor(img);

        // Generate the 5-tier Material You inspired palette
        const palette: ThemePalette = {
          primary: rgbToHex(r, g, b),
          secondary: tintColor(r, g, b, 0.4),  // Lighter accent
          tertiary: tintColor(r, g, b, -0.2),  // Darker accent
          surface: tintColor(r, g, b, 0.85),   // Soft pastel background
          outline: tintColor(r, g, b, 0.2),    // Crisp Material borders
        };

        resolve(palette);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image for color extraction'));
  });
};