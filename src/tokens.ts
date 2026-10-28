/** Design tokens: CSS custom properties shared by the page chrome and the chart theme. */

export type Scheme = "light" | "dark";

export const FONT_STACKS = {
  sans: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  serif: "Georgia, 'Iowan Old Style', 'Times New Roman', serif",
  mono: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
  humanist: "'Gill Sans', 'Trebuchet MS', Calibri, 'Segoe UI', sans-serif",
} as const;

export type TokenName =
  | "--chart-accent"
  | "--chart-highlight"
  | "--chart-text"
  | "--chart-muted"
  | "--chart-grid"
  | "--chart-bg"
  | "--chart-font"
  | "--chart-font-size"
  | "--chart-line-width"
  | "--chart-bar-radius";

export type Tokens = Record<TokenName, string>;

type ControlBase = { name: TokenName; label: string; hint: string };
export type TokenControl =
  | (ControlBase & { kind: "color" })
  | (ControlBase & { kind: "range"; min: number; max: number; step: number; unit?: string })
  | (ControlBase & { kind: "font" });

export const TOKEN_GROUPS: { title: string; controls: TokenControl[] }[] = [
  {
    title: "Color",
    controls: [
      { name: "--chart-accent", label: "Accent", hint: "First series, default mark color, page links", kind: "color" },
      { name: "--chart-highlight", label: "Highlight", hint: "Emphasis color in the nested panel", kind: "color" },
      { name: "--chart-text", label: "Text", hint: "Titles, legends, headings", kind: "color" },
      { name: "--chart-muted", label: "Muted text", hint: "Axis labels, captions", kind: "color" },
      { name: "--chart-grid", label: "Grid", hint: "Gridlines, borders", kind: "color" },
      { name: "--chart-bg", label: "Background", hint: "Chart and card surface", kind: "color" },
    ],
  },
  {
    title: "Type",
    controls: [
      { name: "--chart-font", label: "Typeface", hint: "Chart and card font", kind: "font" },
      { name: "--chart-font-size", label: "Font size", hint: "Axis, legend and label size", kind: "range", min: 9, max: 18, step: 1, unit: "px" },
    ],
  },
  {
    title: "Marks",
    controls: [
      { name: "--chart-line-width", label: "Line width", hint: "Stroke of line and area marks", kind: "range", min: 1, max: 6, step: 0.5, unit: "px" },
      { name: "--chart-bar-radius", label: "Bar radius", hint: "Rounded data end of bars", kind: "range", min: 0, max: 12, step: 1, unit: "px" },
    ],
  },
];

/** Non-color tokens are shared by both schemes; editing one writes both. */
export const SHARED_TOKENS: TokenName[] = ["--chart-font", "--chart-font-size", "--chart-line-width", "--chart-bar-radius"];

export const FALLBACK_TOKENS: Record<Scheme, Tokens> = {
  light: {
    "--chart-accent": "#2a78d6",
    "--chart-highlight": "#eb6834",
    "--chart-text": "#0b0b0b",
    "--chart-muted": "#52514e",
    "--chart-grid": "#dcdad4",
    "--chart-bg": "#fcfcfb",
    "--chart-font": FONT_STACKS.sans,
    "--chart-font-size": "12",
    "--chart-line-width": "2",
    "--chart-bar-radius": "4",
  },
  dark: {
    "--chart-accent": "#3987e5",
    "--chart-highlight": "#e8794a",
    "--chart-text": "#f0efec",
    "--chart-muted": "#b4b3aa",
    "--chart-grid": "#3a3a37",
    "--chart-bg": "#1a1a19",
    "--chart-font": FONT_STACKS.sans,
    "--chart-font-size": "12",
    "--chart-line-width": "2",
    "--chart-bar-radius": "4",
  },
};
