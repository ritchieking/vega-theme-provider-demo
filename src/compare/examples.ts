/** Before/after code for the comparison page. "Before" is react-vega 8 as it ships today. */

export type Example = {
  id: string;
  title: string;
  intro: string;
  before: string;
  after: string;
};

export const EXAMPLES: Example[] = [
  {
    id: "shared-config",
    title: "One brand config for every chart",
    intro:
      "Each <VegaEmbed> takes its own options, so a shared config has to be imported and passed at every call site. With a provider, it is set once and the charts stay plain.",
    before: `// theme.ts
export const brandConfig = {
  font: "Inter, sans-serif",
  axis: { labelColor: "#52514e", gridColor: "#dcdad4" },
  range: { category: ["#2a78d6", "#eb6834", "#1baf7a"] },
};

// RevenueChart.tsx
import { brandConfig } from "./theme";

export function RevenueChart() {
  return (
    <VegaEmbed
      spec={revenueSpec}
      options={{ config: brandConfig, actions: false }}
    />
  );
}

// SignupsChart.tsx, ChurnChart.tsx and every other chart
// repeat the same import and the same options.`,
    after: `// App.tsx
const brand = { config: brandConfig, options: { actions: false } };

<VegaThemeProvider theme={brand}>
  <Dashboard />
</VegaThemeProvider>

// RevenueChart.tsx
export function RevenueChart() {
  return <VegaEmbed spec={revenueSpec} />;
}`,
  },
  {
    id: "dark-mode",
    title: "Light and dark",
    intro:
      "Dark mode means tracking the color scheme and merging a dark config over the base in every chart. With a provider, light and dark are named variants of one theme.",
    before: `function useDarkMode() {
  const query = "(prefers-color-scheme: dark)";
  const [dark, setDark] = useState(() => matchMedia(query).matches);
  useEffect(() => {
    const mq = matchMedia(query);
    const onChange = () => setDark(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return dark;
}

export function RevenueChart() {
  const dark = useDarkMode();
  // Merged by hand, in every chart that should follow the OS.
  const config = dark ? deepMerge(brandConfig, darkConfig) : brandConfig;
  return <VegaEmbed spec={revenueSpec} options={{ config }} />;
}`,
    after: `const brand = {
  config: brandConfig,
  variants: {
    light: { config: { background: "#fcfcfb" } },
    dark: {
      config: {
        background: "#1a1a19",
        axis: { labelColor: "#b4b3aa", gridColor: "#3a3a37" },
      },
    },
  },
};

// Follows the OS setting and updates when it changes.
<VegaThemeProvider theme={brand} variant="auto">
  <Dashboard />
</VegaThemeProvider>

// Or drive it from your own toggle.
<VegaThemeProvider theme={brand} variant={isDark ? "dark" : "light"}>`,
  },
  {
    id: "override",
    title: "Override part of the theme",
    intro:
      "Spreading a config copies only the top level, so overriding one nested setting replaces the whole object it sits in. Here the smaller labels wipe out the brand's axis colors. A nested provider deep-merges instead.",
    before: `// Smaller axis labels for this chart. The spread replaces
// the whole \`axis\` object, so labelColor and gridColor
// from brandConfig are lost.
<VegaEmbed
  spec={cylindersSpec}
  options={{
    config: { ...brandConfig, axis: { labelFontSize: 9 } },
  }}
/>`,
    after: `// Merged over the page theme: only labelFontSize changes.
<VegaThemeProvider theme={{ config: { axis: { labelFontSize: 9 } } }}>
  <VegaEmbed spec={cylindersSpec} />
</VegaThemeProvider>`,
  },
  {
    id: "dark-section",
    title: "Flip one section to dark",
    intro:
      "A dark band on a light page needs a second config passed to each chart in it. A provider with only a variant re-applies every enclosing theme in that variant.",
    before: `const heroConfig = deepMerge(brandConfig, darkConfig);

<section className="hero">
  <VegaEmbed spec={kpiSpec} options={{ config: heroConfig }} />
  <VegaEmbed spec={trendSpec} options={{ config: heroConfig }} />
</section>`,
    after: `<VegaThemeProvider variant="dark">
  <section className="hero">
    <VegaEmbed spec={kpiSpec} />
    <VegaEmbed spec={trendSpec} />
  </section>
</VegaThemeProvider>`,
  },
  {
    id: "tokens",
    title: "Design tokens",
    intro:
      "Vega needs concrete values, so tokens are read and copied into Vega's config shape, and the result is passed to every chart. With a provider, the theme can name tokens directly, be resolved once at the top, and reach every chart from there.",
    before: `// Read each token and copy it into Vega's config by hand.
function buildVegaConfig() {
  const css = getComputedStyle(document.documentElement);
  const token = (name: string) => css.getPropertyValue(name).trim();
  return {
    background: token("--surface"),
    font: token("--font-sans"),
    axis: {
      labelColor: token("--text-muted"),
      gridColor: token("--border"),
    },
    range: {
      category: [
        token("--accent-1"),
        token("--accent-2"),
        token("--accent-3"),
      ],
    },
  };
}

// Call it again whenever the tokens change, and pass the
// result to every chart.
<VegaEmbed
  spec={revenueSpec}
  options={{ config: buildVegaConfig() }}
/>`,
    after: `const tokens = {
  config: {
    background: "var(--surface)",
    font: "var(--font-sans)",
    axis: {
      labelColor: "var(--text-muted)",
      gridColor: "var(--border)",
    },
    range: {
      category: [
        "var(--accent-1)",
        "var(--accent-2)",
        "var(--accent-3)",
      ],
    },
  },
};

// resolveCssVariables is a small helper in this demo, not part
// of the library: it swaps each var() for its current value.
const theme = useMemo(() => resolveCssVariables(tokens), [tokenVersion]);

<VegaThemeProvider theme={theme}>
  <Dashboard />
</VegaThemeProvider>`,
  },
];

export const UNCHANGED: string[] = [
  "A chart's own options still win: options.config is merged over the theme, and other options replace the theme's.",
  "A spec's own config wins over both.",
  "Without a provider, <VegaEmbed> and useVegaEmbed behave exactly as in react-vega 8.",
  "Changing the theme or the variant re-embeds the charts under it, the same as changing options on one chart.",
];
