import { useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import { VegaEmbed, VegaThemeProvider, useVegaTheme, type VegaTheme } from "@ritchieking/react-vega";
import type { EmbedOptions } from "vega-embed";
import { resolveCssVariables } from "../resolveCssVariables";
import { PRESETS } from "../presets";
import { barSpec } from "../specs";
import { LINKS } from "../links";
import type { Scheme } from "../tokens";
import { useSystemDark } from "../useSystemDark";
import { SiteHeader, type Mode } from "../components/SiteHeader";
import { CodeBlock } from "../components/CodeBlock";
import { EXAMPLES, UNCHANGED, type Example } from "./examples";

const BRAND = PRESETS[0];
const SMALL_LABELS: VegaTheme = { config: { axis: { labelFontSize: 9 } } };

export function ComparePage() {
  const systemDark = useSystemDark();
  const [mode, setMode] = useState<Mode>("auto");
  const scheme: Scheme = mode === "auto" ? (systemDark ? "dark" : "light") : mode;
  const [theme, setTheme] = useState<VegaTheme | null>(null);

  // Publish the Brand tokens for this scheme, then resolve the theme against them.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.scheme = scheme;
    for (const [name, value] of Object.entries(BRAND.tokens[scheme])) root.style.setProperty(name, value);
    setTheme(resolveCssVariables(BRAND.theme) as VegaTheme);
  }, [scheme]);

  return (
    <>
      <SiteHeader page="compare" mode={mode} onMode={setMode} />
      <main id="top" className="page compare">
        <section className="intro">
          <p className="eyebrow">react-vega 8 and VegaThemeProvider</p>
          <h1>Before and after</h1>
          <p className="lede">
            How a shared theme reaches react-vega charts today, next to the same code with <code>VegaThemeProvider</code>. Every
            &ldquo;before&rdquo; is react-vega 8 as it ships.
          </p>
          <nav className="toc" aria-label="On this page">
            {EXAMPLES.map((example) => (
              <a key={example.id} href={`#${example.id}`}>
                {example.title}
              </a>
            ))}
            <a href="#unchanged">What stays the same</a>
          </nav>
        </section>

        {theme && (
          <VegaThemeProvider theme={theme} variant={scheme}>
            <div className="compare__list">
              {EXAMPLES.map((example) => (
                <ExampleSection key={example.id} example={example} scheme={scheme}>
                  {example.id === "override" && <OverrideLive />}
                </ExampleSection>
              ))}
            </div>
          </VegaThemeProvider>
        )}

        <section className="panel compare__section" id="unchanged" aria-labelledby="unchanged-h">
          <h2 id="unchanged-h">What stays the same</h2>
          <ul className="compare__bullets">
            {UNCHANGED.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>

        <footer className="footer">
          <span>
            Built with <code>@ritchieking/react-vega</code>, vega-embed 7, Vega 6 and Vega-Lite 6.
          </span>
          <span>
            <a href="../">Playground</a>
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
      </main>
    </>
  );
}

function ExampleSection({ example, scheme, children }: { example: Example; scheme: Scheme; children?: ReactNode }) {
  return (
    <section className="panel compare__section" id={example.id} aria-labelledby={`${example.id}-h`}>
      <h2 id={`${example.id}-h`}>{example.title}</h2>
      <p className="compare__intro">{example.intro}</p>
      <div className="pair">
        <div className="pair__col">
          <p className="pair__label" data-kind="before">
            Before: react-vega 8
          </p>
          <CodeBlock code={example.before} scheme={scheme} label={`${example.title}, before`} />
        </div>
        <div className="pair__col">
          <p className="pair__label" data-kind="after">
            After: VegaThemeProvider
          </p>
          <CodeBlock code={example.after} scheme={scheme} label={`${example.title}, after`} />
        </div>
      </div>
      {children}
    </section>
  );
}

/** The override example, rendered: a shallow spread next to a nested provider. */
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
          <span className="card__kicker">Before: spread</span>
          <h3>Axis colors fall back to Vega&rsquo;s defaults</h3>
        </figcaption>
        {/* No theme and inherit={false}: the chart gets exactly spreadOptions, as it would without any provider. */}
        <VegaThemeProvider inherit={false}>
          <VegaEmbed spec={barSpec} options={spreadOptions} className="chart__embed" aria-label="Bar chart configured with a spread" />
        </VegaThemeProvider>
      </figure>
      <figure className="card">
        <figcaption>
          <span className="card__kicker">After: nested provider</span>
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
