export type LogicalPoint = { x: number; y: number };

export type ExhibitPalette = {
  paper: string;
  elev: string;
  ink: string;
  mute: string;
  rule: string;
  mark: string;
  clay: string;
  void: string;
  voidElev: string;
  dark: boolean;
};

export type CanvasSurface = {
  ctx: CanvasRenderingContext2D;
  cssWidth: number;
  cssHeight: number;
  dpr: number;
  scaleX: number;
  scaleY: number;
};

const readToken = (styles: CSSStyleDeclaration, name: string, fallback: string) =>
  styles.getPropertyValue(name).trim() || fallback;

export function readExhibitPalette(): ExhibitPalette {
  const styles = getComputedStyle(document.documentElement);
  return {
    paper: readToken(styles, "--paper", "#f1eee6"),
    elev: readToken(styles, "--elev", "#faf8f3"),
    ink: readToken(styles, "--ink", "#161615"),
    mute: readToken(styles, "--mute", "#6f6c64"),
    rule: readToken(styles, "--rule", "#d2cdc2"),
    mark: readToken(styles, "--mark", "#1c3d36"),
    clay: readToken(styles, "--clay", "#8f4e3a"),
    void: readToken(styles, "--void", "#121110"),
    voidElev: readToken(styles, "--void-elev", "#1a1917"),
    dark: document.documentElement.classList.contains("dark"),
  };
}

/**
 * Size a canvas to its CSS box while keeping all drawing in logical units.
 * Device-pixel ratio is deliberately capped to keep the layered exhibits
 * smooth on high-density mobile displays.
 */
export function prepareCanvas(
  canvas: HTMLCanvasElement,
  logicalWidth: number,
  logicalHeight: number,
): CanvasSurface | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const rect = canvas.getBoundingClientRect();
  const cssWidth = Math.max(1, rect.width || canvas.clientWidth || logicalWidth);
  const cssHeight = Math.max(1, rect.height || canvas.clientHeight || logicalHeight);
  const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
  const pixelWidth = Math.max(1, Math.round(cssWidth * dpr));
  const pixelHeight = Math.max(1, Math.round(cssHeight * dpr));

  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }

  const scaleX = cssWidth / logicalWidth;
  const scaleY = cssHeight / logicalHeight;
  ctx.setTransform(dpr * scaleX, 0, 0, dpr * scaleY, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  return { ctx, cssWidth, cssHeight, dpr, scaleX, scaleY };
}

export function pointerToLogical(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
  logicalWidth: number,
  logicalHeight: number,
): LogicalPoint {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / Math.max(1, rect.width)) * logicalWidth,
    y: ((clientY - rect.top) / Math.max(1, rect.height)) * logicalHeight,
  };
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function distance(a: LogicalPoint, b: LogicalPoint) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function normalizeAngle(angle: number) {
  let next = angle % (Math.PI * 2);
  if (next > Math.PI) next -= Math.PI * 2;
  if (next < -Math.PI) next += Math.PI * 2;
  return next;
}

export function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}
