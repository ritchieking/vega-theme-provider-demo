// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { resolveCssVariables } from "./resolveCssVariables";

function host(vars: Record<string, string>) {
  const el = document.createElement("div");
  for (const [k, v] of Object.entries(vars)) el.style.setProperty(k, v);
  document.body.appendChild(el);
  return el;
}
afterEach(() => {
  document.body.innerHTML = "";
  document.documentElement.removeAttribute("style");
});

describe("resolveCssVariables", () => {
  it("resolves a variable from the given element", () => {
    const el = host({ "--a": " #ff0000 " });
    expect(resolveCssVariables({ c: "var(--a)" }, el)).toEqual({ c: "#ff0000" });
  });
  it("defaults to documentElement", () => {
    document.documentElement.style.setProperty("--root", "blue");
    expect(resolveCssVariables("var(--root)")).toBe("blue");
  });
  it("replaces several occurrences inside one string", () => {
    const el = host({ "--f": "Inter", "--g": "serif" });
    expect(resolveCssVariables("var(--f), var(--g), sans-serif", el)).toBe("Inter, serif, sans-serif");
  });
  it("uses fallbacks, including nested ones", () => {
    const el = host({ "--b": "green" });
    expect(resolveCssVariables("var(--missing, orange)", el)).toBe("orange");
    expect(resolveCssVariables("var(--a, var(--b, red))", el)).toBe("green");
    expect(resolveCssVariables("var(--a, var(--c, red))", el)).toBe("red");
  });
  it("uses the fallback when the value is empty", () => {
    const el = host({ "--e": "   " });
    expect(resolveCssVariables("var(--e, 3px)", el)).toBe(3);
  });
  it("leaves the original text when unresolved and no fallback", () => {
    const el = host({});
    expect(resolveCssVariables("1px solid var(--nope)", el)).toBe("1px solid var(--nope)");
  });
  it("returns numbers for a whole-string numeric var()", () => {
    const el = host({ "--n": "12", "--px": "14px", "--dec": "0.5", "--neg": "-2" });
    expect(resolveCssVariables({ a: "var(--n)", b: "var(--px)", c: "var(--dec)", d: "var(--neg)" }, el)).toEqual({
      a: 12, b: 14, c: 0.5, d: -2,
    });
  });
  it("keeps strings when numeric var() is only part of a string", () => {
    const el = host({ "--n": "12" });
    expect(resolveCssVariables("var(--n) 4", el)).toBe("12 4");
    expect(resolveCssVariables("calc(var(--n) * 2)", el)).toBe("calc(12 * 2)");
  });
  it("does not coerce non-numeric whole values", () => {
    const el = host({ "--v": "12em" });
    expect(resolveCssVariables("var(--v)", el)).toBe("12em");
  });
  it("walks arrays and nested objects without mutating the input", () => {
    const el = host({ "--c": "teal" });
    const input = { a: [{ x: "var(--c)" }, "plain", 3, null, true], b: { c: { d: "var(--c)" } } };
    const snapshot = JSON.parse(JSON.stringify(input));
    const out = resolveCssVariables(input, el);
    expect(out).toEqual({ a: [{ x: "teal" }, "plain", 3, null, true], b: { c: { d: "teal" } } });
    expect(input).toEqual(snapshot);
    expect(out).not.toBe(input);
  });
  it("passes through non-plain values untouched", () => {
    const d = new Date();
    expect(resolveCssVariables(d)).toBe(d);
    expect(resolveCssVariables(undefined)).toBeUndefined();
  });
  it("handles malformed var() without throwing", () => {
    const el = host({});
    expect(resolveCssVariables("var(--a", el)).toBe("var(--a");
  });
});
