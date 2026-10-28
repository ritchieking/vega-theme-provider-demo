import type { VisualizationSpec } from "vega-embed";
import { cars, daily, penguins, weekly } from "./data";

/**
 * None of these specs set a color, font or font size. Everything visual comes
 * from the VegaThemeProvider.
 */
const VL = "https://vega.github.io/schema/vega-lite/v6.json";

export const barSpec = {
  $schema: VL,
  data: { values: cars },
  width: "container",
  height: 240,
  transform: [{ aggregate: [{ op: "mean", field: "mpg", as: "avg" }, { op: "count", as: "n" }], groupby: ["cylinders"] }],
  encoding: {
    x: { field: "cylinders", type: "ordinal", title: "Cylinders", axis: { labelAngle: 0 } },
    y: { field: "avg", type: "quantitative", title: "Mean miles per gallon" },
  },
  layer: [
    {
      mark: { type: "bar", tooltip: true },
      encoding: { tooltip: [{ field: "cylinders", title: "Cylinders" }, { field: "avg", title: "Mean mpg", format: ".1f" }, { field: "n", title: "Cars" }] },
    },
    { mark: { type: "text", dy: -7, baseline: "bottom" }, encoding: { text: { field: "avg", type: "quantitative", format: ".1f" } } },
  ],
} as VisualizationSpec;

export const lineSpec = {
  $schema: VL,
  data: { values: weekly },
  width: "container",
  height: 240,
  encoding: {
    x: { field: "week", type: "quantitative", title: "Week", axis: { tickMinStep: 4 }, scale: { nice: false, domain: [1, 52] } },
    y: { field: "value", type: "quantitative", title: "Index (week 0 = 100)", scale: { zero: false } },
    color: { field: "series", type: "nominal", title: null },
  },
  layer: [
    { mark: "line" },
    {
      mark: { type: "point", filled: true, size: 70 },
      params: [{ name: "hover", select: { type: "point", fields: ["week"], nearest: true, on: "pointerover", clear: "pointerout" } }],
      encoding: {
        opacity: { condition: { param: "hover", empty: false, value: 1 }, value: 0 },
        tooltip: [
          { field: "week", title: "Week" },
          { field: "series", title: "Series" },
          { field: "value", title: "Index", format: ".1f" },
        ],
      },
    },
  ],
} as VisualizationSpec;

export const scatterSpec = {
  $schema: VL,
  data: { values: cars },
  width: "container",
  height: 280,
  transform: [{ filter: "isValid(datum.mpg) && isValid(datum.horsepower)" }],
  mark: { type: "circle", tooltip: true },
  encoding: {
    x: { field: "horsepower", type: "quantitative", title: "Horsepower", scale: { zero: false } },
    y: { field: "mpg", type: "quantitative", title: "Miles per gallon", scale: { zero: false } },
    color: { field: "origin", type: "nominal", title: null },
    tooltip: [
      { field: "name", title: "Model" },
      { field: "origin", title: "Origin" },
      { field: "horsepower", title: "Horsepower" },
      { field: "mpg", title: "Miles per gallon" },
    ],
  },
} as VisualizationSpec;

/** Concat views cannot use width "container", so the width is computed by the caller. */
export const brushSpec = (width: number): VisualizationSpec => ({
  $schema: VL,
  data: { values: daily },
  vconcat: [
    {
      width,
      height: 190,
      mark: { type: "area", line: true, tooltip: true },
      encoding: {
        x: { field: "date", type: "temporal", title: null, scale: { domain: { param: "brush" } } },
        y: { field: "value", type: "quantitative", title: "Daily sessions", scale: { zero: false } },
        tooltip: [{ field: "date", type: "temporal", title: "Date", format: "%b %-d, %Y" }, { field: "value", title: "Sessions" }],
      },
    },
    {
      width,
      height: 54,
      mark: { type: "area", line: true },
      params: [
        {
          name: "brush",
          select: { type: "interval", encodings: ["x"] },
          value: { x: [{ year: 2025, month: 3, date: 1 }, { year: 2025, month: 8, date: 1 }] },
        },
      ],
      encoding: {
        x: { field: "date", type: "temporal", title: "Drag across the overview to zoom the chart above" },
        y: { field: "value", type: "quantitative", title: null, axis: { tickCount: 2 }, scale: { zero: false } },
      },
    },
  ],
}) as VisualizationSpec;

/** Small multiples. Width is per panel, so it is computed from the container. */
export function facetSpec(panelWidth: number, columns: number): VisualizationSpec {
  return {
    $schema: VL,
    data: { values: penguins },
    facet: { field: "species", type: "nominal", title: null },
    columns,
    spec: {
      width: panelWidth,
      height: 130,
      mark: { type: "bar", tooltip: true },
      encoding: {
        x: { field: "mass", type: "quantitative", bin: { maxbins: 12 }, title: "Body mass (g)", axis: { tickCount: 3, format: ",d" } },
        y: { aggregate: "count", type: "quantitative", title: "Penguins", axis: { tickCount: 3 } },
        color: { field: "species", type: "nominal", legend: null },
      },
    },
    resolve: { scale: { y: "shared" } },
  } as VisualizationSpec;
}

/** Raw Vega (not Vega-Lite): a donut with a centered total. */
export const donutSpec = (width: number): VisualizationSpec => ({
  $schema: "https://vega.github.io/schema/vega/v6.json",
  width,
  height: 240,
  signals: [{ name: "radius", update: "min(width, height) / 2 - 6" }],
  data: [
    { name: "cars", values: cars },
    {
      name: "byOrigin",
      source: "cars",
      transform: [
        { type: "aggregate", groupby: ["origin"], as: ["count"] },
        { type: "pie", field: "count", sort: true },
      ],
    },
    { name: "total", source: "cars", transform: [{ type: "aggregate", as: ["n"] }] },
  ],
  scales: [{ name: "color", type: "ordinal", domain: { data: "byOrigin", field: "origin" }, range: "category" }],
  legends: [{ fill: "color" }],
  marks: [
    {
      type: "arc",
      from: { data: "byOrigin" },
      encode: {
        enter: { tooltip: { signal: "{'Origin': datum.origin, 'Cars': datum.count}" } },
        update: {
          fill: { scale: "color", field: "origin" },
          x: { signal: "width / 2" },
          y: { signal: "height / 2" },
          startAngle: { field: "startAngle" },
          endAngle: { field: "endAngle" },
          innerRadius: { signal: "radius * 0.62" },
          outerRadius: { signal: "radius" },
          padAngle: { value: 0.02 },
          cornerRadius: { value: 3 },
        },
      },
    },
    {
      type: "text",
      from: { data: "total" },
      encode: {
        update: {
          x: { signal: "width / 2" },
          y: { signal: "height / 2 - 4" },
          align: { value: "center" },
          baseline: { value: "middle" },
          text: { field: "n" },
          fontSize: { value: 30 },
          fontWeight: { value: 600 },
        },
      },
    },
    {
      type: "text",
      encode: {
        update: {
          x: { signal: "width / 2" },
          y: { signal: "height / 2 + 22" },
          align: { value: "center" },
          text: { value: "cars" },
        },
      },
    },
  ],
}) as VisualizationSpec;

/** Nested-panel charts. */
export const nestedBarSpec = {
  $schema: VL,
  data: { values: cars },
  width: "container",
  height: 150,
  transform: [
    { aggregate: [{ op: "count", as: "n" }], groupby: ["year"] },
    { joinaggregate: [{ op: "max", field: "n", as: "top" }] },
  ],
  encoding: {
    x: { field: "year", type: "ordinal", title: null, axis: { labelAngle: 0, labelOverlap: "parity" } },
    y: { field: "n", type: "quantitative", title: "Cars per model year", axis: { tickCount: 3 } },
  },
  layer: [
    { mark: "bar" },
    {
      transform: [{ filter: "datum.n === datum.top" }],
      mark: { type: "bar", style: "highlight", tooltip: true },
      encoding: { tooltip: [{ field: "year", title: "Model year" }, { field: "n", title: "Cars" }] },
    },
  ],
} as VisualizationSpec;

export const nestedLineSpec = {
  $schema: VL,
  data: { values: weekly.filter((d) => d.series === "Alder") },
  width: "container",
  height: 150,
  transform: [{ joinaggregate: [{ op: "max", field: "week", as: "last" }] }],
  encoding: {
    x: { field: "week", type: "quantitative", title: null, axis: { tickMinStep: 13 }, scale: { nice: false, domain: [1, 52] } },
    y: { field: "value", type: "quantitative", title: "Alder index", axis: { tickCount: 3 }, scale: { zero: false } },
  },
  layer: [
    { mark: "line" },
    {
      transform: [{ filter: "datum.week === datum.last" }],
      mark: { type: "point", style: "highlight", filled: true, size: 90, tooltip: true },
      encoding: { tooltip: [{ field: "week", title: "Week" }, { field: "value", title: "Index" }] },
    },
  ],
} as VisualizationSpec;
