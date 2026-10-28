/**
 * Replace CSS custom-property references (`var(--name)` / `var(--name, fallback)`)
 * inside a config object with their computed values.
 *
 * Vega renders to canvas/SVG attributes, which cannot resolve `var()`, so the
 * references have to be resolved to concrete values before the config is
 * handed to vega-embed.
 *
 * - Deep-walks plain objects and arrays; never mutates the input.
 * - Supports nested fallbacks: `var(--a, var(--b, red))`.
 * - Empty/undefined variable -> fallback; no fallback -> original text kept.
 * - A string that is exactly one `var()` resolving to a plain number
 *   (optionally with `px`) becomes a number, so `fontSize: "var(--x)"` works.
 *
 * Self-contained and dependency-free so it can move into a library unchanged.
 */
export function resolveCssVariables<T>(config: T, el?: Element): T {
  const target: Element =
    el ?? (typeof document !== "undefined" ? document.documentElement : (undefined as never));
  const style = getComputedStyle(target);
  return walk(config, style) as T;
}

const NUMERIC = /^-?(?:\d+\.?\d*|\.\d+)(?:px)?$/;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  if (v === null || typeof v !== "object") return false;
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
}

function walk(value: unknown, style: CSSStyleDeclaration): unknown {
  if (typeof value === "string") return resolveString(value, style);
  if (Array.isArray(value)) return value.map((v) => walk(v, style));
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = walk(v, style);
    return out;
  }
  return value;
}

/** Find the index of the `)` matching the `(` at `open`, or -1. */
function matchParen(s: string, open: number): number {
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === "(") depth++;
    else if (s[i] === ")" && --depth === 0) return i;
  }
  return -1;
}

function resolveString(input: string, style: CSSStyleDeclaration): string | number {
  if (!input.includes("var(")) return input;
  const text = substitute(input, style);
  const whole = input.trim();
  if (whole.startsWith("var(") && matchParen(whole, 3) === whole.length - 1) {
    const t = text.trim();
    if (NUMERIC.test(t)) return parseFloat(t);
  }
  return text;
}

function substitute(s: string, style: CSSStyleDeclaration): string {
  let out = "";
  let i = 0;
  while (i < s.length) {
    const start = s.indexOf("var(", i);
    if (start < 0) {
      out += s.slice(i);
      break;
    }
    const open = start + 3;
    const close = matchParen(s, open);
    if (close < 0) {
      out += s.slice(i);
      break;
    }
    out += s.slice(i, start);
    const original = s.slice(start, close + 1);
    const inner = s.slice(open + 1, close);
    const comma = topLevelComma(inner);
    const name = (comma < 0 ? inner : inner.slice(0, comma)).trim();
    const fallbackRaw = comma < 0 ? undefined : inner.slice(comma + 1).trim();
    const value = name.startsWith("--") ? style.getPropertyValue(name).trim() : "";
    if (value) out += substitute(value, style);
    else if (fallbackRaw !== undefined && fallbackRaw !== "") out += substitute(fallbackRaw, style);
    else out += original;
    i = close + 1;
  }
  return out;
}

function topLevelComma(s: string): number {
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "(") depth++;
    else if (s[i] === ")") depth--;
    else if (s[i] === "," && depth === 0) return i;
  }
  return -1;
}
