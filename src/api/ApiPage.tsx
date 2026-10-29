import { useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import { VegaEmbed, VegaThemeProvider, useVegaTheme, type VegaTheme } from "@ritchieking/react-vega";
import type { EmbedOptions } from "vega-embed";
import { carbong100, carbonwhite } from "vega-themes";
import { resolveCssVariables } from "../resolveCssVariables";
import { PRESETS } from "../presets";
import { barSpec, scatterSpec } from "../specs";
import { LINKS } from "../links";
import type { Scheme } from "../tokens";
import { useSystemDark } from "../useSystemDark";
import { SiteHeader, type Mode } from "../components/SiteHeader";
import { CodeBlock } from "../components/CodeBlock";
import {
  EXAMPLES,
  HOOK_FIELDS,
  HOOK_SIGNATURE,
  IMPORTS,
  INSTALL,
  MERGE_ORDER,
  MERGE_RULES,
  PROVIDER_PROPS,
  PROVIDER_SIGNATURE,
  TYPES,
  type Example,
  type Row,
} from "./content";

const BRAND = PRESETS[0];

const SMALL_LABELS: VegaTheme = { config: { axis: { labelFontSize: 9 } } };

/** The light/dark example's theme. The tweak on top of both named themes: no gridlines. */
const CARBON: VegaTheme = {
  config: { axis: { grid: false } },
  options: { actions: false },
  variants: {
    light: { options: { theme: "carbonwhite" } },
    dark: { options: { theme: "carbong100" } },
  },
};

const CARBON_SURFACES = {
  light: { background: String(carbonwhite.background), color: "#161616" },
  dark: { background: String(carbong100.background), color: "#f4f4f4" },
} as const;

const REFERENCE = [
  { id: "provider", label: "VegaThemeProvider" },
  { id: "hook", label: "useVegaTheme" },
  { id: "types", label: "Types" },
  { id: "merge", label: "Merge order" },
];

export function ApiPage() {
  const systemDark = useSystemDark();
  const [mode, setMode] = useState<Mode>("auto");
  const scheme: Scheme = mode === "auto" ? (systemDark ? "dark" : "light") : mode;
  const [theme, setTheme] = useState<VegaTheme | null>(null);

  // Publish the Brand tokens for this scheme, then resolve the page theme against them.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.scheme = scheme;
    for (const [name, value] of Object.entries(BRAND.tokens[scheme])) root.style.setProperty(name, value);
    setTheme(resolveCssVariables(BRAND.theme) as VegaTheme);
  }, [scheme]);

  return (
    <>
      <SiteHeader page="api" mode={mode} onMode={setMode} />
      <main id="top" className="page docs">
        <section className="intro">
          <p className="eyebrow">react-vega · theme-provider</p>
          <h1>VegaThemeProvider</h1>
          <p className="lede">
            Sets a Vega and Vega-Lite theme for a React tree. Every <code>&lt;VegaEmbed&gt;</code> and <code>useVegaEmbed</code> below
            the provider receives its config and embed options, with named variants such as light and dark, and nested overrides.
          </p>
          <div className="docs__install">
            <CodeBlock code={INSTALL} scheme={scheme} label="Install" language="shell" />
            <CodeBlock code={IMPORTS} scheme={scheme} label="Imports" />
          </div>
        </section>

        <div className="docs__layout">
          <nav className="docs__toc" aria-label="On this page">
            <p>Reference</p>
            {REFERENCE.map((item) => (
              <a key={item.id} href={`#${item.id}`}>
                {item.label}
              </a>
            ))}
            <p>Examples</p>
            {EXAMPLES.map((example) => (
              <a key={example.id} href={`#${example.id}`}>
                {example.title}
              </a>
            ))}
          </nav>

          <div className="docs__main">
            <section className="panel docs__section" id="provider" aria-labelledby="provider-h">
              <h2 id="provider-h">
                <code>&lt;VegaThemeProvider&gt;</code>
              </h2>
              <p className="docs__text">
                Applies a theme to every <code>&lt;VegaEmbed&gt;</code> and <code>useVegaEmbed</code> below it. Providers can be nested:
                an inner provider merges on top of the outer one unless <code>inherit</code> is <code>false</code>.
              </p>
              <CodeBlock code={PROVIDER_SIGNATURE} scheme={scheme} label="VegaThemeProvider signature" />
              <h3>Props</h3>
              <ApiTable rows={PROVIDER_PROPS} nameLabel="Prop" showDefault />
            </section>

            <section className="panel docs__section" id="hook" aria-labelledby="hook-h">
              <h2 id="hook-h">
                <code>useVegaTheme()</code>
              </h2>
              <p className="docs__text">
                Returns the theme in effect at this point in the tree. Outside a provider it returns{" "}
                <code>{"{ config: {}, options: {}, variant: undefined }"}</code>.
              </p>
              <CodeBlock code={HOOK_SIGNATURE} scheme={scheme} label="useVegaTheme signature" />
              <h3>Returns</h3>
              <ApiTable rows={HOOK_FIELDS} nameLabel="Field" />
            </section>

            <section className="panel docs__section" id="types" aria-labelledby="types-h">
              <h2 id="types-h">Types</h2>
              <p className="docs__text">
                <code>Config</code> and <code>EmbedOptions</code> come from vega-embed. <code>Config</code> accepts both Vega and Vega-Lite
                config.
              </p>
              <CodeBlock code={TYPES} scheme={scheme} label="Theme types" />
            </section>

            <section className="panel docs__section" id="merge" aria-labelledby="merge-h">
              <h2 id="merge-h">Merge order</h2>
              <p className="docs__text">From lowest to highest priority:</p>
              <ol className="docs__list">
                {MERGE_ORDER.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
              <ul className="docs__list">
                {MERGE_RULES.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>

            <header className="docs__group">
              <h2>Examples</h2>
              <p>Each example shows react-vega 8 as it ships next to the same thing with the provider.</p>
            </header>

            {theme && (
              <VegaThemeProvider theme={theme} variant={scheme}>
                <div className="docs__examples">
                  {EXAMPLES.map((example) => (
                    <ExampleSection key={example.id} example={example} scheme={scheme}>
                      {example.id === "light-dark" && <LightDarkLive />}
                      {example.id === "override" && <OverrideLive />}
                    </ExampleSection>
                  ))}
                </div>
              </VegaThemeProvider>
            )}

            <footer className="footer">
              <span>
                Built with <code>@ritchieking/react-vega</code>, vega-embed 7, Vega 6 and Vega-Lite 6.
              </span>
              <span>
                <a href="playground/">Playground</a>
                {" · "}
                <a href={LINKS.fork} target="_blank" rel="noreferrer">
                  Source branch
                </a>
                {" · "}
                <a href={LINKS.npm} target="_blank" rel="noreferrer">
                  npm
                </a>
              </span>
            </footer>
          </div>
        </div>
      </main>
    </>
  );
}

function ApiTable({ rows, nameLabel, showDefault }: { rows: Row[]; nameLabel: string; showDefault?: boolean }) {
  return (
    <div className="api-table__wrap">
      <table className="api-table">
        <thead>
          <tr>
            <th scope="col">{nameLabel}</th>
            <th scope="col">Type</th>
            {showDefault && <th scope="col">Default</th>}
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <th scope="row">
                <code>{row.name}</code>
              </th>
              <td data-label="Type">
                <code>{row.type}</code>
              </td>
              {showDefault && <td data-label="Default">{row.fallback === undefined ? "" : <code>{row.fallback}</code>}</td>}
              <td data-label="Description">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExampleSection({ example, scheme, children }: { example: Example; scheme: Scheme; children?: ReactNode }) {
  return (
    <section className="panel docs__section" id={example.id} aria-labelledby={`${example.id}-h`}>
      <h2 id={`${example.id}-h`}>{example.title}</h2>
      <p className="docs__text">{example.intro}</p>
      <div className="pair">
        <div className="pair__col">
          <p className="pair__label" data-kind="before">
            react-vega 8
          </p>
          <CodeBlock code={example.before} scheme={scheme} label={`${example.title}: react-vega 8`} />
        </div>
        <div className="pair__col">
          <p className="pair__label" data-kind="after">
            With VegaThemeProvider
          </p>
          <CodeBlock code={example.after} scheme={scheme} label={`${example.title}: with VegaThemeProvider`} />
        </div>
      </div>
      {children}
    </section>
  );
}

/** The light/dark example rendered: one theme object, both variants side by side. */
function LightDarkLive() {
  return (
    <div className="pair pair--live">
      {(["light", "dark"] as const).map((variant) => (
        <figure key={variant} className="card card--themed" style={CARBON_SURFACES[variant]}>
          <figcaption>
            <span className="card__kicker">variant=&quot;{variant}&quot;</span>
            <h3>{variant === "light" ? "carbonwhite" : "carbong100"}</h3>
          </figcaption>
          {/* inherit={false}: only the example's theme, without this page's own theme. */}
          <VegaThemeProvider theme={CARBON} variant={variant} inherit={false}>
            <VegaEmbed spec={scatterSpec} className="chart__embed" aria-label={`Scatter plot, ${variant} variant`} />
          </VegaThemeProvider>
        </figure>
      ))}
      <p className="card__note pair__note">
        The same theme object rendered in both variants. Each named theme brings its own background, text colors and palette. The
        example&rsquo;s own config, <code>{"axis: { grid: false }"}</code> here, applies on top of both.
      </p>
    </div>
  );
}

/** The override example rendered: a shallow spread next to a nested provider. */
function OverrideLive() {
  const page = useVegaTheme();
  const spreadOptions = useMemo<EmbedOptions>(
    () => ({ ...page.options, config: { ...page.config, axis: { labelFontSize: 9 } } }),
    [page],
  );
  return (
    <div className="pair pair--live">
      <figure className="card">
        <figcaption>
          <span className="card__kicker">Spread</span>
          <h3>Axis colors fall back to Vega&rsquo;s defaults</h3>
        </figcaption>
        {/* No theme and inherit={false}: the chart gets exactly spreadOptions, as it would without any provider. */}
        <VegaThemeProvider inherit={false}>
          <VegaEmbed spec={barSpec} options={spreadOptions} className="chart__embed" aria-label="Bar chart configured with a spread" />
        </VegaThemeProvider>
      </figure>
      <figure className="card">
        <figcaption>
          <span className="card__kicker">Nested provider</span>
          <h3>Only the label size changes</h3>
        </figcaption>
        <VegaThemeProvider theme={SMALL_LABELS}>
          <VegaEmbed spec={barSpec} className="chart__embed" aria-label="Bar chart under a nested provider" />
        </VegaThemeProvider>
      </figure>
      <p className="card__note pair__note">Easiest to see in dark mode, where Vega&rsquo;s default black labels disappear into the background.</p>
    </div>
  );
}
