import { useMemo } from "react";
import { ChartCard, Chart, useContainerWidth } from "./ChartCard";
import { barSpec, brushSpec, donutSpec, facetSpec, lineSpec, scatterSpec } from "../specs";

function FacetCard() {
  const [ref, width] = useContainerWidth<HTMLDivElement>(16);
  const columns = width >= 560 ? 3 : 1;
  const panel = Math.max(120, Math.floor(width / columns) - (columns === 3 ? 62 : 76));
  const spec = useMemo(() => facetSpec(panel, columns), [panel, columns]);
  return (
    <figure className="card card--wide">
      <figcaption>
        <span className="card__kicker">Vega-Lite, facet</span>
        <h3>Penguin body mass by species</h3>
      </figcaption>
      <div ref={ref}>{width > 0 && <Chart spec={spec} label="Small multiples of body mass by species" />}</div>
      <p className="card__note">Color follows the species, not its position in the list.</p>
    </figure>
  );
}

function DonutCard() {
  const [ref, width] = useContainerWidth<HTMLDivElement>(16);
  const spec = useMemo(() => donutSpec(Math.max(160, width - 4)), [width]);
  return (
    <figure className="card">
      <figcaption>
        <span className="card__kicker">Vega, raw spec</span>
        <h3>Cars in the dataset, by origin</h3>
      </figcaption>
      <div ref={ref}>{width > 0 && <Chart spec={spec} label="Donut chart of cars by origin" />}</div>
      <p className="card__note">A plain Vega spec, themed by the same config.</p>
    </figure>
  );
}

function BrushCard() {
  const [ref, width] = useContainerWidth<HTMLDivElement>(16);
  const spec = useMemo(() => brushSpec(Math.max(200, width - 64)), [width]);
  return (
    <figure className="card card--wide">
      <figcaption>
        <span className="card__kicker">Vega-Lite, interval brush</span>
        <h3>Daily sessions: overview and detail</h3>
      </figcaption>
      <div ref={ref}>{width > 0 && <Chart spec={spec} label="Area chart with an overview brush" />}</div>
      <p className="card__note">Synthetic data (seeded). Drag in the lower chart to zoom the upper one.</p>
    </figure>
  );
}

export function Gallery() {
  return (
    <div className="gallery">
      <ChartCard kicker="Vega-Lite, bar" title="Fuel economy by cylinder count" spec={barSpec} note="Rounded data ends come from --chart-bar-radius." />
      <ChartCard kicker="Vega-Lite, line" title="Four series, indexed weekly" spec={lineSpec} note="Synthetic data (seeded). Hover for values." />
      <ChartCard kicker="Vega-Lite, scatter" title="Horsepower against fuel economy" spec={scatterSpec} />
      <DonutCard />
      <BrushCard />
      <FacetCard />
    </div>
  );
}
