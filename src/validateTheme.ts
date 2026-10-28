import type { VegaTheme } from "@ritchieking/react-vega";

export type ThemeParse =
  | { ok: true; theme: VegaTheme }
  | { ok: false; message: string; line?: number; col?: number };

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

function lineCol(text: string, pos: number) {
  const before = text.slice(0, pos);
  const line = before.split("\n").length;
  return { line, col: pos - before.lastIndexOf("\n") };
}

function checkLayer(layer: unknown, path: string): string | null {
  if (!isObj(layer)) return `${path} must be an object`;
  for (const key of Object.keys(layer)) {
    if (key !== "config" && key !== "options") return `${path}: unknown key "${key}" (expected "config" or "options")`;
  }
  if (layer.config !== undefined && !isObj(layer.config)) return `${path}.config must be an object`;
  if (layer.options !== undefined) {
    if (!isObj(layer.options)) return `${path}.options must be an object`;
    if ("config" in layer.options) return `${path}.options must not contain "config"; put it at ${path}.config`;
  }
  return null;
}

/** Parse and shape-check theme JSON. Never throws. */
export function parseTheme(text: string): ThemeParse {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch (e) {
    const raw = e instanceof Error ? e.message : String(e);
    const m = /position (\d+)/.exec(raw);
    const pos = m ? Number(m[1]) : undefined;
    const message = raw.replace(/\s*\(line \d+ column \d+\)/, "");
    return pos === undefined ? { ok: false, message } : { ok: false, message, ...lineCol(text, pos) };
  }
  if (!isObj(value)) return { ok: false, message: "A theme must be a JSON object, e.g. { \"config\": { ... } }" };
  for (const key of Object.keys(value)) {
    if (!["config", "options", "variants"].includes(key)) {
      return { ok: false, message: `Unknown top-level key "${key}". Expected "config", "options" or "variants".` };
    }
  }
  const base = checkLayer({ config: value.config, options: value.options }, "theme");
  if (base) return { ok: false, message: base };
  if (value.variants !== undefined) {
    if (!isObj(value.variants)) return { ok: false, message: "theme.variants must be an object keyed by variant name" };
    for (const [name, layer] of Object.entries(value.variants)) {
      const err = checkLayer(layer, `theme.variants.${name}`);
      if (err) return { ok: false, message: err };
    }
  }
  return { ok: true, theme: value as VegaTheme };
}
