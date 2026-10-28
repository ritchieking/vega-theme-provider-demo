import { FONT_STACKS, TOKEN_GROUPS, type TokenControl, type TokenName, type Tokens } from "../tokens";

type Props = {
  tokens: Tokens;
  overridden: Set<TokenName>;
  onChange: (name: TokenName, value: string) => void;
  onReset: () => void;
};

function toHex(v: string) {
  return /^#[0-9a-f]{6}$/i.test(v) ? v : "#000000";
}

function fontKey(value: string) {
  return (Object.keys(FONT_STACKS) as (keyof typeof FONT_STACKS)[]).find((k) => FONT_STACKS[k] === value) ?? "custom";
}

function Row({ c, tokens, onChange, changed }: { c: TokenControl; tokens: Tokens; onChange: Props["onChange"]; changed: boolean }) {
  const value = tokens[c.name];
  const id = `tok-${c.name.slice(2)}`;
  return (
    <div className={`token ${changed ? "token--changed" : ""}`}>
      <div className="token__head">
        <label htmlFor={id}>{c.label}</label>
        <code className="token__name">{c.name}</code>
      </div>
      <div className="token__control">
        {c.kind === "color" && (
          <>
            <input id={id} type="color" value={toHex(value)} onChange={(e) => onChange(c.name, e.target.value)} />
            <output>{value}</output>
          </>
        )}
        {c.kind === "range" && (
          <>
            <input id={id} type="range" min={c.min} max={c.max} step={c.step} value={Number(value)} onChange={(e) => onChange(c.name, e.target.value)} />
            <output>
              {Number(value)}
              {c.unit}
            </output>
          </>
        )}
        {c.kind === "font" && (
          <select id={id} value={fontKey(value)} onChange={(e) => onChange(c.name, FONT_STACKS[e.target.value as keyof typeof FONT_STACKS])}>
            {fontKey(value) === "custom" && <option value="custom">Custom</option>}
            <option value="sans">Sans</option>
            <option value="serif">Serif</option>
            <option value="humanist">Humanist</option>
            <option value="mono">Mono</option>
          </select>
        )}
      </div>
    </div>
  );
}

export function TokenControls({ tokens, overridden, onChange, onReset }: Props) {
  return (
    <div className="tokens">
      <p className="hint">
        The theme refers to these as <code>"var(--chart-accent)"</code> and friends. The page CSS reads the same variables.
      </p>
      {TOKEN_GROUPS.map((g) => (
        <fieldset key={g.title} className="tokens__group">
          <legend>{g.title}</legend>
          {g.controls.map((c) => (
            <Row key={c.name} c={c} tokens={tokens} onChange={onChange} changed={overridden.has(c.name)} />
          ))}
        </fieldset>
      ))}
      <button type="button" className="btn btn--ghost" onClick={onReset} disabled={overridden.size === 0}>
        Reset tokens to preset
      </button>
    </div>
  );
}
