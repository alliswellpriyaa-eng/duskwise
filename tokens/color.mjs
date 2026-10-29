// OKLCH color math used by the token generator and the contrast tests.

/** Convert OKLCH (L 0-1, C, H degrees) to linear sRGB, clamped to 0-1. */
export function oklchToLinearSrgb(L, C, H) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  const clamp = (v) => Math.min(1, Math.max(0, v));
  return [clamp(r), clamp(g), clamp(bl)];
}

/** WCAG relative luminance of an OKLCH color. */
export function luminance([L, C, H]) {
  const [r, g, b] = oklchToLinearSrgb(L, C, H);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two OKLCH colors. */
export function contrast(c1, c2) {
  const y1 = luminance(c1);
  const y2 = luminance(c2);
  const [hi, lo] = y1 > y2 ? [y1, y2] : [y2, y1];
  return (hi + 0.05) / (lo + 0.05);
}

/** Format an OKLCH triple as CSS. */
export function css([L, C, H]) {
  const r = (n, d) => Number(n.toFixed(d));
  return `oklch(${r(L, 3)} ${r(C, 3)} ${r(H, 1)})`;
}
