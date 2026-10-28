# VegaThemeProvider demo

A live demo of `VegaThemeProvider`, the theming layer added in the `theme-provider` branch of the
[react-vega fork](https://github.com/ritchieking/react-vega/tree/theme-provider).

## What it shows

- **Light / Dark / Auto** control driving the provider's `variant` (`"auto"` follows `prefers-color-scheme`). The page chrome switches too.
- **Theme editor** (CodeMirror 6) holding the provider's `theme` as JSON, including `variants.light` / `variants.dark`. JSON and shape errors show inline; the charts stay on the last valid theme. If Vega itself rejects a config (for example an unknown color scheme) the demo falls back to the last theme that rendered.
- **CSS-variable controls**: pickers and sliders for `--chart-accent`, `--chart-highlight`, `--chart-text`, `--chart-muted`, `--chart-grid`, `--chart-bg`, `--chart-font`, `--chart-font-size`, `--chart-line-width`, `--chart-bar-radius`.
- **Nested providers**: an inner provider layers a muted/highlight theme over the page theme, with a switch for `inherit`.
- **Gallery** under one provider: bar, multi-series line, scatter, area with an interval brush (overview + detail), a faceted chart, and a raw Vega donut. Specs contain no colors or fonts.
- **Presets**: Brand, High contrast, Print, each with light and dark treatments, plus **Copy theme JSON**.
- **Code panel**: the JSX for the current state, and the resolved config read from `useVegaTheme()` inside each provider.

## API in brief

```tsx
import { VegaEmbed, VegaThemeProvider, useVegaTheme } from "@ritchieking/react-vega";

<VegaThemeProvider theme={theme} variant="auto">   // theme: VegaTheme | array of themes (falsy skipped)
  <VegaEmbed spec={spec} />
  <VegaThemeProvider theme={inner} inherit={false}> // inherit defaults to true
    <VegaEmbed spec={other} />
  </VegaThemeProvider>
</VegaThemeProvider>
```

```ts
type VegaThemeLayer = { config?: Config; options?: Omit<EmbedOptions, "config"> };
type VegaTheme = VegaThemeLayer & { variants?: Record<string, VegaThemeLayer> };
useVegaTheme(): { config: Config; options: Omit<EmbedOptions, "config">; variant: string | undefined };
```

### Merge order

Lowest to highest priority:

1. Outer provider's themes (array order), then its active variant layer(s)
2. Each inner provider's themes, then its variant (unless `inherit={false}`, which ignores the parent's themes; the variant still flows down unless the inner provider sets one)
3. The chart's own `options` prop (`options.config` deep-merges into config)
4. The spec's own `config` (handled by vega-embed)

The active variant applies to the themes of every enclosing provider, so `<VegaThemeProvider variant="dark">` with no `theme` flips one section to the outer theme's dark variant.

Plain objects deep-merge; arrays and other values replace; `undefined` never overwrites. A theme or variant change re-embeds the charts.

## CSS variables in themes

Vega's canvas/SVG output cannot resolve `var()`, so `src/resolveCssVariables.ts` replaces `var(--name)` / `var(--name, fallback)` (including nested fallbacks) with computed values before the theme reaches the provider. A string that is exactly one numeric `var()` becomes a number, so `"fontSize": "var(--chart-font-size)"` works. The helper is dependency-free and self-contained. Tokens are published on `<html>`, so the page CSS and the charts read the same variables. Re-resolution is debounced (120 ms) while sliders move.

## Links

All external URLs live in `src/links.ts`.

- Fork branch: https://github.com/ritchieking/react-vega/tree/theme-provider
- Upstream PR: not opened yet. Set `LINKS.upstreamPr` in `src/links.ts`; until then the header shows "Upstream PR (pending)".

## Run locally

```sh
npm ci && npm run dev      # http://127.0.0.1:5173
npm test                   # Vitest (resolveCssVariables)
npm run build              # tsc + vite build into dist/
```

## Library installation

The library is currently vendored as a tarball: `"@ritchieking/react-vega": "file:vendor/ritchieking-react-vega-8.1.0-theme.0.tgz"`.
Once it is published to npm, replace it with `@ritchieking/react-vega@next` (`npm i @ritchieking/react-vega@next`) and delete `vendor/`.

## Deploy

`vite.config.ts` sets `base: "./"`, so `dist/` works from any path (a GitHub Pages project path or a folder on another site).
`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on pushes to `main` and on manual dispatch; enable Pages with source "GitHub Actions" in the repository settings.

## Data

`src/data/cars.json` and `penguins.json` are copied from [vega-datasets](https://github.com/vega/vega-datasets) (BSD-3-Clause). The weekly and daily series are synthetic and generated deterministically in `src/data.ts`. Nothing is fetched at runtime.

## Notes on the palettes

The Brand categorical palette follows a validated eight-hue palette (CVD and contrast checked per mode). High contrast was validated as a four-hue set. Print is grayscale by design, so it relies on the legend and lightness steps rather than hue.
