import { LINKS, hasUpstreamPr } from "../links";
import { Segmented } from "./Segmented";

export type Mode = "light" | "dark" | "auto";
type Page = "playground" | "compare";

/** Pages are siblings under the same base, so links are relative to the current page. */
const HREFS: Record<Page, Record<Page, string>> = {
  playground: { playground: "./", compare: "compare/" },
  compare: { playground: "../", compare: "./" },
};

export function SiteHeader(props: { page: Page; mode: Mode; onMode: (mode: Mode) => void }) {
  const { page, mode, onMode } = props;
  const href = HREFS[page];
  return (
    <header className="topbar">
      <div className="topbar__inner">
        <a className="brand" href={href.playground} aria-label="VegaThemeProvider demo home">
          <span className="brand__mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>VegaThemeProvider</span>
        </a>
        <nav className="pages" aria-label="Pages">
          <a href={href.playground} aria-current={page === "playground" ? "page" : undefined}>
            Playground
          </a>
          <a href={href.compare} aria-current={page === "compare" ? "page" : undefined}>
            Before &amp; after
          </a>
        </nav>
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
          onChange={onMode}
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
            { value: "auto", label: "Auto" },
          ]}
        />
      </div>
    </header>
  );
}
