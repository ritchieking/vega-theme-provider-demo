import { useMemo, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { javascript } from "@codemirror/lang-javascript";
import { EditorView } from "@codemirror/view";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import type { ResolvedVegaTheme } from "@ritchieking/react-vega";
import type { Scheme } from "../tokens";

const jsxExt = [javascript({ jsx: true, typescript: true }), EditorView.lineWrapping];
const jsonExt = [json(), EditorView.lineWrapping];

export function buildJsx(o: { mode: string; nested: boolean; inherit: boolean }) {
  const lines = [
    `import { VegaEmbed, VegaThemeProvider } from "@ritchieking/react-vega";`,
    ``,
    `// "var(--chart-accent)" etc. in the theme are replaced with computed`,
    `// values first, because Vega's canvas/SVG output cannot resolve var().`,
    `const theme = useMemo(() => resolveCssVariables(rawTheme), [rawTheme, tokens]);`,
    ``,
    `<VegaThemeProvider theme={theme} variant="${o.mode}">`,
    `  <VegaEmbed spec={barSpec} />`,
    `  <VegaEmbed spec={lineSpec} />`,
  ];
  if (o.nested) {
    lines.push(
      ``,
      o.inherit ? `  {/* merges on top of the page theme */}` : `  {/* starts from a clean slate: parent theme and variant ignored */}`,
      o.inherit ? `  <VegaThemeProvider theme={highlightTheme}>` : `  <VegaThemeProvider theme={highlightTheme} inherit={false}>`,
      `    <VegaEmbed spec={nestedBarSpec} />`,
      `  </VegaThemeProvider>`,
    );
  }
  lines.push(`</VegaThemeProvider>`);
  return lines.join("\n");
}

export function CodePanel(props: {
  scheme: Scheme;
  mode: string;
  inherit: boolean;
  page: ResolvedVegaTheme | null;
  nested: ResolvedVegaTheme | null;
}) {
  const { scheme, mode, inherit, page, nested } = props;
  const [tab, setTab] = useState<"jsx" | "resolved">("jsx");
  const [scope, setScope] = useState<"page" | "nested">("page");
  const jsx = useMemo(() => buildJsx({ mode, nested: true, inherit }), [mode, inherit]);
  const resolved = scope === "page" ? page : nested;
  const resolvedText = useMemo(() => (resolved ? JSON.stringify(resolved, null, 2) : "{}"), [resolved]);
  const theme = scheme === "dark" ? githubDark : githubLight;

  return (
    <section className="panel code" aria-labelledby="code-h">
      <header className="panel__head">
        <div>
          <h2 id="code-h">Code</h2>
          <p>What the current controls amount to, and what the charts actually receive.</p>
        </div>
        <div className="tabs" role="tablist" aria-label="Code views">
          <button role="tab" type="button" aria-selected={tab === "jsx"} onClick={() => setTab("jsx")}>
            JSX
          </button>
          <button role="tab" type="button" aria-selected={tab === "resolved"} onClick={() => setTab("resolved")}>
            Resolved config
          </button>
        </div>
      </header>
      {tab === "resolved" && (
        <div className="code__scope">
          <span>
            From <code>useVegaTheme()</code> inside the
          </span>
          <select value={scope} onChange={(e) => setScope(e.target.value as "page" | "nested")} aria-label="Provider scope">
            <option value="page">page provider</option>
            <option value="nested">nested provider ({inherit ? "inherit" : "inherit={false}"})</option>
          </select>
        </div>
      )}
      <div className="code__body">
        {tab === "jsx" ? (
          <CodeMirror value={jsx} theme={theme} extensions={jsxExt} editable={false} height="auto" maxHeight="440px" basicSetup={{ lineNumbers: false, foldGutter: false, highlightActiveLine: false }} />
        ) : (
          <CodeMirror value={resolvedText} theme={theme} extensions={jsonExt} editable={false} height="auto" maxHeight="440px" basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: false }} />
        )}
      </div>
    </section>
  );
}
