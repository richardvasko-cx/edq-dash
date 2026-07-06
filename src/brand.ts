// ── Brand palette ────────────────────────────────────────────────────────
// Source of truth for chart/data-panel colours, taken from the brand guidelines
// (Primary Colors + pre-approved combinations: orange / pink / purple families).
export const BRAND = {
  orange: '#FFA524',
  orangeDark: '#E9371F',
  orangeLight: '#FFD4BC',
  pink: '#FFA4FB',
  pinkDark: '#91186E',
  pinkLight: '#F8D3E8',
  purple: '#801ED7',
  purpleDark: '#300266',
  purpleLight: '#C9C4FF',
} as const;

// Categorical series palette — ordered for good adjacent contrast in multi-series
// charts (lines/bars).
export const CHART_SERIES = [
  BRAND.orange,
  BRAND.purple,
  BRAND.pink,
  BRAND.pinkDark,
  BRAND.purpleLight,
  BRAND.orangeDark,
  BRAND.purpleDark,
  BRAND.pinkLight,
] as const;

// ── Chart theming — matches the IP Warming Planner chart exactly ───────────
// Dark-purple chart surface with purple grid, brand-coloured bold ticks and a
// dark tooltip. Reuse these so every chart looks like the IP Warming one.
export const CHART_CARD = 'bg-[#300266] border border-[#542387]'; // panel surface
export const CHART_GRID = '#542387';                              // grid line colour
export const CHART_GRID_OPACITY = 0.5;
export const CHART_CURSOR = { fill: '#542387', opacity: 0.25 } as const;

// Category/X-axis ticks (light purple, bold) — same as IP Warming.
export const CHART_AXIS_TICK = {
  fill: '#C9C4FF',
  fontSize: 10,
  fontWeight: 700,
} as const;

// Dark tooltip card (matches ChartTooltip in the IP Warming tool).
export const CHART_TOOLTIP = {
  contentStyle: {
    background: '#1a0138',
    borderRadius: 12,
    border: '1px solid #801ED7',
    boxShadow: '0px 26px 80px rgba(0,0,0,0.35)',
    fontSize: 12,
    padding: '10px 12px',
  },
  labelStyle: { fontWeight: 800, color: '#FFFFFF', marginBottom: 4 },
  itemStyle: { fontWeight: 700, color: '#C9C4FF', padding: 0 },
} as const;

export const CHART_BAR_RADIUS: [number, number, number, number] = [3, 3, 0, 0];
export const CHART_LINE_WIDTH = 3;

// Semantic roles mapped onto the brand palette (no greens/blues in brand).
export const CHART_SEMANTIC = {
  primary: BRAND.purple,
  positive: BRAND.purple,
  negative: BRAND.orangeDark,
  warning: BRAND.orange,
  accent: BRAND.pink,
  high: BRAND.orangeDark,
  medium: BRAND.orange,
  low: BRAND.purpleLight,
} as const;
