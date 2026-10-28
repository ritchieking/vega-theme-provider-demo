import { VegaThemeProvider, type VegaTheme } from "@ritchieking/react-vega";
import { ChartCard } from "./ChartCard";
import { nestedBarSpec, nestedLineSpec } from "../specs";
import { ThemeProbe } from "./ThemeProbe";
import type { ResolvedVegaTheme } from "@ritchieking/react-vega";

export function NestedPanel(props: {
  theme: VegaTheme;
  inherit: boolean;
  onInherit: (v: boolean) => void;
  onResolved: (t: ResolvedVegaTheme) => void;
}) {
  const { theme, inherit, onInherit, onResolved } = props;
  return (
    <section className="panel nested" data-clean={!inherit} aria-labelledby="nested-h">
      <header className="panel__head">
        <div>
          <h2 id="nested-h">Nested provider</h2>
          <p>
            An inner <code>{"<VegaThemeProvider>"}</code> adds a muted-marks, one-highlight theme on top of the page theme.
          </p>
        </div>
        <label className="switch">
          <input type="checkbox" role="switch" checked={inherit} onChange={(e) => onInherit(e.target.checked)} />
          <span className="switch__track" aria-hidden="true" />
          <span className="switch__label">
            <code>inherit={`{${inherit}}`}</code>
            <small>{inherit ? "Merges over the page theme" : "Clean slate: page theme ignored"}</small>
          </span>
        </label>
      </header>
      <VegaThemeProvider theme={theme} inherit={inherit}>
        <ThemeProbe onResolved={onResolved} />
        <div className="gallery gallery--nested">
          <ChartCard kicker="Inner theme" title="Busiest model year" spec={nestedBarSpec} />
          <ChartCard kicker="Inner theme" title="Latest week, highlighted" spec={nestedLineSpec} />
        </div>
      </VegaThemeProvider>
    </section>
  );
}
