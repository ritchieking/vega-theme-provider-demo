/**
 * Content for the API reference page. The signatures match the published
 * type definitions in @ritchieking/react-vega (dist/react-vega.d.ts).
 */

export const INSTALL = `npm i @ritchieking/react-vega@next vega-embed vega-lite`;

export const IMPORTS = `import {
  VegaEmbed,
  VegaThemeProvider,
  useVegaTheme,
  type VegaTheme,
} from "@ritchieking/react-vega";`;

export const PROVIDER_SIGNATURE = `function VegaThemeProvider(props: VegaThemeProviderProps): JSX.Element;

type VegaThemeProviderProps = {
  /**
   * A theme, or an array of themes merged left to right. Falsy entries are
   * skipped. Omit it to only change the variant for part of the tree.
   */
  theme?: VegaThemeInput;
  /**
   * The variant to apply, e.g. "dark". It applies to the themes of this
   * provider and of every enclosing provider. "auto" resolves to "dark"
   * or "light" from prefers-color-scheme and follows changes. When
   * omitted, the parent provider's variant is used.
   */
  variant?: "auto" | (string & {});
  /**
   * Merge on top of the enclosing provider's themes. Defaults to true.
   * With false, the parent's themes are ignored, but its variant still
   * applies unless variant is set.
   */
  inherit?: boolean;
  children: React.ReactNode;
};`;

export const HOOK_SIGNATURE = `function useVegaTheme(): ResolvedVegaTheme;

type ResolvedVegaTheme = {
  config: Config;
  options: VegaThemeOptions;
  /** The active variant. "auto" has already been resolved to "dark" or "light". */
  variant: string | undefined;
};`;

export const TYPES = `import type { Config, EmbedOptions } from "vega-embed";

type VegaTheme = VegaThemeLayer & {
  /** Named variants, e.g. { dark: {...}, print: {...} }, layered on top of the base. */
  variants?: Record<string, VegaThemeLayer>;
};

type VegaThemeLayer = {
  /** Vega / Vega-Lite config to merge into every chart under this provider. */
  config?: Config;
  /** Other embed options (renderer, tooltip, loader, expressionFunctions, actions...). */
  options?: VegaThemeOptions;
};

/** A theme, or a list of themes merged left to right. Falsy entries are skipped. */
type VegaThemeInput = VegaTheme | ReadonlyArray<VegaTheme | null | undefined | false>;

/** Embed options a theme can carry. Config lives in its own config key. */
type VegaThemeOptions = Omit<EmbedOptions, "config">;`;

export type Row = { name: string; type: string; fallback?: string; description: string };

export const PROVIDER_PROPS: Row[] = [
  {
    name: "theme",
    type: "VegaThemeInput",
    fallback: "none",
    description: "A theme, or an array of themes merged left to right. Falsy entries are skipped.",
  },
  {
    name: "variant",
    type: '"auto" | string',
    fallback: "parent's",
    description:
      'The variant to apply to this provider’s themes and every enclosing provider’s. "auto" follows prefers-color-scheme.',
  },
  {
    name: "inherit",
    type: "boolean",
    fallback: "true",
    description: "Merge over the enclosing providers’ themes. With false, their themes are ignored but their variant still applies.",
  },
  { name: "children", type: "React.ReactNode", description: "The charts and anything else to theme." },
];

export const HOOK_FIELDS: Row[] = [
  { name: "config", type: "Config", description: "The config merged from every enclosing provider and its active variant." },
  { name: "options", type: "VegaThemeOptions", description: "The embed options merged the same way." },
  { name: "variant", type: "string | undefined", description: 'The active variant, with "auto" resolved to "dark" or "light".' },
];

export const MERGE_ORDER: string[] = [
  "Each provider’s themes in array order, then the active variant of each, outermost provider first. inherit={false} starts over at that provider.",
  "The chart’s own options. options.config is merged into the config, and other options replace the theme’s.",
  "The spec’s own config, which vega-embed applies last.",
];

export const MERGE_RULES: string[] = [
  "Plain objects are deep-merged. Arrays and all other values replace what came before.",
  "undefined never overwrites a defined value. loader and logger are replaced as a whole.",
  "Changing the theme or the variant re-embeds the charts under the provider. A deep-equal theme does not.",
  "Without a provider, <VegaEmbed> and useVegaEmbed behave exactly as in react-vega 8.",
];

export type Example = {
  id: string;
  title: string;
  intro: string;
  before: string;
  after: string;
};

export const EXAMPLES: Example[] = [
  {
    id: "every-chart",
    title: "Theme every chart",
    intro: "Set the config and embed options once. Every chart below the provider receives them.",
    before: `// Every chart imports the config and passes it.
import { brandConfig } from "./theme";

function RevenueChart() {
  return (
    <VegaEmbed
      spec={revenueSpec}
      options={{ config: brandConfig, actions: false }}
    />
  );
}`,
    after: `const brand: VegaTheme = {
  config: brandConfig,
  options: { actions: false },
};

<VegaThemeProvider theme={brand}>
  <App />
</VegaThemeProvider>;

function RevenueChart() {
  return <VegaEmbed spec={revenueSpec} />;
}`,
  },
  {
    id: "light-dark",
    title: "Light and dark",
    intro:
      'Variants are layers applied over the base, one at a time. A variant can carry its own config and options, or name a vega-themes theme, as here. variant="auto" follows the OS.',
    before: `// Every chart tracks the color scheme itself.
function RevenueChart() {
  const dark = useDarkMode(); // your own matchMedia hook
  return (
    <VegaEmbed
      spec={revenueSpec}
      options={{
        theme: dark ? "carbong100" : "carbonwhite",
        config: brandConfig,
      }}
    />
  );
}`,
    after: `const brand: VegaTheme = {
  config: brandConfig, // applied on top of either variant
  variants: {
    light: { options: { theme: "carbonwhite" } },
    dark: { options: { theme: "carbong100" } },
  },
};

<VegaThemeProvider theme={brand} variant="auto">
  <App />
</VegaThemeProvider>;`,
  },
  {
    id: "override",
    title: "Override part of a theme",
    intro:
      "A nested provider deep-merges over its parent. A spread copies only the top level, so overriding one nested setting replaces the whole object it sits in.",
    before: `// The spread replaces all of \`axis\`: the brand's
// labelColor and gridColor are lost.
<VegaEmbed
  spec={spec}
  options={{
    config: { ...brandConfig, axis: { labelFontSize: 9 } },
  }}
/>`,
    after: `// Only labelFontSize changes.
<VegaThemeProvider theme={{ config: { axis: { labelFontSize: 9 } } }}>
  <VegaEmbed spec={spec} />
</VegaThemeProvider>`,
  },
  {
    id: "read-theme",
    title: "Read the theme outside a chart",
    intro:
      "useVegaTheme returns what the providers above have merged, so the UI around a chart can match it. Themes named through options.theme are applied later by vega-embed, so their values are not in config.",
    before: `// The values have to be passed down to the UI
// around the chart, or kept in a context of your own.
function ChartCard({ dark, children }) {
  const config = dark ? darkConfig : brandConfig;
  return (
    <figure style={{ background: config.background }}>
      {children}
    </figure>
  );
}`,
    after: `function ChartCard({ children }) {
  const { config } = useVegaTheme();
  return (
    <figure style={{ background: config.background }}>
      {children}
    </figure>
  );
}`,
  },
];
