/**
 * Theme sources are JSON that may contain "var(--x)" strings in places where
 * the Vega config types want numbers (fontSize, strokeWidth...). They are typed
 * loosely here and become a typed VegaTheme once resolveCssVariables has run.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RawTheme = { config?: Record<string, any>; options?: Record<string, any>; variants?: Record<string, RawTheme> };

import { FALLBACK_TOKENS, FONT_STACKS, type Scheme, type Tokens } from "./tokens";

export type Preset = {
  id: string;
  name: string;
  blurb: string;
  theme: RawTheme;
  /** Token values (CSS custom properties) for each page scheme. */
  tokens: Record<Scheme, Tokens>;
};

/**
 * Shared skeleton. Every color, the font, the font size, line width and bar
 * radius come from CSS variables, so the sliders and pickers drive them.
 * The categorical palette lives in `variants` because it is stepped separately
 * for light and dark surfaces.
 */
const fontSize = "var(--chart-font-size)";

const brand: RawTheme = {
  config: {
    background: "var(--chart-bg)",
    font: "var(--chart-font)",
    padding: { left: 6, right: 12, top: 8, bottom: 6 },
    view: { stroke: null },
    mark: { color: "var(--chart-accent)" },
    bar: { cornerRadiusEnd: "var(--chart-bar-radius)" },
    line: { strokeWidth: "var(--chart-line-width)", strokeCap: "round", strokeJoin: "round" },
    area: { opacity: 0.16, line: { strokeWidth: "var(--chart-line-width)" } },
    circle: { size: 64, opacity: 0.85, stroke: "var(--chart-bg)", strokeWidth: 1 },
    arc: { stroke: "var(--chart-bg)", strokeWidth: 2 },
    text: { color: "var(--chart-text)", fill: "var(--chart-text)", font: "var(--chart-font)", fontSize },
    axis: {
      labelColor: "var(--chart-muted)",
      labelFont: "var(--chart-font)",
      labelFontSize: fontSize,
      titleColor: "var(--chart-muted)",
      titleFont: "var(--chart-font)",
      titleFontSize: fontSize,
      titleFontWeight: 500,
      gridColor: "var(--chart-grid)",
      gridWidth: 1,
      domainColor: "var(--chart-grid)",
      tickColor: "var(--chart-grid)",
      labelPadding: 6,
    },
    axisX: { grid: false, domainColor: "var(--chart-muted)", tickColor: "var(--chart-muted)" },
    legend: {
      labelColor: "var(--chart-text)",
      labelFont: "var(--chart-font)",
      labelFontSize: fontSize,
      titleColor: "var(--chart-muted)",
      titleFont: "var(--chart-font)",
      titleFontSize: fontSize,
      titleFontWeight: 500,
      symbolType: "circle",
      symbolSize: 90,
      orient: "top",
      direction: "horizontal",
    },
    header: {
      labelColor: "var(--chart-text)",
      labelFontSize: fontSize,
      labelFontWeight: 600,
      titleColor: "var(--chart-muted)",
      titleFontSize: fontSize,
    },
    title: { color: "var(--chart-text)", font: "var(--chart-font)", fontSize, fontWeight: 600, anchor: "start" },
    range: { category: ["var(--chart-accent)", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#6250d6", "#e34948"] },
  },
  options: { renderer: "svg", actions: false },
  variants: {
    light: {
      config: { range: { category: ["var(--chart-accent)", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#6250d6", "#e34948"] } },
      options: { tooltip: { theme: "light" } },
    },
    dark: {
      config: { range: { category: ["var(--chart-accent)", "#d95926", "#199e70", "#c98500", "#d55181", "#008300", "#9085e9", "#e66767"] } },
      options: { tooltip: { theme: "dark" } },
    },
  },
};

const highContrast: RawTheme = {
  config: {
    ...brand.config,
    padding: { left: 6, right: 14, top: 10, bottom: 8 },
    area: { opacity: 0.28, line: { strokeWidth: "var(--chart-line-width)" } },
    circle: { size: 90, opacity: 1, stroke: "var(--chart-bg)", strokeWidth: 1.5 },
    axis: {
      ...brand.config!.axis,
      labelFontWeight: 600,
      titleFontWeight: 700,
      gridWidth: 1,
      gridDash: [1, 0],
      domainWidth: 2,
      domainColor: "var(--chart-text)",
      tickColor: "var(--chart-text)",
      tickWidth: 2,
    },
    axisX: { grid: false, domainColor: "var(--chart-text)", tickColor: "var(--chart-text)" },
    legend: { ...brand.config!.legend, labelFontWeight: 600, symbolSize: 140 },
    range: undefined,
  },
  options: { renderer: "svg", actions: false },
  variants: {
    light: {
      config: { range: { category: ["var(--chart-accent)", "#d45500", "#007a5e", "#9b1fb8"] } },
      options: { tooltip: { theme: "light" } },
    },
    dark: {
      config: { range: { category: ["var(--chart-accent)", "#e0691f", "#17a274", "#c168e0"] } },
      options: { tooltip: { theme: "dark" } },
    },
  },
};

const print: RawTheme = {
  config: {
    ...brand.config,
    background: "transparent",
    padding: { left: 2, right: 10, top: 6, bottom: 4 },
    area: { opacity: 0.12, line: { strokeWidth: "var(--chart-line-width)" } },
    circle: { size: 44, opacity: 0.8, stroke: "var(--chart-text)", strokeWidth: 0.5 },
    arc: { stroke: "var(--chart-bg)", strokeWidth: 1.5 },
    axis: {
      ...brand.config!.axis,
      gridDash: [1, 3],
      gridCap: "round",
      domain: false,
      tickSize: 0,
      titleFontWeight: 400,
      labelFontStyle: "normal",
    },
    axisX: { grid: false, domain: true, domainColor: "var(--chart-text)", tickSize: 4, tickColor: "var(--chart-text)" },
    title: { color: "var(--chart-text)", fontSize, fontWeight: 700, anchor: "start" },
    range: undefined,
  },
  options: { renderer: "svg", actions: false },
  variants: {
    light: {
      config: { range: { category: ["var(--chart-accent)", "#5e5e5e", "#8f8f8f", "#b8b8b8"] } },
      options: { tooltip: { theme: "light" } },
    },
    dark: {
      config: { range: { category: ["var(--chart-accent)", "#a3a3a3", "#7a7a7a", "#575757"] } },
      options: { tooltip: { theme: "dark" } },
    },
  },
};

const tokens = (light: Partial<Tokens>, dark: Partial<Tokens>): Record<Scheme, Tokens> => ({
  light: { ...FALLBACK_TOKENS.light, ...light },
  dark: { ...FALLBACK_TOKENS.dark, ...dark },
});

export const PRESETS: Preset[] = [
  {
    id: "brand",
    name: "Brand",
    blurb: "Soft surfaces, a validated eight-hue categorical palette, thin marks.",
    theme: brand,
    tokens: tokens({}, {}),
  },
  {
    id: "high-contrast",
    name: "High contrast",
    blurb: "Pure black and white, heavier strokes, larger type, saturated hues.",
    theme: highContrast,
    tokens: tokens(
      {
        "--chart-accent": "#1f4fd1",
        "--chart-highlight": "#d45500",
        "--chart-text": "#000000",
        "--chart-muted": "#1a1a1a",
        "--chart-grid": "#8a8a8a",
        "--chart-bg": "#ffffff",
        "--chart-font-size": "14",
        "--chart-line-width": "3.5",
        "--chart-bar-radius": "0",
      },
      {
        "--chart-accent": "#4b86ee",
        "--chart-highlight": "#e0691f",
        "--chart-text": "#ffffff",
        "--chart-muted": "#f2f2f2",
        "--chart-grid": "#8c8c8c",
        "--chart-bg": "#000000",
        "--chart-font-size": "14",
        "--chart-line-width": "3.5",
        "--chart-bar-radius": "0",
      },
    ),
  },
  {
    id: "print",
    name: "Print",
    blurb: "Serif type, grayscale ink, dotted rules, transparent chart background.",
    theme: print,
    tokens: tokens(
      {
        "--chart-accent": "#222222",
        "--chart-highlight": "#8f1d1d",
        "--chart-text": "#1c1b19",
        "--chart-muted": "#55524c",
        "--chart-grid": "#bdb9ae",
        "--chart-bg": "#fbf9f3",
        "--chart-font": FONT_STACKS.serif,
        "--chart-font-size": "12",
        "--chart-line-width": "1.5",
        "--chart-bar-radius": "0",
      },
      {
        "--chart-accent": "#e4e1d8",
        "--chart-highlight": "#e08a7a",
        "--chart-text": "#ecE9e0",
        "--chart-muted": "#b2aea3",
        "--chart-grid": "#4a4842",
        "--chart-bg": "#191816",
        "--chart-font": FONT_STACKS.serif,
        "--chart-font-size": "12",
        "--chart-line-width": "1.5",
        "--chart-bar-radius": "0",
      },
    ),
  },
];

/**
 * Inner "highlight" theme: mutes every mark and lets the `highlight` style stand
 * out. It deliberately leaves fonts, axes and surfaces to the page theme, so the
 * effect of `inherit` is easy to see.
 */
export const NESTED_THEME: RawTheme = {
  config: {
    padding: { left: 2, right: 8, top: 6, bottom: 4 },
    legend: { disable: true },
    line: { color: "var(--chart-muted)", strokeWidth: 1.75 },
    bar: { color: "var(--chart-muted)", fillOpacity: 0.4 },
    style: {
      highlight: { color: "var(--chart-highlight)", fill: "var(--chart-highlight)", fillOpacity: 1, opacity: 1 },
    },
  },
};
