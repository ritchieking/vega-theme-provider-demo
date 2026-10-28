import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { VegaEmbed } from "@ritchieking/react-vega";
import type { EmbedOptions, VisualizationSpec } from "vega-embed";
import { useThemeStatus } from "../ThemeStatus";

export function useContainerWidth<T extends HTMLElement>(step = 8) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.floor(entry.contentRect.width / step) * step;
      setWidth((prev) => (prev === w ? prev : w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [step]);
  return [ref, width] as const;
}

export function Chart({ spec, options, label }: { spec: VisualizationSpec; options?: EmbedOptions; label: string }) {
  const status = useThemeStatus();
  const [error, setError] = useState<string | null>(null);
  const { id, ok, fail } = status;
  const onEmbed = useCallback(() => {
    setError(null);
    ok(id);
  }, [ok, id]);
  const onError = useCallback(
    (e: unknown) => {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      fail(id, msg);
    },
    [fail, id],
  );
  // Vega reports bad config (e.g. an unknown color scheme) through its logger
  // instead of throwing, so route errors from it to the same failure path.
  const embedOptions = useMemo<EmbedOptions>(() => {
    const logger = {
      level() { return logger; },
      error(...args: unknown[]) {
        const msg = args.map((a) => (a instanceof Error ? a.message : String(a))).join(" ");
        setError(msg);
        fail(id, msg);
        return logger;
      },
      warn() { return logger; },
      info() { return logger; },
      debug() { return logger; },
    };
    return { ...options, logger } as EmbedOptions;
  }, [options, fail, id]);
  return (
    <div className="chart" role="img" aria-label={label}>
      <VegaEmbed spec={spec} options={embedOptions} onEmbed={onEmbed} onError={onError} className="chart__embed" />
      {error && <p className="chart__error">Chart failed to render: {error}</p>}
    </div>
  );
}

export function ChartCard(props: {
  title: string;
  kicker: string;
  note?: string;
  wide?: boolean;
  spec: VisualizationSpec;
  options?: EmbedOptions;
}) {
  const { title, kicker, note, wide, spec, options } = props;
  return (
    <figure className={`card ${wide ? "card--wide" : ""}`}>
      <figcaption>
        <span className="card__kicker">{kicker}</span>
        <h3>{title}</h3>
      </figcaption>
      <Chart spec={spec} options={options} label={`${kicker}: ${title}`} />
      {note && <p className="card__note">{note}</p>}
    </figure>
  );
}
