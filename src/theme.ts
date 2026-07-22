const THEME_KEY = "notion-quota-theme-color";
const DEFAULT_THEME = "#7f9a86";

export function loadThemeColor(): string {
  const saved = localStorage.getItem(THEME_KEY);
  return isHexColor(saved) ? saved! : DEFAULT_THEME;
}

export function saveThemeColor(color: string): void {
  localStorage.setItem(THEME_KEY, color);
}

export function applyThemeColor(color: string): void {
  const root = document.documentElement;
  root.style.setProperty("--accent", color);
  root.style.setProperty("--accent-deep", shadeHex(color, -0.18));
  root.style.setProperty("--accent-soft", hexToRgba(color, 0.14));
  root.style.setProperty("--ring-track", shadeHex(color, 0.78));
}

function isHexColor(value: string | null): value is string {
  return Boolean(value && /^#[0-9a-fA-F]{6}$/.test(value));
}

function hexToRgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
}

/** amount > 0 lightens toward white, amount < 0 darkens toward black */
function shadeHex(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  if (amount >= 0) {
    return rgbToHex(
      r + (255 - r) * amount,
      g + (255 - g) * amount,
      b + (255 - b) * amount,
    );
  }
  const factor = 1 + amount;
  return rgbToHex(r * factor, g * factor, b * factor);
}

function hexToRgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
