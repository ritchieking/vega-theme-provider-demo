import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { VegaThemeProvider, type ResolvedVegaTheme, type VegaTheme } from "@ritchieking/react-vega";
import { resolveCssVariables } from "./resolveCssVariables";
import { parseTheme } from "./validateTheme";
import { NESTED_THEME, PRESETS, type RawTheme } from "./presets";
import { SHARED_TOKENS, type Scheme, type TokenName, type Tokens } from "./tokens";
import { LINKS, hasUpstreamPr } from "./links";
import { ThemeStatusContext } from "./ThemeStatus";
import { Segmented } from "./components/Segmented";
import { TokenControls } from "./components/TokenControls";
import { ThemeEditor } from "./components/ThemeEditor";
import { Gallery } from "./components/Gallery";
import { NestedPanel } from "./components/NestedPanel";
import { ThemeProbe } from "./components/ThemeProbe";
import { CodePanel } from "./components/CodePanel";

type Mode = "light" | "dark" | "auto";
type Applied = { id: number; theme: VegaTheme; nested: VegaTheme; variant: Mode };

const DARK_QUERY = "(prefers-color-scheme: dark)";
const DEBOUNCE_MS = 120;
const pretty = (t: RawTheme) => JSON.stringify(t, null, 2);

function useSystemDark() {
  const [dark, setDark] = useState(() => window.matchMedia(DARK_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(DARK_QUERY);
    const on = () => setDark(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return dark;
}

export function App() {
  const systemDark = useSystemDark();
  const [mode, setMode] = useState<Mode>("auto");
  const scheme: Scheme = mode === "auto" ? (systemDark ? "dark" : "light") : mode;

  const [presetId, setPresetId] = useState(PRESETS[0].id);
  const preset = PRESETS.find((p) => p.id === presetId)!;
  const [text, setText] = useState(() => pretty(PRESETS[0].theme));
  const [overrides, setOverrides] = useState<Record<Scheme, Partial<Tokens>>>({ light: {}, dark: {} });
  const [inherit, setInherit] = useState(true);

  const parse = useMemo(() => parseTheme(text), [text]);
  const [validTheme, setValidTheme] = useState<RawTheme>(PRESETS[0].theme);
  useEffect(() => {
    if (parse.ok) setValidTheme(parse.theme);
  }, [parse]);

  const tokens: Tokens = useMemo(() => ({ ...preset.tokens[scheme], ...overrides[scheme] }), [preset, overrides, scheme]);
  const overridden = useMemo(() => new Set(Object.keys(overrides[scheme]) as TokenName[]), [overrides, scheme]);

  // Publish the tokens as CSS custom properties on <html>: the page CSS and the
  // resolved chart theme read the same values.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.scheme = scheme;
    for (const [k, v] of Object.entries(tokens)) root.style.setProperty(k, v);
  }, [scheme, tokens]);

  // Resolve var() references into concrete values for Vega. Slider drags are
  // debounced; structural changes (variant, theme text) apply immediately.
  const [applied, setApplied] = useState<Applied | null>(null);
  const idRef = useRef(0);
  const structRef = useRef<string | null>(null);
  const goodRef = useRef<Applied | null>(null);
  const failedRef = useRef(new Set<number>());
  const lastTheme = useRef<RawTheme | null>(null);
  const appliedRef = useRef<Applied | null>(null);
  appliedRef.current = applied;
  const [rejection, setRejection] = useState<string | null>(null);

  useEffect(() => {
    const struct = `${mode}|${scheme}|${presetId}`;
    const immediate = structRef.current !== struct || validTheme !== lastTheme.current;
    structRef.current = struct;
    lastTheme.current = validTheme;
    const run = () => {
      const next: Applied = { id: ++idRef.current, theme: resolveCssVariables(validTheme) as VegaTheme, nested: resolveCssVariables(NESTED_THEME) as VegaTheme, variant: mode };
      setApplied(next);
    };
    if (immediate) {
      run();
      return;
    }
    const t = window.setTimeout(run, DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [validTheme, tokens, mode, scheme, presetId]);

  useEffect(() => setRejection(null), [text]);

  const status = useMemo(
    () => ({
      id: applied?.id ?? 0,
      // Vega logs some errors after the embed promise resolves, so a theme is
      // only remembered as good if no chart has complained shortly afterwards.
      ok: (id: number) => {
        window.setTimeout(() => {
          if (appliedRef.current?.id === id && !failedRef.current.has(id)) goodRef.current = appliedRef.current;
        }, 400);
      },
      fail: (id: number, message: string) => {
        failedRef.current.add(id);
        if (appliedRef.current?.id !== id) return;
        const good = goodRef.current;
        if (good && good !== appliedRef.current) {
          setRejection((prev) => prev ?? message);
          setApplied(good);
        }
      },
    }),
    [applied?.id],
  );

  const [pageResolved, setPageResolved] = useState<ResolvedVegaTheme | null>(null);
  const [nestedResolved, setNestedResolved] = useState<ResolvedVegaTheme | null>(null);
  const onPage = useCallback((t: ResolvedVegaTheme) => setPageResolved(t), []);
  const onNested = useCallback((t: ResolvedVegaTheme) => setNestedResolved(t), []);

  const setToken = (name: TokenName, value: string) => {
    setOverrides((o) => {
      const targets: Scheme[] = SHARED_TOKENS.includes(name) ? ["light", "dark"] : [scheme];
      const next = { ...o };
      for (const s of targets) next[s] = { ...o[s], [name]: value };
      return next;
    });
  };

  const choosePreset = (id: string) => {
    const p = PRESETS.find((x) => x.id === id)!;
    setPresetId(id);
    setText(pretty(p.theme));
    setOverrides({ light: {}, dark: {} });
  };

  const dirty = text !== pretty(preset.theme);

  return (
    <>
      <header className="topbar">
        <div className="topbar__inner">
          <a className="brand" href="#top" aria-label="VegaThemeProvider demo">
            <span className="brand__mark" aria-hidden="true">
              <i /><i /><i />
            </span>
            <span>VegaThemeProvider</span>
          </a>
          <nav className="links" aria-label="Project links">
            <a href={LINKS.fork} target="_blank" rel="noreferrer">
              Fork branch
            </a>
            {hasUpstreamPr ? (
              <a href={LINKS.upstreamPr} target="_blank" rel="noreferrer">
                Upstream PR
              </a>
            ) : (
              <span className="links__pending" title="The upstream pull request has not been opened yet">
                Upstream PR (pending)
              </span>
            )}
          </nav>
          <Segmented
            className="topbar__mode"
            label="Color scheme"
            value={mode}
            onChange={setMode}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
              { value: "auto", label: "Auto" },
            ]}
          />
        </div>
      </header>

      <main id="top" className="page">
        <section className="intro">
          <p className="eyebrow">react-vega · theme-provider branch</p>
          <h1>One theme for every Vega chart in the tree.</h1>
          <p className="lede">
            <code>{"<VegaThemeProvider>"}</code> merges a Vega config and embed options into every <code>{"<VegaEmbed>"}</code> below it, with light and
            dark variants and nesting. Edit the theme, drag a token, flip the color scheme, and watch six charts follow. The specs set no colors or fonts.
          </p>
        </section>

        <div className="layout">
          <aside className="sidebar" aria-label="Theme controls">
            <section className="panel">
              <header className="panel__head panel__head--stack">
                <h2>Presets</h2>
              </header>
              <div className="presets" role="radiogroup" aria-label="Preset themes">
                {PRESETS.map((p) => (
                  <button key={p.id} type="button" role="radio" aria-checked={p.id === presetId} className="preset" onClick={() => choosePreset(p.id)}>
                    <strong>{p.name}</strong>
                    <span>{p.blurb}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="panel">
              <header className="panel__head panel__head--stack">
                <h2>Design tokens</h2>
                <p>CSS variables, shared by the page and the charts.</p>
              </header>
              <TokenControls tokens={tokens} overridden={overridden} onChange={setToken} onReset={() => setOverrides({ light: {}, dark: {} })} />
            </section>

            <section className="panel">
              <header className="panel__head panel__head--stack">
                <h2>Theme</h2>
                <p>
                  The <code>theme</code> prop, as JSON. Try adding to <code>variants.dark.config</code>.
                </p>
              </header>
              <ThemeEditor text={text} onChange={setText} parse={parse} rejection={rejection} scheme={scheme} dirty={dirty} />
            </section>
          </aside>

          <div className="content">
            {applied && (
              <ThemeStatusContext.Provider value={status}>
                <VegaThemeProvider theme={applied.theme} variant={applied.variant}>
                  <ThemeProbe onResolved={onPage} />
                  <Gallery />
                  <NestedPanel theme={applied.nested} inherit={inherit} onInherit={setInherit} onResolved={onNested} />
                </VegaThemeProvider>
              </ThemeStatusContext.Provider>
            )}
            <CodePanel scheme={scheme} mode={mode} inherit={inherit} page={pageResolved} nested={nestedResolved} />
          </div>
        </div>

        <footer className="footer">
          <span>
            Built with <code>@ritchieking/react-vega</code> (a react-vega v8 fork), vega-embed 7, Vega 6 and Vega-Lite 6. Sample data from vega-datasets.
          </span>
          <span>
            <a href={LINKS.fork} target="_blank" rel="noreferrer">
              Source branch
            </a>
            {" · "}
            <a href={LINKS.npm} target="_blank" rel="noreferrer">
              npm
            </a>
            {" · "}
            <a href={LINKS.upstream} target="_blank" rel="noreferrer">
              Upstream react-vega
            </a>
          </span>
        </footer>
      </main>
    </>
  );
}
