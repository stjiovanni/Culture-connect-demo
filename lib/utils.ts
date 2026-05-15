/**
 * Calculates the relative luminance of a color.
 * Formula: 0.2126 * R + 0.7152 * G + 0.0722 * B
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  
  const a = [rgb.r, rgb.g, rgb.b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Returns the best contrast color (black or white) for a given background color.
 */
export function getContrastColor(hex: string): 'white' | 'black' {
  const luminance = getLuminance(hex);
  return luminance > 0.179 ? 'black' : 'white';
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Converts OKLCH to Hex (Simplified for this use case)
 * In a real app we'd use a library, but let's assume we might need to handle variables.
 */
export function getVariableColor(variableName: string): string {
  if (typeof window === 'undefined') return '#000000';
  const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
  if (value.startsWith('#')) return value;
  // If it's something else, we might need more complex parsing, 
  // but for now let's handle the basics.
  return value;
}
